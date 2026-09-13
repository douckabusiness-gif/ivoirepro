import { NextResponse } from 'next/server';

type RateLimitOptions = {
  keyPrefix: string;
  max: number;
  windowMs: number;
  /** Default is an IP bucket; identity creates a stable account/visitor bucket. */
  keyBy?: 'ip' | 'identity' | 'both';
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function clientAddress(request: Request) {
  // The app is reachable only through Caddy in production. Prefer the
  // Cloudflare/Caddy-provided client address and use the last forwarded hop;
  // the first X-Forwarded-For value can be supplied by an untrusted caller.
  const cloudflare = request.headers.get('cf-connecting-ip')?.trim();
  const real = request.headers.get('x-real-ip')?.trim();
  const forwarded = request.headers.get('x-forwarded-for')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);
  return cloudflare || real || forwarded || 'unknown';
}

export function enforceRateLimit(request: Request, options: RateLimitOptions, identity = '') {
  const now = Date.now();
  const address = clientAddress(request);
  const key = options.keyBy === 'identity'
    ? `${options.keyPrefix}:identity:${identity || 'unknown'}`
    : options.keyBy === 'both' || !options.keyBy
      ? `${options.keyPrefix}:${address}:${identity || 'unknown'}`
      : `${options.keyPrefix}:ip:${address}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    if (buckets.size > 5000) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
    }
    return null;
  }

  if (current.count >= options.max) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  current.count += 1;
  return null;
}
