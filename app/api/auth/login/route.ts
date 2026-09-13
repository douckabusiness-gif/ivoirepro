import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isDemoModeEnabled, signAdminToken } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

function authJson(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'admin-login', max: 10, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;
    const { email, password, isDemo } = await request.json();

    if (isDemo && !isDemoModeEnabled()) {
      return authJson({ error: 'Le mode démo est désactivé.' }, 403);
    }

    // If Demo login is requested (local development only)
    if (isDemo) {
      const demoToken = signAdminToken({
        userId: 'demo-admin-id',
        email: 'demo@luxetendance.com',
        role: 'admin',
        isDemo: true,
      });

      const response = authJson({
        success: true,
        user: {
          id: 'demo-admin-id',
          email: 'demo@luxetendance.com',
          name: 'Administrateur Démo',
          role: 'admin',
        },
      });

      response.cookies.set('admin_session', demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password ||
      email.length > 254 ||
      password.length > 256
    ) {
      return authJson({ error: 'Email et mot de passe requis.' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailLimited = enforceRateLimit(
      request,
      { keyPrefix: 'admin-login-account', max: 10, windowMs: 15 * 60 * 1000, keyBy: 'identity' },
      cleanEmail,
    );
    if (emailLimited) return emailLimited;
    let user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    // On a fresh install, an admin may be bootstrapped only when both credentials
    // are explicitly configured and no administrator exists yet. Never fall back
    // to credentials committed in code or recreate a default account beside an
    // existing administrator.
    const adminCount = user
      ? 1
      : await prisma.adminUser.count({ where: { role: 'admin' } });
    if (!user && adminCount === 0) {
      const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim();
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;

      if (defaultEmail && defaultPassword &&
        cleanEmail === defaultEmail.toLowerCase() &&
        password === defaultPassword
      ) {
        const hash = await bcrypt.hash(defaultPassword, 12);
        user = await prisma.adminUser.create({
          data: {
            email: defaultEmail.toLowerCase(),
            name: 'Directeur Boutique',
            passwordHash: hash,
            role: 'admin',
          },
        });
      }
    }

    if (!user) {
      if (adminCount === 0 && (!process.env.ADMIN_DEFAULT_EMAIL || !process.env.ADMIN_DEFAULT_PASSWORD)) {
        return authJson(
          { error: 'Compte administrateur non configuré. Définissez ADMIN_DEFAULT_EMAIL et ADMIN_DEFAULT_PASSWORD.' },
          503,
        );
      }
      return authJson({ error: 'Identifiants incorrects.' }, 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return authJson({ error: 'Identifiants incorrects.' }, 401);
    }

    const response = authJson({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const token = signAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return authJson({ error: 'Impossible de traiter la connexion pour le moment.' }, 500);
  }
}
