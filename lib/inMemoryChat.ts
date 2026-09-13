import { ChatConversation, ChatMessage } from './types';

// Global in-memory fallback for local dev when PostgreSQL is not running
const globalForChat = globalThis as unknown as {
  inMemoryConversations?: ChatConversation[];
  inMemoryMessages?: ChatMessage[];
};

if (!globalForChat.inMemoryConversations) {
  globalForChat.inMemoryConversations = [
    {
      id: 'conv-demo-1',
      visitorId: 'visitor-demo-1',
      visitorName: 'Aminata Diallo',
      visitorPhone: '+221 77 123 45 67',
      lastMessageText: 'Bonjour, est-ce que la livraison est possible aujourd’hui à Dakar ?',
      lastMessageAt: new Date(Date.now() - 15 * 60000).toISOString(),
      unreadByAdmin: 1,
      unreadByVisitor: 0,
      status: 'active',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      messages: [
        {
          id: 'msg-demo-1',
          conversationId: 'conv-demo-1',
          sender: 'visitor',
          senderName: 'Aminata Diallo',
          text: 'Bonjour, est-ce que la livraison est possible aujourd’hui à Dakar ?',
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString()
        }
      ]
    }
  ];
  globalForChat.inMemoryMessages = [
    ...(globalForChat.inMemoryConversations[0].messages || [])
  ];
}

export const inMemoryConversations = globalForChat.inMemoryConversations;
export const inMemoryMessages = globalForChat.inMemoryMessages || [];

export function findInMemoryConversation(visitorId?: string, conversationId?: string) {
  return inMemoryConversations.find((conversation) => (
    (conversationId && conversation.id === conversationId) ||
    (visitorId && conversation.visitorId === visitorId)
  ));
}

export function upsertInMemoryConversation(input: {
  visitorId?: string;
  conversationId?: string;
  visitorName?: string;
  visitorPhone?: string;
  lastMessageText?: string;
}) {
  const now = new Date().toISOString();
  let conversation = findInMemoryConversation(input.visitorId, input.conversationId);

  if (!conversation) {
    conversation = {
      id: input.conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      visitorId: input.visitorId || `visitor-${Date.now()}`,
      visitorName: input.visitorName || 'Visiteur En Ligne',
      visitorPhone: input.visitorPhone || null,
      lastMessageText: input.lastMessageText || '',
      lastMessageAt: now,
      unreadByAdmin: 0,
      unreadByVisitor: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      messages: []
    };
    inMemoryConversations.unshift(conversation);
  } else {
    conversation.updatedAt = now;
    if (input.visitorName) conversation.visitorName = input.visitorName;
    if (input.visitorPhone) conversation.visitorPhone = input.visitorPhone;
    if (input.lastMessageText !== undefined) {
      conversation.lastMessageText = input.lastMessageText;
      conversation.lastMessageAt = now;
    }
  }

  return conversation;
}

export function appendInMemoryMessage(input: {
  conversationId: string;
  sender: ChatMessage['sender'];
  senderName: string;
  text: string;
  unreadFor?: 'admin' | 'visitor';
}) {
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId: input.conversationId,
    sender: input.sender,
    senderName: input.senderName,
    text: input.text,
    isRead: false,
    createdAt: now
  };

  const conversation = inMemoryConversations.find((item) => item.id === input.conversationId);
  if (conversation) {
    conversation.lastMessageText = input.text;
    conversation.lastMessageAt = now;
    conversation.updatedAt = now;
    conversation.messages = conversation.messages || [];
    conversation.messages.push(message);
    if (input.unreadFor === 'admin') conversation.unreadByAdmin += 1;
    if (input.unreadFor === 'visitor') conversation.unreadByVisitor += 1;
  }

  inMemoryMessages.push(message);
  return message;
}
