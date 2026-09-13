import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const FALLBACK_ICON = '/icons/icon-192x192.svg';

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 302,
    headers: { Location: path },
  });
}

function parseDataUrl(value: string) {
  const match = value.match(/^data:([^;,]+)?(?:;base64)?,([\s\S]*)$/);
  if (!match) return null;
  const mimeType = match[1] || 'image/png';
  const payload = match[2] || '';
  const isBase64 = value.includes(';base64,');
  try {
    return {
      mimeType,
      bytes: isBase64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload)),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  let iconUrl = '';
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      select: { pwaIconUrl: true },
    });
    iconUrl = settings?.pwaIconUrl?.trim() || '';
  } catch {
    iconUrl = '';
  }

  if (!iconUrl) {
    return redirectTo(FALLBACK_ICON);
  }

  const parsed = parseDataUrl(iconUrl);
  if (parsed) {
    return new NextResponse(parsed.bytes, {
      headers: {
        'Content-Type': parsed.mimeType,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // Keep externally hosted icons supported without proxying or downloading them.
  if (/^https?:\/\//i.test(iconUrl)) {
    return redirectTo(iconUrl);
  }

  return redirectTo(FALLBACK_ICON);
}
