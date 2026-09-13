import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';
import { StoreSettings } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession(request);
    if (!admin || !hasAdminRole(admin, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis pour tester le SMTP.' }, { status: 401 });
    }

    const body = await request.json();
    const { testEmail, ...smtpOverrides } = body;

    // Fetch existing settings from DB
    const currentSettings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
    });

    // Merge current DB settings with any live edits passed in test request
    const effectiveSettings: StoreSettings = {
      ...(currentSettings as any),
      ...smtpOverrides,
      // Force enabled for test if explicitly testing
      smtpEnabled: true,
    };

    const targetRecipient = testEmail?.trim() || effectiveSettings.contactEmail || effectiveSettings.smtpUser;

    if (!targetRecipient || !targetRecipient.includes('@')) {
      return NextResponse.json(
        { error: 'Veuillez renseigner une adresse email de destination valide pour le test.' },
        { status: 400 }
      );
    }

    if (!effectiveSettings.smtpHost || !effectiveSettings.smtpUser || !effectiveSettings.smtpPass) {
      return NextResponse.json(
        { error: 'Veuillez remplir au minimum : le Serveur Hôte, le Port, le Nom d\'utilisateur et le Mot de passe.' },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(targetRecipient, effectiveSettings);

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé avec succès à ${targetRecipient} !`,
      messageId: result.messageId,
      response: result.response,
    });
  } catch (error: any) {
    console.error('Erreur test SMTP:', error);

    let diagnostic = error.message || 'Erreur inconnue lors du test SMTP';

    // Useful hints for common email issues
    if (diagnostic.includes('EAUTH') || diagnostic.includes('Invalid login') || diagnostic.includes('BadCredentials')) {
      diagnostic = `Identifiants incorrects (EAUTH) : Vérifiez votre nom d'utilisateur et mot de passe. Si vous utilisez Gmail, générez un "Mot de passe d'application" dans la sécurité de votre compte Google.`;
    } else if (diagnostic.includes('ETIMEDOUT') || diagnostic.includes('ESOCKETTIMEDOUT')) {
      diagnostic = `Délai d'attente dépassé (ETIMEDOUT) : Le serveur SMTP (${error.address || 'hôte'}) ne répond pas sur le port spécifié. Vérifiez le port (587 avec TLS ou 465 avec SSL).`;
    } else if (diagnostic.includes('ECONNREFUSED')) {
      diagnostic = `Connexion refusée (ECONNREFUSED) : Impossible de joindre le serveur SMTP. Vérifiez l'adresse de l'hôte et le port.`;
    } else if (diagnostic.includes('self signed certificate')) {
      diagnostic = `Certificat SSL invalide : L'option de tolérance TLS a été appliquée, mais le serveur rejette la poignée de main.`;
    }

    return NextResponse.json(
      { error: diagnostic, technicalError: error.message },
      { status: 500 }
    );
  }
}
