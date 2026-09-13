import type { AdminTokenPayload } from './auth';

export const PRIVATE_SETTING_KEYS = [
  'geminiApiKey',
  'openaiApiKey',
  'claudeApiKey',
  'groqApiKey',
  'deepseekApiKey',
  'glmApiKey',
  'aiProvider',
  'aiModel',
  'aiCustomInstructions',
  'customAgents',
  'smtpHost',
  'smtpPort',
  'smtpSecure',
  'smtpUser',
  'smtpPass',
  'smtpFromName',
  'smtpFromEmail',
  'smtpOrderNotificationAdmin',
  'smtpOrderConfirmationCustomer',
  'smtpOrderStatusUpdateCustomer',
  'smtpAdminRecipientEmail',
  'telegramEnabled',
  'telegramBotToken',
  'telegramChatId',
  'telegramNotifyNewOrder',
] as const;

export function toPublicSettings(settings: Record<string, unknown>) {
  const publicSettings = { ...settings };
  for (const key of PRIVATE_SETTING_KEYS) delete publicSettings[key];
  return publicSettings;
}

export function canViewPrivateSettings(session: AdminTokenPayload | null) {
  return Boolean(session && session.role === 'admin');
}
