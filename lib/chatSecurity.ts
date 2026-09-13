import type { NextResponse } from 'next/server';
import { getVisitorChatIdFromRequest, signVisitorChatToken } from './auth';

/**
 * Limits used by all public chat endpoints.  The browser id is only a lookup
 * key; the signed cookie is the credential that authorizes access.
 */
export const CHAT_VISITOR_ID_MAX_LENGTH = 120;
export const CHAT_CONVERSATION_ID_MAX_LENGTH = 120;
export const CHAT_TEXT_MAX_LENGTH = 2000;
export const CHAT_NAME_MAX_LENGTH = 120;
export const CHAT_PHONE_MAX_LENGTH = 40;
export const CHAT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

const SAFE_CHAT_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/;

export function normalizeChatId(value: unknown, maxLength = CHAT_VISITOR_ID_MAX_LENGTH): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength || !SAFE_CHAT_ID.test(normalized)) return null;
  return normalized;
}

export function normalizeChatField(value: unknown, maxLength: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (normalized.length > maxLength) return null;
  return normalized || undefined;
}

export function normalizeChatText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > CHAT_TEXT_MAX_LENGTH) return null;
  return normalized;
}

/** Attach the browser-bound anonymous chat credential to a route response. */
export function setVisitorChatCookie(response: NextResponse, visitorId: string) {
  response.cookies.set('visitor_chat_session', signVisitorChatToken(visitorId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CHAT_COOKIE_MAX_AGE,
  });
  return response;
}

export { getVisitorChatIdFromRequest };
