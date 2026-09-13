import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAdminSession } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { validateAdminPassword } from '@/lib/passwordSecurity';
import { enforceRateLimit } from '@/lib/rateLimit';

const VALID_ROLES: UserRole[] = ['admin', 'vendeur', 'gestionnaire_stock', 'support', 'gestionnaire_livraison'];

// PATCH /api/team/[id] - Update a team member's role, name, or password
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.role !== 'admin' && !session.isDemo) {
      return NextResponse.json(
        { error: 'Action réservée au Super Admin.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, password } = body;

    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    // Protection: Prevent demoting the last remaining admin
    if (role && role !== 'admin' && targetUser.role === 'admin') {
      const adminCount = await prisma.adminUser.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de rétrograder le dernier Administrateur de la boutique.' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (role && VALID_ROLES.includes(role)) updateData.role = role;
    if (password !== undefined && password !== null) {
      if (typeof password !== 'string' || !password.length) {
        return NextResponse.json(
          { error: 'Le mot de passe fourni est invalide.' },
          { status: 400 }
        );
      }
      if (session.isDemo) {
        return NextResponse.json(
          { error: 'Le mot de passe ne peut pas être modifié en mode démo.' },
          { status: 403 }
        );
      }
      const limited = enforceRateLimit(
        request,
        { keyPrefix: 'admin-team-password-reset', max: 10, windowMs: 15 * 60 * 1000 },
        `${session.userId}:${id}`,
      );
      if (limited) return limited;

      const validation = validateAdminPassword(password);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors[0], errors: validation.errors },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
      updateData.sessionVersion = { increment: 1 };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune modification valide à enregistrer.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, member: updatedUser });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur de mise à jour du collaborateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id] - Remove a team member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.role !== 'admin' && !session.isDemo) {
      return NextResponse.json(
        { error: 'Action réservée au Super Admin.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Protection: Prevent deleting yourself or the last remaining admin
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte administrateur actif.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    if (targetUser.role === 'admin') {
      const adminCount = await prisma.adminUser.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier Administrateur de la boutique.' },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
