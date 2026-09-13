import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAutonomousChatReply } from '@/lib/agentEngine';
import { initialCategories, initialProducts, initialStoreSettings } from '@/lib/initialData';
import { appendInMemoryMessage, findInMemoryConversation, upsertInMemoryConversation } from '@/lib/inMemoryChat';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import type { ChatMessage, Category, Product, StoreSettings } from '@/lib/types';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  CHAT_CONVERSATION_ID_MAX_LENGTH,
  CHAT_NAME_MAX_LENGTH,
  CHAT_PHONE_MAX_LENGTH,
  CHAT_VISITOR_ID_MAX_LENGTH,
  getVisitorChatIdFromRequest,
  normalizeChatField,
  normalizeChatId,
  normalizeChatText,
} from '@/lib/chatSecurity';

const DB_TIMEOUT_MS = 800;
const MAX_MESSAGE_LENGTH = 2000;
const CHAT_STAFF_ROLES = ['admin', 'vendeur', 'support'] as const;

type ConversationRecord = {
  conversation: any;
  storage: 'prisma' | 'memory';
};

function withTimeout<T>(promise: Promise<T>, timeoutMs = DB_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Prisma timeout')), timeoutMs);
    })
  ]);
}

async function loadAgentContext() {
  const [settingsRecord, productRecords, categoryRecords] = await Promise.all([
    withTimeout(prisma.storeSettings.findUnique({ where: { id: 'default_settings' } })).catch(() => null),
    withTimeout(prisma.product.findMany({ where: { inStock: true } })).catch(() => []),
    withTimeout(prisma.category.findMany()).catch(() => [])
  ]);

  const settings: StoreSettings = settingsRecord
    ? { ...initialStoreSettings, ...(settingsRecord as unknown as StoreSettings) }
    : initialStoreSettings;

  // Allow server-side environment keys as a secure fallback when the admin
  // has not entered a provider key in the dashboard yet. These values never
  // leave this route and are not exposed by the public settings endpoint.
  const envKeys: Array<[keyof StoreSettings, string | undefined]> = [
    ['geminiApiKey', process.env.GEMINI_API_KEY],
    ['openaiApiKey', process.env.OPENAI_API_KEY],
    ['claudeApiKey', process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY],
    ['groqApiKey', process.env.GROQ_API_KEY],
    ['deepseekApiKey', process.env.DEEPSEEK_API_KEY],
    ['glmApiKey', process.env.GLM_API_KEY],
  ];
  for (const [key, value] of envKeys) {
    if (!(settings[key] as string | undefined)?.trim() && value?.trim()) {
      (settings as unknown as Record<string, unknown>)[key] = value.trim();
    }
  }
  const products: Product[] = productRecords.length > 0
    ? productRecords as unknown as Product[]
    : initialProducts.filter((product) => product.inStock);
  const categories: Category[] = categoryRecords.length > 0
    ? categoryRecords as unknown as Category[]
    : initialCategories;

  return { settings, products, categories };
}

async function loadConversation(input: {
  visitorId?: string;
  conversationId?: string;
  visitorName?: string;
  visitorPhone?: string;
  text: string;
}): Promise<ConversationRecord | null> {
  if (input.conversationId) {
    try {
      const conversation = await withTimeout(prisma.chatConversation.findUnique({
        where: { id: input.conversationId },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } }
      }));
      if (conversation) return { conversation, storage: 'prisma' };
    } catch {
      // Fall through to the in-memory conversation store.
    }

    const conversation = findInMemoryConversation(input.visitorId, input.conversationId);
    return conversation ? { conversation, storage: 'memory' } : null;
  }

  if (!input.visitorId) return null;

  try {
    const conversation = await withTimeout(prisma.chatConversation.upsert({
      where: { visitorId: input.visitorId },
      update: {
        lastMessageText: input.text,
        lastMessageAt: new Date(),
        visitorName: input.visitorName || undefined,
        visitorPhone: input.visitorPhone || undefined,
      },
      create: {
        visitorId: input.visitorId,
        visitorName: input.visitorName || 'Visiteur Web',
        visitorPhone: input.visitorPhone || null,
        lastMessageText: input.text,
        lastMessageAt: new Date()
      },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } }
    }));
    return { conversation, storage: 'prisma' };
  } catch {
    const conversation = upsertInMemoryConversation({
      visitorId: input.visitorId,
      visitorName: input.visitorName,
      visitorPhone: input.visitorPhone,
      lastMessageText: input.text
    });
    return { conversation, storage: 'memory' };
  }
}

function toChatHistory(messages: any[] = []): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    conversationId: message.conversationId,
    sender: message.sender as ChatMessage['sender'],
    senderName: message.senderName,
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt instanceof Date
      ? message.createdAt.toISOString()
      : String(message.createdAt)
  })).reverse();
}

async function persistAgentMessage(input: {
  conversation: any;
  storage: ConversationRecord['storage'];
  text: string;
  senderName: string;
}) {
  if (input.storage === 'prisma') {
    let createdMessage: any;
    try {
      createdMessage = await withTimeout(prisma.chatMessage.create({
        data: {
          conversationId: input.conversation.id,
          sender: 'admin',
          senderName: input.senderName,
          text: input.text,
          isRead: false
        }
      }));
    } catch {
      // If the database went offline after the read, persist the reply in memory.
      return persistAgentMessage({ ...input, storage: 'memory' });
    }

    try {
      await withTimeout(prisma.chatConversation.update({
        where: { id: input.conversation.id },
        data: {
          lastMessageText: input.text,
          lastMessageAt: new Date(),
          unreadByVisitor: { increment: 1 }
        }
      }));
    } catch {
      // The message itself is already durable; do not create a duplicate fallback.
    }
    return createdMessage;
  }

  const conversation = findInMemoryConversation(input.conversation.visitorId, input.conversation.id)
    || upsertInMemoryConversation({
      visitorId: input.conversation.visitorId,
      conversationId: input.conversation.id
    });
  return appendInMemoryMessage({
    conversationId: conversation.id,
    sender: 'admin',
    senderName: input.senderName,
    text: input.text,
    unreadFor: 'visitor'
  });
}

// POST /api/agent/chat
// Body: { visitorId, conversationId?, text, visitorName?, visitorPhone? }
export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, { keyPrefix: 'agent-chat', max: 30, windowMs: 60 * 1000 });
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
    const visitorName = normalizeChatField(input.visitorName, CHAT_NAME_MAX_LENGTH);
    const visitorPhone = normalizeChatField(input.visitorPhone, CHAT_PHONE_MAX_LENGTH);
    const text = normalizeChatText(input.text);
    if (visitorId === null) return NextResponse.json({ error: 'visitorId invalide.' }, { status: 400 });
    if (conversationId === null) return NextResponse.json({ error: 'conversationId invalide.' }, { status: 400 });
    if (visitorName === null) return NextResponse.json({ error: 'visitorName invalide.' }, { status: 400 });
    if (visitorPhone === null) return NextResponse.json({ error: 'visitorPhone invalide.' }, { status: 400 });
    const adminSession = await verifyAdminSession(request);
    const isChatStaff = Boolean(adminSession && hasAdminRole(adminSession, CHAT_STAFF_ROLES));
    const cookieVisitorId = getVisitorChatIdFromRequest(request);

    if (!text || (!visitorId && !conversationId)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message trop long (maximum ${MAX_MESSAGE_LENGTH} caractères).` }, { status: 413 });
    }

    // A public visitor may only use the browser-bound signed cookie. The
    // visitorId sent by JavaScript is a lookup hint, never an authorization
    // credential. Administrators can target any conversation after auth.
    if (!isChatStaff) {
      if (!cookieVisitorId) {
        return NextResponse.json({ error: 'Session visiteur requise.' }, { status: 403 });
      }
      if (visitorId && visitorId !== cookieVisitorId) {
        return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
      }
    }

    const effectiveVisitorId = isChatStaff ? visitorId : cookieVisitorId || undefined;

    const record = await loadConversation({
      visitorId: effectiveVisitorId,
      conversationId,
      visitorName: visitorName || undefined,
      visitorPhone: visitorPhone || undefined,
      text,
    });
    if (!record) {
      return NextResponse.json({ error: 'Conversation could not be initialized' }, { status: 400 });
    }
    if (!isChatStaff && record.conversation.visitorId !== cookieVisitorId) {
      return NextResponse.json({ error: 'Conversation non autorisée.' }, { status: 403 });
    }

    const { settings, products, categories } = await loadAgentContext();

    if (settings.aiAgentEnabled === false) {
      return NextResponse.json({ autoReplied: false, reason: 'AI Agent disabled' });
    }

    const history = toChatHistory(record.conversation.messages || []);
    const agentResult = await generateAutonomousChatReply(
      text,
      history,
      products,
      categories,
      settings
    );

    const agentDisplayName = agentResult.agent
      ? `${agentResult.agent.avatar} ${agentResult.agent.name} (${agentResult.agent.badge})`
      : (settings.aiAgentName || 'Amara (Conseillère IA)');
    const createdMessage = await persistAgentMessage({
      conversation: record.conversation,
      storage: record.storage,
      text: agentResult.text,
      senderName: agentDisplayName
    });

    return NextResponse.json({
      success: true,
      message: createdMessage,
      agent: agentResult.agent,
      orchestration: agentResult.orchestration,
      providerUsed: agentResult.providerUsed,
      suggestedProducts: agentResult.suggestedProducts,
      suggestedActions: agentResult.suggestedActions
    });
  } catch (error) {
    console.error('Error in agent chat endpoint:', error);
    return NextResponse.json({ error: 'Impossible de traiter la demande de l’agent.' }, { status: 500 });
  }
}
