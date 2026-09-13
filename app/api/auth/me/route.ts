import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let name = 'Administrateur';
    let role = session.role || 'admin';

    if (session.userId && !session.isDemo) {
      const dbUser = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { name: true, role: true },
      });
      if (dbUser) {
        name = dbUser.name;
        role = dbUser.role;
      }
    } else if (session.isDemo) {
      name = 'Administrateur Démo';
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        name,
        role,
        isDemo: Boolean(session.isDemo),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Admin session lookup error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Impossible de vérifier la session.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
