import { NextResponse } from 'next/server';
import { runSeed } from '@/prisma/seed';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'La réinitialisation distante est désactivée en production.' }, { status: 404 });
    }
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    await runSeed();
    return NextResponse.json({ success: true, message: 'Base de données réinitialisée et synchronisée avec succès.' });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
