import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionVersion?: number;
  isDemo?: boolean;
  exp: number;
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return secret || 'boutique_default_secure_jwt_secret_2026';
};

// Legacy/demo sessions are only useful during an explicitly local run. A
// staging or otherwise mislabelled environment must never inherit the bypass.
const isLegacySessionAllowed = () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export function isDemoModeEnabled() {
  return isLegacySessionAllowed() && process.env.ENABLE_DEMO_MODE !== 'false';
}

export function hasAdminRole(session: AdminTokenPayload, allowedRoles: readonly string[]) {
  return Boolean(session.isDemo) || allowedRoles.includes(session.role);
}

/**
 * Sign an admin session payload with HMAC-SHA256
 */
export function signAdminToken(
  payload: Omit<AdminTokenPayload, 'exp'>,
  expiresInDays: number = 7
): string {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const fullPayload: AdminTokenPayload = { ...payload, exp };
  const dataStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  return `${dataStr}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature and expiration
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(dataStr, 'base64url').toString('utf8')
    );
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      Date.now() >= payload.exp
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validates the admin session from cookies or Authorization header.
 * Returns the decoded AdminTokenPayload if valid, or null if unauthorized.
 */
export async function verifyAdminSession(request?: Request): Promise<AdminTokenPayload | null> {
  const validatePayload = async (payload: AdminTokenPayload | null) => {
    if (!payload) return null;
    if (payload.isDemo) return isDemoModeEnabled() ? payload : null;
    if (!payload.userId) return null;
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, sessionVersion: true },
      });
      if (
        !user ||
        user.role !== payload.role ||
        (payload.sessionVersion ?? 0) !== user.sessionVersion
      ) {
        return null;
      }
      return {
        ...payload,
        email: user.email,
        role: user.role,
        sessionVersion: user.sessionVersion,
      };
    } catch {
      return null;
    }
  };

  // 1. Check Next.js cookies store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (token) {
      const verified = verifyAdminToken(token);
      const validated = await validatePayload(verified);
      if (validated) return validated;
    }
  } catch {
    // Fallback if called outside React/Next Server Component cookie context
  }

  // 2. Check Request headers if passed
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const verified = verifyAdminToken(token);
      const validated = await validatePayload(verified);
      if (validated) return validated;
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    if (match && match[1]) {
      const verified = verifyAdminToken(decodeURIComponent(match[1]));
      const validated = await validatePayload(verified);
      if (validated) return validated;
    }
  }

  return null;
}

export interface PartnerTokenPayload {
  partnerId: string;
  email: string;
  slug: string;
  exp: number;
}

/**
 * Sign a partner session payload with HMAC-SHA256
 */
export function signPartnerToken(
  payload: Omit<PartnerTokenPayload, 'exp'>,
  expiresInDays: number = 30
): string {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const fullPayload: PartnerTokenPayload = { ...payload, exp };
  const dataStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  return `${dataStr}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature and expiration for Partner session
 */
export function verifyPartnerToken(token: string): PartnerTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: PartnerTokenPayload = JSON.parse(
      Buffer.from(dataStr, 'base64url').toString('utf8')
    );
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.partnerId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.slug !== 'string' ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      Date.now() >= payload.exp
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validates the partner session from cookies or headers
 */
export async function verifyPartnerSession(request?: Request): Promise<PartnerTokenPayload | null> {
  // 1. Check Next.js cookies store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('partner_session')?.value;
    if (token) {
      const verified = verifyPartnerToken(token);
      if (verified) return verified;
      // Keep legacy demo cookies working only during local development.
      if (isLegacySessionAllowed()) {
        const match = token.match(/^partner_(.+)_authenticated$/);
        if (match) {
          return { partnerId: match[1], email: '', slug: '', exp: Date.now() + 86400000 };
        }
      }
    }
  } catch {
    // Cookie store not available
  }

  // 2. Check Request cookies/header
  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/partner_session=([^;]+)/);
    if (match && match[1]) {
      const rawToken = decodeURIComponent(match[1]);
      const verified = verifyPartnerToken(rawToken);
      if (verified) return verified;
      if (isLegacySessionAllowed()) {
        const legacyMatch = rawToken.match(/^partner_(.+)_authenticated$/);
        if (legacyMatch) {
          return { partnerId: legacyMatch[1], email: '', slug: '', exp: Date.now() + 86400000 };
        }
      }
    }
  }

  return null;
}

export interface CustomerTokenPayload {
  customerId: string;
  exp: number;
}

export function signCustomerToken(
  payload: Omit<CustomerTokenPayload, 'exp'>,
  expiresInDays: number = 30
): string {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const fullPayload: CustomerTokenPayload = { ...payload, exp };
  const dataStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  return `${dataStr}.${signature}`;
}

export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: CustomerTokenPayload = JSON.parse(
      Buffer.from(dataStr, 'base64url').toString('utf8')
    );
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.customerId !== 'string' ||
      !payload.customerId ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      Date.now() >= payload.exp
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyCustomerSession(request?: Request): Promise<CustomerTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_session')?.value;
    if (token) {
      const verified = verifyCustomerToken(token);
      if (verified) return verified;
      if (isLegacySessionAllowed()) {
        const match = token.match(/^customer_(.+)_authenticated$/);
        if (match) return { customerId: match[1], exp: Date.now() + 86400000 };
      }
    }
  } catch {
    // Cookie store unavailable; inspect the request below.
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/customer_session=([^;]+)/);
    if (match?.[1]) {
      const rawToken = decodeURIComponent(match[1]);
      const verified = verifyCustomerToken(rawToken);
      if (verified) return verified;
      if (isLegacySessionAllowed()) {
        const legacyMatch = rawToken.match(/^customer_(.+)_authenticated$/);
        if (legacyMatch) return { customerId: legacyMatch[1], exp: Date.now() + 86400000 };
      }
    }
  }

  return null;
}

/**
 * Signed, HttpOnly browser token used to bind anonymous chat access to the
 * browser that created the conversation. The visitor id remains in the
 * request for lookup, but is no longer treated as a bearer secret by itself.
 */
export interface VisitorChatTokenPayload {
  visitorId: string;
  exp: number;
}

export function signVisitorChatToken(visitorId: string, expiresInDays = 30): string {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const dataStr = Buffer.from(JSON.stringify({ visitorId, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  return `${dataStr}.${signature}`;
}

export function verifyVisitorChatToken(token: string): VisitorChatTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(dataStr)
    .digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload: VisitorChatTokenPayload = JSON.parse(
      Buffer.from(dataStr, 'base64url').toString('utf8'),
    );
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.visitorId !== 'string' ||
      !payload.visitorId ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      Date.now() >= payload.exp
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getVisitorChatIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)visitor_chat_session=([^;]+)/);
  if (!match?.[1]) return null;
  try {
    return verifyVisitorChatToken(decodeURIComponent(match[1]))?.visitorId || null;
  } catch {
    return null;
  }
}
