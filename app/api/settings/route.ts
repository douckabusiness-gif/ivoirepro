import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialStoreSettings } from '@/lib/initialData';
import { loadStoreSettingsRecord } from '@/lib/publicData';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { canViewPrivateSettings, toPublicSettings } from '@/lib/settingsSecurity';

// Keep the settings endpoint tolerant of stale client fields while ensuring
// Prisma only receives scalar fields that belong to StoreSettings.
const STORE_SETTINGS_FIELDS = new Set([
  'storeName', 'storeSlogan', 'storeLogoUrl', 'storeLogoHeight', 'showLogoText', 'pwaIconUrl',
  'siteHeaderColor', 'siteFooterColor', 'siteBodyColor', 'homeTheme', 'currency', 'currencySymbol',
  'whatsappNumber', 'whatsappAutoMessage', 'whatsappFloatingEnabled', 'whatsappDirectOrderEnabled',
  'enableWavePayment', 'wavePaymentUrl', 'waveMerchantPhone', 'enableOrangeMoney', 'orangeMoneyMerchantNumber',
  'enableMtnMoney', 'mtnMerchantNumber', 'enableMoovMoney', 'moovMerchantNumber',
  'enableCustomPaymentLink', 'customPaymentLinkUrl', 'customPaymentLinkLabel', 'enableBankTransfer',
  'bankDetails', 'enableCashOnDelivery', 'codInstructions', 'contactEmail', 'contactPhone', 'contactAddress',
  'facebookUrl', 'instagramUrl', 'tiktokUrl', 'standardShippingFee', 'freeShippingThreshold',
  'estimatedDeliveryDays', 'topBannerEnabled', 'topBannerText', 'topBannerLink', 'tiktokFeedEnabled',
  'inGridBannerEnabled', 'inGridBannerFrequency', 'inGridBannerTitle', 'inGridBannerSubtitle',
  'inGridBannerBadge', 'inGridBannerButtonText', 'inGridBannerButtonAction', 'inGridBannerButtonLink',
  'inGridBannerTheme', 'inGridBannerImageUrl', 'inGridBannerSecondaryEnabled', 'inGridBannerSecondaryTitle',
  'inGridBannerSecondarySubtitle', 'inGridBannerSecondaryBadge', 'inGridBannerSecondaryButtonText',
  'inGridBannerSecondaryButtonAction', 'inGridBannerSecondaryTheme', 'inGridBannerSecondaryImageUrl',
  'inGridBannersList', 'heroSlidesList',
  'heroTheme', 'heroTitle', 'heroHighlight', 'heroSubtitle', 'heroBadge', 'heroImage', 'heroButtonText',
  'heroSecondaryButtonText', 'heroPromoDiscount', 'heroSlide2Title', 'heroSlide2Highlight',
  'heroSlide2Subtitle', 'heroSlide2Badge', 'heroSlide2Image', 'heroSlide2Tag', 'heroSlide3Title',
  'heroSlide3Highlight', 'heroSlide3Subtitle', 'heroSlide3Badge', 'heroSlide3Image', 'heroSlide3Tag',
  'aboutUsText', 'deliveryPolicyText', 'returnPolicyText', 'termsText', 'privacyText',
  'aiAgentEnabled', 'aiAgentName', 'aiAgentRole', 'aiAgentTone', 'aiAgentAutoReplyDelay',
  'aiAgentMaxRecommendations', 'aiProvider', 'aiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey',
  'groqApiKey', 'deepseekApiKey', 'glmApiKey', 'aiTemperature', 'aiCustomInstructions', 'customAgents',
  'partnerProgramEnabled', 'defaultPartnerCommissionRate', 'minPayoutAmount', 'autoDispatchEnabled',
  'deliveryZonesList', 'smtpEnabled', 'smtpHost', 'smtpPort', 'smtpSecure', 'smtpUser', 'smtpPass',
  'smtpFromName', 'smtpFromEmail', 'smtpOrderNotificationAdmin', 'smtpOrderConfirmationCustomer',
  'smtpOrderStatusUpdateCustomer', 'smtpAdminRecipientEmail', 'telegramEnabled', 'telegramBotToken',
  'telegramChatId', 'telegramNotifyNewOrder', 'seoTitle', 'seoDescription', 'seoKeywords', 'seoOgImage',
  'seoCanonicalUrl', 'seoGoogleVerification', 'seoGoogleAnalyticsId', 'seoFacebookPixelId',
]);

function pickStoreSettingsFields(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => STORE_SETTINGS_FIELDS.has(key)),
  );
}

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    // Only the real administrator role may receive private AI/SMTP settings.
    // Demo sessions still carry role=admin, so local demonstrations keep working.
    const isAdmin = canViewPrivateSettings(session);
    const settings = await loadStoreSettingsRecord();

    return NextResponse.json(isAdmin ? settings : toPublicSettings(settings));
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Impossible de charger les paramètres.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session || !hasAdminRole(session, ['admin'])) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const body = await request.json();
    const { faqList, id, updatedAt, ...bodySettings } = body;
    const rest = pickStoreSettingsFields(bodySettings);
    if (rest.aiModel === 'auto') rest.aiModel = '';

    for (const field of ['storeLogoUrl', 'pwaIconUrl']) {
      const value = rest[field];
      if (typeof value === 'string' && value.length > 4_000_000) {
        return NextResponse.json(
          { error: `${field} est trop volumineux. Utilisez une image optimisée de moins de 4 Mo ou une URL publique.` },
          { status: 413 },
        );
      }
    }

    await prisma.storeSettings.upsert({
      where: { id: 'default_settings' },
      update: {
        ...(rest as any),
      },
      create: {
        id: 'default_settings',
        // Partial requests (logo/icon only) still need all required Prisma
        // fields when the settings row does not exist yet.
        ...(pickStoreSettingsFields(initialStoreSettings as unknown as Record<string, unknown>) as any),
        ...(rest as any),
      },
      include: {
        faqList: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // If faqList was passed in payload, update it
    if (Array.isArray(faqList)) {
      await prisma.fAQItem.deleteMany({ where: { settingsId: 'default_settings' } });
      for (let i = 0; i < faqList.length; i++) {
        const item = faqList[i];
        await prisma.fAQItem.create({
          data: {
            id: item.id || `faq-${Date.now()}-${i}`,
            question: item.question,
            answer: item.answer,
            category: item.category || 'Général',
            order: i,
            settingsId: 'default_settings',
          },
        });
      }
    }

    const finalSettings = await prisma.storeSettings.findUnique({
      where: { id: 'default_settings' },
      include: { faqList: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(finalSettings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer les paramètres.' }, { status: 500 });
  }
}
