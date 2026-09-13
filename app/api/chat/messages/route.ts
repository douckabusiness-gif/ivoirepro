import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryConversations, inMemoryMessages } from '@/lib/inMemoryChat';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  CHAT_CONVERSATION_ID_MAX_LENGTH,
  CHAT_NAME_MAX_LENGTH,
  CHAT_PHONE_MAX_LENGTH,
  CHAT_TEXT_MAX_LENGTH,
  CHAT_VISITOR_ID_MAX_LENGTH,
  getVisitorChatIdFromRequest,
  normalizeChatField,
  normalizeChatId,
  setVisitorChatCookie,
} from '@/lib/chatSecurity';

const DB_TIMEOUT_MS = 600;
const CHAT_STAFF_ROLES = ['admin', 'vendeur', 'support'] as const;

function timeout<T>(ms = DB_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Prisma timeout')), ms);
  });
}

async function findConversationByVisitorId(visitorId: string, includeMessages = false) {
  try {
    const query = includeMessages
      ? prisma.chatConversation.findUnique({
          where: { visitorId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : prisma.chatConversation.findUnique({ where: { visitorId } });
    const conversation = await Promise.race([query, timeout<any>()]);
    return { conversation, databaseAvailable: true };
  } catch {
    return {
      conversation: inMemoryConversations.find((item) => item.visitorId === visitorId) || null,
      databaseAvailable: false,
    };
  }
}

async function findConversationById(conversationId: string, includeMessages = false) {
  try {
    const query = includeMessages
      ? prisma.chatConversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : prisma.chatConversation.findUnique({ where: { id: conversationId } });
    const conversation = await Promise.race([query, timeout<any>()]);
    return { conversation, databaseAvailable: true };
  } catch {
    return {
      conversation: inMemoryConversations.find((item) => item.id === conversationId) || null,
      databaseAvailable: false,
    };
  }
}

function invalidIdResponse(field: string) {
  return NextResponse.json({ error: `${field} invalide.` }, { status: 400 });
}

function withVisitorCookie(response: NextResponse, visitorId: string | undefined, shouldSetCookie: boolean) {
  if (shouldSetCookie && visitorId) setVisitorChatCookie(response, visitorId);
  return response;
}

function memoryMessagesFor(conversationId: string) {
  return inMemoryMessages.filter((message) => message.conversationId === conversationId);
}

// GET /api/chat/messages?visitorId=... or ?conversationId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawVisitorId = searchParams.get('visitorId');
    const rawConversationId = searchParams.get('conversationId');
    const visitorId = normalizeChatId(rawVisitorId, CHAT_VISITOR_ID_MAX_LENGTH);
    const conversationId = normalizeChatId(rawConversationId, CHAT_CONVERSATION_ID_MAX_LENGTH);

    if (visitorId === null) return invalidIdResponse('visitorId');
    if (conversationId === null) return invalidIdResponse('conversationId');
    if (!visitorId && !conversationId) {
      return NextResponse.json({ error: 'visitorId or conversationId is required' }, { status: 400 });
    }

    const adminSession = await verifyAdminSession(request);
    const isChatStaff = Boolean(adminSession && hasAdminRole(adminSession, CHAT_STAFF_ROLES));

    // Conversation ids are intentionally admin-only. Visitors use their
    // signed browser-bound visitor id and never receive an id-based lookup.
    if (conversationId) {
      if (!isChatStaff) {
        return NextResponse.json({ error: 'Accès support requis.' }, { status: 403 });
      }
      const result = await findConversationById(conversationId, true);
      if (!result.conversation) return NextResponse.json({ conversation: null, messages: [] });
      return NextResponse.json({
        conversation: result.conversation,
        messages: result.conversation.messages || memoryMessagesFor(result.conversation.id),
      });
    }

    const cookieVisitorId = getVisitorChatIdFromRequest(request);
    if (!isChatStaff && cookieVisitorId && cookieVisitorId !== visitorId) {
      return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
    }

    const result = await findConversationByVisitorId(visitorId!, true);
    // Without a valid cookie, an existing conversation must never be exposed.
    // A new browser can bootstrap its id; the response immediately binds it to
    // an HttpOnly signed cookie for all subsequent requests.
    if (!isChatStaff && !cookieVisitorId && result.conversation) {
      return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
    }

    const response = NextResponse.json({
      conversation: result.conversation,
      messages: result.conversation
        ? (result.conversation.messages || memoryMessagesFor(result.conversation.id))
        : [],
    });
    return withVisitorCookie(response, visitorId, !isChatStaff && !cookieVisitorId && !result.conversation);
  } catch (error) {
    console.error('Chat message lookup error:', error);
    return NextResponse.json({ error: 'Impossible de charger la conversation.' }, { status: 500 });
  }
}

// POST /api/chat/messages
export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'chat-message', max: 60, windowMs: 60 * 1000 });
    if (limited) return limited;

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
    const visitorId = normalizeChatId(input.visitorId, CHAT_VISITOR_ID_MAX_LENGTH);
    const conversationId = normalizeChatId(input.conversationId, CHAT_CONVERSATION_ID_MAX_LENGTH);
    if (visitorId === null) return invalidIdResponse('visitorId');
    if (conversationId === null) return invalidIdResponse('conversationId');

    const textValue = input.text;
    if (typeof textValue !== 'string') {
      return NextResponse.json({ error: 'Message requis.' }, { status: 400 });
    }
    const text = textValue.trim();
    if (!text) return NextResponse.json({ error: 'Message requis.' }, { status: 400 });
    if (text.length > CHAT_TEXT_MAX_LENGTH) {
      return NextResponse.json({ error: `Message trop long (maximum ${CHAT_TEXT_MAX_LENGTH} caractères).` }, { status: 413 });
    }

    const sender = input.sender === undefined ? 'visitor' : input.sender;
    if (sender !== 'visitor' && sender !== 'admin') {
      return NextResponse.json({ error: 'Sender invalide' }, { status: 400 });
    }

    const senderName = normalizeChatField(input.senderName, CHAT_NAME_MAX_LENGTH);
    const visitorName = normalizeChatField(input.visitorName, CHAT_NAME_MAX_LENGTH);
    const visitorPhone = normalizeChatField(input.visitorPhone, CHAT_PHONE_MAX_LENGTH);
    if (senderName === null) return NextResponse.json({ error: 'senderName invalide.' }, { status: 400 });
    if (visitorName === null) return NextResponse.json({ error: 'visitorName invalide.' }, { status: 400 });
    if (visitorPhone === null) return NextResponse.json({ error: 'visitorPhone invalide.' }, { status: 400 });

    const adminSession = await verifyAdminSession(request);
    const isChatStaff = Boolean(adminSession && hasAdminRole(adminSession, CHAT_STAFF_ROLES));
    if (sender === 'admin' && !isChatStaff) {
      return NextResponse.json({ error: 'Accès support requis.' }, { status: 403 });
    }

    const cookieVisitorId = getVisitorChatIdFromRequest(request);
    let effectiveVisitorId = visitorId || cookieVisitorId || undefined;
    let existingConversation: any | null = null;
    let shouldSetCookie = false;

    if (sender === 'visitor') {
      if (cookieVisitorId && visitorId && cookieVisitorId !== visitorId) {
        return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
      }

      if (conversationId) {
        const lookup = await findConversationById(conversationId);
        existingConversation = lookup.conversation;
        // A conversation id always denotes an existing resource. Requiring a
        // valid matching cookie prevents id probing and memory-store bypasses.
        if (!existingConversation || !cookieVisitorId || existingConversation.visitorId !== cookieVisitorId) {
          return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
        }
        if (visitorId && existingConversation.visitorId !== visitorId) {
          return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
        }
        effectiveVisitorId = existingConversation.visitorId;
      } else {
        if (!effectiveVisitorId) {
          return NextResponse.json({ error: 'Identifiant visiteur requis.' }, { status: 400 });
        }
        const lookup = await findConversationByVisitorId(effectiveVisitorId);
        existingConversation = lookup.conversation;
        if (existingConversation && (!cookieVisitorId || cookieVisitorId !== effectiveVisitorId)) {
          return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
        }
        shouldSetCookie = !cookieVisitorId && !existingConversation;
      }
    } else if (conversationId) {
      // Admin replies may target any conversation, but an invalid id should not
      // silently create a detached in-memory conversation.
      const lookup = await findConversationById(conversationId);
      existingConversation = lookup.conversation;
      if (!existingConversation) {
        return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
      }
      effectiveVisitorId = existingConversation.visitorId;
    } else if (!effectiveVisitorId) {
      return NextResponse.json({ error: 'visitorId ou conversationId requis.' }, { status: 400 });
    }

    try {
      let conversation: any | null = null;
      if (conversationId) {
        conversation = existingConversation;
        if (!conversation) {
          const lookup = await findConversationById(conversationId);
          conversation = lookup.conversation;
        }
        if (!conversation) return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });

        conversation = await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageText: text,
            lastMessageAt: new Date(),
            ...(sender === 'visitor' ? { unreadByAdmin: { increment: 1 } } : { unreadByVisitor: { increment: 1 } }),
            ...(visitorName ? { visitorName } : {}),
            ...(visitorPhone ? { visitorPhone } : {}),
          },
        });
      } else {
        conversation = await prisma.chatConversation.upsert({
          where: { visitorId: effectiveVisitorId! },
          update: {
            lastMessageText: text,
            lastMessageAt: new Date(),
            visitorName: visitorName || undefined,
            visitorPhone: visitorPhone || undefined,
            unreadByAdmin: sender === 'visitor' ? { increment: 1 } : undefined,
            unreadByVisitor: sender === 'admin' ? { increment: 1 } : undefined,
          },
          create: {
            visitorId: effectiveVisitorId!,
            visitorName: visitorName || 'Visiteur En Ligne',
            visitorPhone: visitorPhone || null,
            lastMessageText: text,
            lastMessageAt: new Date(),
            unreadByAdmin: sender === 'visitor' ? 1 : 0,
            unreadByVisitor: sender === 'admin' ? 1 : 0,
          },
        });
      }

      const message = await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          sender,
          senderName: senderName || (sender === 'admin' ? 'Support Boutique' : (visitorName || 'Client')),
          text,
          isRead: false,
        },
      });
      const response = NextResponse.json({ success: true, message, conversationId: conversation.id });
      return withVisitorCookie(response, effectiveVisitorId, shouldSetCookie);
    } catch {
      // PostgreSQL may be unavailable in local development. The fallback is
      // constrained by the same ownership checks above.
      let conversation: any | undefined;
      if (conversationId) {
        conversation = inMemoryConversations.find((item) => item.id === conversationId);
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation indisponible.' }, { status: 503 });
        }
      } else {
        conversation = inMemoryConversations.find((item) => item.visitorId === effectiveVisitorId);
      }

      const nowIso = new Date().toISOString();
      if (!conversation) {
        if (!effectiveVisitorId) {
          return NextResponse.json({ error: 'Identifiant visiteur requis.' }, { status: 400 });
        }
        conversation = {
          id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          visitorId: effectiveVisitorId,
          visitorName: visitorName || 'Visiteur En Ligne',
          visitorPhone: visitorPhone || null,
          lastMessageText: text,
          lastMessageAt: nowIso,
          unreadByAdmin: sender === 'visitor' ? 1 : 0,
          unreadByVisitor: sender === 'admin' ? 1 : 0,
          status: 'active',
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: [],
        };
        inMemoryConversations.unshift(conversation);
      } else {
        conversation.lastMessageText = text;
        conversation.lastMessageAt = nowIso;
        conversation.updatedAt = nowIso;
        if (visitorName) conversation.visitorName = visitorName;
        if (visitorPhone) conversation.visitorPhone = visitorPhone;
        if (sender === 'visitor') conversation.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
        if (sender === 'admin') conversation.unreadByVisitor = (conversation.unreadByVisitor || 0) + 1;
      }

      const newMessage: any = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        conversationId: conversation.id,
        sender,
        senderName: senderName || (sender === 'admin' ? 'Support Boutique' : (visitorName || 'Client')),
        text,
        isRead: false,
        createdAt: nowIso,
      };
      inMemoryMessages.push(newMessage);
      conversation.messages = conversation.messages || [];
      conversation.messages.push(newMessage);

      const response = NextResponse.json({ success: true, message: newMessage, conversationId: conversation.id });
      return withVisitorCookie(response, effectiveVisitorId, shouldSetCookie);
    }
  } catch (error) {
    console.error('Chat message write error:', error);
    return NextResponse.json({ error: 'Impossible d’envoyer le message.' }, { status: 500 });
  }
}
