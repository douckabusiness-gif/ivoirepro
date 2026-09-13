import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { sendTelegramTestMessage } from '@/lib/telegram';
import type { StoreSettings } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin || !hasAdminRole(admin, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis pour tester Telegram.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentSettings = await prisma.storeSettings.findUnique({ where: { id: 'default_settings' } });
    const effectiveSettings: StoreSettings = {
      ...(currentSettings as any),
      ...(body && typeof body === 'object' ? body : {}),
      telegramEnabled: true,
      telegramNotifyNewOrder: true,
    };

    if (!effectiveSettings.telegramBotToken?.trim() || !effectiveSettings.telegramChatId?.trim()) {
      return NextResponse.json({ error: 'Renseignez le token du bot et le Chat ID avant de lancer le test.' }, { status: 400 });
    }

    const result = await sendTelegramTestMessage(effectiveSettings);
    if (!result.success) {
      return NextResponse.json({ error: result.reason || 'Telegram est désactivé.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message de test envoyé sur Telegram.',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Erreur test Telegram:', error);
    return NextResponse.json({
      error: error?.message || 'Impossible de joindre Telegram. Vérifiez le token et le Chat ID.',
    }, { status: 502 });
  }
}
