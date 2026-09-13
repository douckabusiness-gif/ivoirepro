import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DATABASE_TIMEOUT_MS = 2500;

export async function GET() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database health check timeout')), DATABASE_TIMEOUT_MS);
      }),
    ]);

    return NextResponse.json(
      { status: 'ok', database: 'connected' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch {
    return NextResponse.json(
      { status: 'unavailable', database: 'disconnected' },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}
