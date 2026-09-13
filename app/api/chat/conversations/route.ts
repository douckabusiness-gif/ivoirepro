import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryConversations } from '@/lib/inMemoryChat';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';

const CHAT_STAFF_ROLES = ['admin', 'vendeur', 'support'] as const;

async function requireChatStaff(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    return session && hasAdminRole(session, CHAT_STAFF_ROLES) ? session : null;
  } catch {
    return null;
  }
}

// GET /api/chat/conversations
export async function GET(request: Request) {
  if (!await requireChatStaff(request)) {
    return NextResponse.json({ error: 'Accès support requis.' }, { status: 403 });
  }

  try {
    const conversations = await Promise.race([
      prisma.chatConversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Prisma timeout')), 600))
    ]);

    return NextResponse.json({ conversations });
  } catch (error) {
    // Return in-memory fallback immediately
    return NextResponse.json({ conversations: inMemoryConversations });
  }
}

// DELETE /api/chat/conversations?id=...
export async function DELETE(request: Request) {
  if (!await requireChatStaff(request)) {
    return NextResponse.json({ error: 'Accès support requis.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
    }

    try {
      await Promise.race([
        prisma.chatConversation.delete({ where: { id } }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Prisma timeout')), 600))
      ]);
    } catch {
      const idx = inMemoryConversations.findIndex(c => c.id === id);
      if (idx !== -1) inMemoryConversations.splice(idx, 1);
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Chat conversation deletion error:', error);
    return NextResponse.json({ error: 'Impossible de supprimer la conversation.' }, { status: 500 });
  }
}
