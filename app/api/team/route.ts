import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { validateAdminPassword } from '@/lib/passwordSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';

// Valid roles
const VALID_ROLES: UserRole[] = ['admin', 'vendeur', 'gestionnaire_stock', 'support', 'gestionnaire_livraison'];

// GET /api/team - List all team members (Admins only)
export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // In demo mode or if user is admin, fetch all admin users
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ success: true, team: users });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la récupération de l’équipe' },
      { status: 500 }
    );
  }
}

// POST /api/team - Create a new team member (Admins only)
export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Only actual admins or demo admins can add members
    if (session.role !== 'admin' && !session.isDemo) {
      return NextResponse.json(
        { error: 'Seul le Super Admin peut créer des membres d’équipe.' },
        { status: 403 }
      );
    }

    const limited = enforceRateLimit(
      request,
      { keyPrefix: 'admin-team-create', max: 20, windowMs: 15 * 60 * 1000 },
      session.userId,
    );
    if (limited) return limited;

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont obligatoires.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = VALID_ROLES.includes(role) ? role : 'vendeur';

    const passwordValidation = validateAdminPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0], errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Un collaborateur avec l’adresse "${cleanEmail}" existe déjà.` },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, member: newUser });
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création du membre' },
      { status: 500 }
    );
  }
}
