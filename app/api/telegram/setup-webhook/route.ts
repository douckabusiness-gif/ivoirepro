import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { setTelegramWebhook } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Sécurité : seul un administrateur authentifié peut (re)configurer le webhook.
    const admin = await verifyAdminSession(request);
    if (!admin || !hasAdminRole(admin, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings || !settings.telegramBotToken) {
      return NextResponse.json(
        { error: 'Token du Bot Telegram non configuré dans les paramètres.' },
        { status: 400 }
      );
    }

    // Sécurité : l'URL publique vient de la configuration serveur (APP_URL),
    // jamais de l'en-tête Host contrôlable par le client.
    const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (!appUrl || !/^https:\/\//i.test(appUrl)) {
      return NextResponse.json(
        { error: 'APP_URL doit être définie (en https) côté serveur pour activer le webhook Telegram.' },
        { status: 500 }
      );
    }
    const webhookUrl = `${appUrl}/api/telegram/webhook`;

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
