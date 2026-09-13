import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryConversations, inMemoryMessages } from '@/lib/inMemoryChat';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import {
  CHAT_CONVERSATION_ID_MAX_LENGTH,
  CHAT_VISITOR_ID_MAX_LENGTH,
  getVisitorChatIdFromRequest,
  normalizeChatId,
} from '@/lib/chatSecurity';

const DB_TIMEOUT_MS = 600;
const CHAT_STAFF_ROLES = ['admin', 'vendeur', 'support'] as const;

function timeout<T>(ms = DB_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Prisma timeout')), ms);
  });
}

function invalidIdResponse(field: string) {
  return NextResponse.json({ error: `${field} invalide.` }, { status: 400 });
}

// PUT /api/chat/read
// Body: { conversationId, reader: 'admin' | 'visitor', visitorId? }
export async function PUT(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const conversationId = normalizeChatId(input.conversationId, CHAT_CONVERSATION_ID_MAX_LENGTH);
    const requestedVisitorId = normalizeChatId(input.visitorId, CHAT_VISITOR_ID_MAX_LENGTH);
    const reader = input.reader === undefined ? 'admin' : input.reader;

    if (conversationId === null) return invalidIdResponse('conversationId');
    if (requestedVisitorId === null) return invalidIdResponse('visitorId');
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }
    if (reader !== 'admin' && reader !== 'visitor') {
      return NextResponse.json({ error: 'Lecteur invalide.' }, { status: 400 });
    }

    const adminSession = await verifyAdminSession(request);
    const isChatStaff = Boolean(adminSession && hasAdminRole(adminSession, CHAT_STAFF_ROLES));
    const cookieVisitorId = getVisitorChatIdFromRequest(request);
    let conversation: any | null = null;

    if (reader === 'admin') {
      if (!isChatStaff) {
        return NextResponse.json({ error: 'Accès support requis.' }, { status: 403 });
      }
    } else {
      // The visitor id in JSON is informational only. A valid HttpOnly signed
      // cookie is required, and it must own the requested conversation.
      if (!cookieVisitorId) {
        return NextResponse.json({ error: 'Session visiteur requise.' }, { status: 403 });
      }
      if (requestedVisitorId && requestedVisitorId !== cookieVisitorId) {
        return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
      }
    }

    try {
      conversation = await Promise.race([
        prisma.chatConversation.findUnique({ where: { id: conversationId }, select: { id: true, visitorId: true } }),
        timeout<any>(),
      ]);
    } catch {
      conversation = inMemoryConversations.find((item) => item.id === conversationId) || null;
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
    }
    if (reader === 'visitor' && conversation.visitorId !== cookieVisitorId) {
      return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
    }

    try {
      if (reader === 'admin') {
        await Promise.race([
          Promise.all([
            prisma.chatConversation.update({
              where: { id: conversationId },
              data: { unreadByAdmin: 0 },
            }),
            prisma.chatMessage.updateMany({
              where: { conversationId, sender: 'visitor', isRead: false },
              data: { isRead: true },
            }),
          ]),
          timeout<any>(),
        ]);
      } else {
        await Promise.race([
          Promise.all([
            prisma.chatConversation.update({
              where: { id: conversationId },
              data: { unreadByVisitor: 0 },
            }),
            prisma.chatMessage.updateMany({
              where: { conversationId, sender: 'admin', isRead: false },
              data: { isRead: true },
            }),
          ]),
          timeout<any>(),
        ]);
      }
      return NextResponse.json({ success: true });
    } catch {
      // Fallback is allowed only for the conversation already authorized above.
      const memoryConversation = inMemoryConversations.find((item) => item.id === conversationId);
      if (!memoryConversation) {
        return NextResponse.json({ error: 'Conversation indisponible.' }, { status: 503 });
      }
      if (reader === 'visitor' && memoryConversation.visitorId !== cookieVisitorId) {
        return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
      }

      if (reader === 'admin') memoryConversation.unreadByAdmin = 0;
      else memoryConversation.unreadByVisitor = 0;

      inMemoryMessages.forEach((message) => {
        if (message.conversationId !== conversationId) return;
        if (reader === 'admin' && message.sender === 'visitor') message.isRead = true;
        if (reader === 'visitor' && message.sender === 'admin') message.isRead = true;
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Chat read-state error:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour la conversation.' }, { status: 500 });
  }
}
