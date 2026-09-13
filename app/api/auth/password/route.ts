import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAdminToken, verifyAdminSession } from '@/lib/auth';
import { validateAdminPassword } from '@/lib/passwordSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || request.headers.get('host');
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return json({ error: 'Origine de la requête non autorisée.' }, 403);
    }

    const session = await verifyAdminSession(request);
    if (!session) {
      return json({ error: 'Session expirée. Reconnectez-vous.' }, 401);
    }
    if (session.isDemo) {
      return json({ error: 'Le mot de passe ne peut pas être modifié en mode démo.' }, 403);
    }

    const limited = enforceRateLimit(
      request,
      { keyPrefix: 'admin-password-change', max: 5, windowMs: 15 * 60 * 1000 },
      session.userId,
    );
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const currentPassword = body?.currentPassword;
    const newPassword = body?.newPassword;
    const confirmPassword = body?.confirmPassword;

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      typeof confirmPassword !== 'string' ||
      currentPassword.length > 256 ||
      newPassword.length > 256 ||
      confirmPassword.length > 256
    ) {
      return json({ error: 'Tous les champs sont obligatoires.' }, 400);
    }
    if (newPassword !== confirmPassword) {
      return json({ error: 'La confirmation du nouveau mot de passe ne correspond pas.' }, 400);
    }
    if (currentPassword === newPassword) {
      return json({ error: 'Le nouveau mot de passe doit être différent du mot de passe actuel.' }, 400);
    }

    const validation = validateAdminPassword(newPassword);
    if (!validation.valid) {
      return json({ error: validation.errors[0], errors: validation.errors }, 400);
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        sessionVersion: true,
      },
    });
    if (!user) {
      return json({ error: 'Compte administrateur introuvable.' }, 404);
    }

    const currentPasswordIsValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentPasswordIsValid) {
      return json({ error: 'Le mot de passe actuel est incorrect.' }, 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const update = await prisma.adminUser.updateMany({
      where: { id: user.id, sessionVersion: user.sessionVersion },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    });
    if (update.count !== 1) {
      return json({ error: 'Le compte a été modifié pendant cette opération. Reconnectez-vous.' }, 409);
    }

    const nextSessionVersion = user.sessionVersion + 1;
    const token = signAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: nextSessionVersion,
    });
    const response = json({
      success: true,
      message: 'Mot de passe modifié. Les autres sessions administrateur ont été déconnectées.',
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Admin password change error:', error);
    return json({ error: 'Impossible de modifier le mot de passe pour le moment.' }, 500);
  }
}
