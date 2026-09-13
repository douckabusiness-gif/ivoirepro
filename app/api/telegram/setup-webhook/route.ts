import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setTelegramWebhook } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings || !settings.telegramBotToken) {
      return NextResponse.json(
        { error: 'Token du Bot Telegram non configuré dans les paramètres.' },
        { status: 400 }
      );
    }

    const host = request.headers.get('host') || 'www.ivoireci.com';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const webhookUrl = `${proto}://${host}/api/telegram/webhook`;

    const result = await setTelegramWebhook(settings.telegramBotToken.trim(), webhookUrl);

    return NextResponse.json({
      success: true,
      message: `Webhook Telegram activé avec succès sur ${webhookUrl} ! Vos boutons et commandes interactives sont désormais actifs.`,
      webhookUrl,
      result,
    });
  } catch (err: any) {
    console.error('Erreur configuration Webhook Telegram:', err);
    return NextResponse.json(
      { error: err?.message || 'Échec de la configuration du Webhook Telegram.' },
      { status: 500 }
    );
  }
}
