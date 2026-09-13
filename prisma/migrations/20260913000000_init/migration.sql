-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default_settings',
    "storeName" TEXT NOT NULL DEFAULT 'Luxe & Tendance Boutique',
    "storeSlogan" TEXT NOT NULL DEFAULT 'Mode, High-Tech et Accessoires Premium',
    "storeLogoUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
    "storeLogoHeight" INTEGER NOT NULL DEFAULT 40,
    "showLogoText" BOOLEAN NOT NULL DEFAULT true,
    "pwaIconUrl" TEXT NOT NULL DEFAULT '',
    "siteHeaderColor" TEXT NOT NULL DEFAULT '#ffffff',
    "siteFooterColor" TEXT NOT NULL DEFAULT '#020617',
    "siteBodyColor" TEXT NOT NULL DEFAULT '#f1f5f9',
    "homeTheme" TEXT NOT NULL DEFAULT 'midnight',
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "currencySymbol" TEXT NOT NULL DEFAULT 'FCFA',
    "whatsappNumber" TEXT NOT NULL DEFAULT '221778901234',
    "whatsappAutoMessage" TEXT NOT NULL,
    "whatsappFloatingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappDirectOrderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enableWavePayment" BOOLEAN NOT NULL DEFAULT true,
    "wavePaymentUrl" TEXT NOT NULL DEFAULT '',
    "waveMerchantPhone" TEXT NOT NULL DEFAULT '221778901234',
    "enableOrangeMoney" BOOLEAN NOT NULL DEFAULT true,
    "orangeMoneyMerchantNumber" TEXT NOT NULL DEFAULT '221778901234',
    "enableMtnMoney" BOOLEAN NOT NULL DEFAULT true,
    "mtnMerchantNumber" TEXT NOT NULL DEFAULT '',
    "enableMoovMoney" BOOLEAN NOT NULL DEFAULT true,
    "moovMerchantNumber" TEXT NOT NULL DEFAULT '',
    "enableCustomPaymentLink" BOOLEAN NOT NULL DEFAULT false,
    "customPaymentLinkUrl" TEXT NOT NULL DEFAULT '',
    "customPaymentLinkLabel" TEXT NOT NULL DEFAULT 'Payer par Carte / Stripe',
    "enableBankTransfer" BOOLEAN NOT NULL DEFAULT false,
    "bankDetails" TEXT NOT NULL DEFAULT '',
    "enableCashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "codInstructions" TEXT NOT NULL DEFAULT 'Paiement en espèces lors de la livraison.',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@luxetendance.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+221 77 890 12 34',
    "contactAddress" TEXT NOT NULL DEFAULT 'Almadies, Dakar, Sénégal',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "tiktokUrl" TEXT NOT NULL DEFAULT '',
    "standardShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "estimatedDeliveryDays" TEXT NOT NULL DEFAULT '24h à 48h',
    "topBannerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "topBannerText" TEXT NOT NULL DEFAULT '🎉 LIVRAISON OFFERTE DÈS 50 000 FCFA D''ACHATS !',
    "topBannerLink" TEXT NOT NULL DEFAULT '',
    "tiktokFeedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inGridBannerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inGridBannerFrequency" INTEGER NOT NULL DEFAULT 8,
    "inGridBannerTitle" TEXT NOT NULL DEFAULT '🔥 Vente Flash & Offres Exclusives',
    "inGridBannerSubtitle" TEXT NOT NULL DEFAULT 'Profitez de réductions exceptionnelles allant jusqu''à -40% et de la livraison express 24h partout à Dakar et au Sénégal !',
    "inGridBannerBadge" TEXT NOT NULL DEFAULT '⚡ OFFRE DU JOUR',
    "inGridBannerButtonText" TEXT NOT NULL DEFAULT 'Profiter des Ventes Flash',
    "inGridBannerButtonAction" TEXT NOT NULL DEFAULT 'flash',
    "inGridBannerButtonLink" TEXT NOT NULL DEFAULT '',
    "inGridBannerTheme" TEXT NOT NULL DEFAULT 'gold',
    "inGridBannerImageUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    "inGridBannerSecondaryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inGridBannerSecondaryTitle" TEXT NOT NULL DEFAULT '🎁 Rejoignez le Club Privilège & Gagnez des Points',
    "inGridBannerSecondarySubtitle" TEXT NOT NULL DEFAULT 'Inscrivez-vous en 1 clic pour obtenir +10 Points VIP offerts et des remises exclusives !',
    "inGridBannerSecondaryBadge" TEXT NOT NULL DEFAULT '✨ PROGRAMME VIP',
    "inGridBannerSecondaryButtonText" TEXT NOT NULL DEFAULT 'Créer mon Compte VIP',
    "inGridBannerSecondaryButtonAction" TEXT NOT NULL DEFAULT 'vip',
    "inGridBannerSecondaryTheme" TEXT NOT NULL DEFAULT 'midnight',
    "inGridBannerSecondaryImageUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    "inGridBannersList" JSONB,
    "heroTheme" TEXT NOT NULL DEFAULT 'midnight',
    "heroTitle" TEXT NOT NULL DEFAULT 'Collection Exclusive',
    "heroHighlight" TEXT NOT NULL DEFAULT 'Nouvelle Saison',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Découvrez des produits d''exception et profitez de la livraison express partout au Sénégal.',
    "heroBadge" TEXT NOT NULL DEFAULT 'ÉDITION LIMITÉE 2026',
    "heroImage" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    "heroButtonText" TEXT NOT NULL DEFAULT 'Explorer les Nouveautés',
    "heroSecondaryButtonText" TEXT NOT NULL DEFAULT 'Commander via WhatsApp',
    "heroPromoDiscount" TEXT NOT NULL DEFAULT '-30%',
    "heroSlidesList" JSONB,
    "heroSlide2Title" TEXT NOT NULL DEFAULT 'Matériel High-Tech & Accessoires',
    "heroSlide2Highlight" TEXT NOT NULL DEFAULT 'Qualité Certifiée & Garantie.',
    "heroSlide2Subtitle" TEXT NOT NULL DEFAULT 'Commandez vos articles à l''unité ou par lot avec remise immédiate. Support client dédié 7j/7.',
    "heroSlide2Badge" TEXT NOT NULL DEFAULT 'OFFRES SPÉCIALES 2026',
    "heroSlide2Image" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    "heroSlide2Tag" TEXT NOT NULL DEFAULT '⚡ EXPÉDITION 24H GARANTIE',
    "heroSlide3Title" TEXT NOT NULL DEFAULT 'Style Urbain & Horlogerie Luxe',
    "heroSlide3Highlight" TEXT NOT NULL DEFAULT 'Les Nouveautés les Plus Demandées.',
    "heroSlide3Subtitle" TEXT NOT NULL DEFAULT 'Découvrez les modèles plébiscités par nos clients partout au Sénégal et en Afrique.',
    "heroSlide3Badge" TEXT NOT NULL DEFAULT 'TOP TENDANCES',
    "heroSlide3Image" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    "heroSlide3Tag" TEXT NOT NULL DEFAULT '⭐ NOTÉ 4.9/5 PAR NOS CLIENTS',
    "aboutUsText" TEXT NOT NULL,
    "deliveryPolicyText" TEXT NOT NULL,
    "returnPolicyText" TEXT NOT NULL,
    "termsText" TEXT NOT NULL,
    "privacyText" TEXT NOT NULL,
    "aiAgentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiAgentName" TEXT NOT NULL DEFAULT 'Amara - Conseillère IA',
    "aiAgentRole" TEXT NOT NULL DEFAULT 'Conseillère Vente & Support Client',
    "aiAgentTone" TEXT NOT NULL DEFAULT 'chaleureux',
    "aiAgentAutoReplyDelay" INTEGER NOT NULL DEFAULT 1500,
    "aiAgentMaxRecommendations" INTEGER NOT NULL DEFAULT 3,
    "aiProvider" TEXT NOT NULL DEFAULT 'gemini',
    "aiModel" TEXT NOT NULL DEFAULT '',
    "geminiApiKey" TEXT NOT NULL DEFAULT '',
    "openaiApiKey" TEXT NOT NULL DEFAULT '',
    "claudeApiKey" TEXT NOT NULL DEFAULT '',
    "groqApiKey" TEXT NOT NULL DEFAULT '',
    "deepseekApiKey" TEXT NOT NULL DEFAULT '',
    "glmApiKey" TEXT NOT NULL DEFAULT '',
    "aiTemperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "aiCustomInstructions" TEXT NOT NULL DEFAULT '',
    "customAgents" JSONB,
    "partnerProgramEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultPartnerCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "minPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "autoDispatchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryZonesList" JSONB,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT NOT NULL DEFAULT '',
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpUser" TEXT NOT NULL DEFAULT '',
    "smtpPass" TEXT NOT NULL DEFAULT '',
    "smtpFromName" TEXT NOT NULL DEFAULT '',
    "smtpFromEmail" TEXT NOT NULL DEFAULT '',
    "smtpOrderNotificationAdmin" BOOLEAN NOT NULL DEFAULT true,
    "smtpOrderConfirmationCustomer" BOOLEAN NOT NULL DEFAULT true,
    "smtpOrderStatusUpdateCustomer" BOOLEAN NOT NULL DEFAULT true,
    "smtpAdminRecipientEmail" TEXT NOT NULL DEFAULT '',
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramBotToken" TEXT NOT NULL DEFAULT '',
    "telegramChatId" TEXT NOT NULL DEFAULT '',
    "telegramNotifyNewOrder" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT NOT NULL DEFAULT 'ELITE BOUTIQUE | Mode, High-Tech & Shopping Premium',
    "seoDescription" TEXT NOT NULL DEFAULT 'Boutique en ligne haut de gamme en Côte d''Ivoire. Mode, montres, sneakers et high-tech avec livraison express 24h et paiement sécurisé Wave, Orange Money et à la livraison.',
    "seoKeywords" TEXT NOT NULL DEFAULT 'boutique en ligne, abidjan, côte d''ivoire, mode, sneakers, high-tech, livraison express, wave, orange money, shopping afrique',
    "seoOgImage" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    "seoCanonicalUrl" TEXT NOT NULL DEFAULT 'https://eliteboutique.ci',
    "seoGoogleVerification" TEXT NOT NULL DEFAULT '',
    "seoGoogleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "seoFacebookPixelId" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Général',
    "order" INTEGER NOT NULL DEFAULT 0,
    "settingsId" TEXT,

    CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "iconName" TEXT,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "discountPercent" INTEGER,
    "categoryId" TEXT NOT NULL,
    "categoryName" TEXT,
    "subcategoryId" TEXT,
    "subcategoryName" TEXT,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isFlashSale" BOOLEAN NOT NULL DEFAULT false,
    "flashSaleEndsAt" TIMESTAMP(3),
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockCount" INTEGER NOT NULL DEFAULT 10,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 12,
    "badgeText" TEXT,
    "tags" TEXT[],
    "specs" JSONB,
    "colors" TEXT[],
    "sizes" TEXT[],
    "tierPricingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "priceTiers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerAddress" TEXT NOT NULL,
    "customerCity" TEXT NOT NULL,
    "customerCountry" TEXT DEFAULT 'Sénégal',
    "customerNotes" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "deliveryPersonId" TEXT,
    "deliveryPersonName" TEXT,
    "deliveryPersonPhone" TEXT,
    "deliveryAssignedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "deliveryCashCollected" DOUBLE PRECISION,
    "deliveryZone" TEXT,
    "deliveryNotes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "paymentMethod" TEXT NOT NULL DEFAULT 'wave',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "orderStatus" TEXT NOT NULL DEFAULT 'pending',
    "directPaymentLinkUsed" TEXT,
    "whatsappMessageSent" BOOLEAN NOT NULL DEFAULT false,
    "partnerId" TEXT,
    "partnerSlug" TEXT,
    "partnerCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partnerCommissionCredited" BOOLEAN NOT NULL DEFAULT false,
    "stockRestored" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "city" TEXT DEFAULT 'Dakar',
    "address" TEXT,
    "avatarUrl" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "wishlist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "referredByPartnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productTitle" TEXT NOT NULL,
    "productImage" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "selectedColor" TEXT,
    "selectedSize" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Administrateur',
    "role" TEXT NOT NULL DEFAULT 'admin',
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "storeName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "payoutMethod" TEXT NOT NULL DEFAULT 'wave',
    "payoutPhone" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPayout" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payoutMethod" TEXT NOT NULL DEFAULT 'wave',
    "payoutTarget" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PartnerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL DEFAULT 'Visiteur',
    "visitorPhone" TEXT,
    "visitorEmail" TEXT,
    "lastMessageText" TEXT NOT NULL DEFAULT '',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadByAdmin" INTEGER NOT NULL DEFAULT 0,
    "unreadByVisitor" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "senderName" TEXT NOT NULL DEFAULT 'Client',
    "text" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT,
    "productTitle" TEXT,
    "label" TEXT,
    "referrer" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_visitorId_key" ON "ChatConversation"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_createdAt_idx" ON "AnalyticsEvent"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_createdAt_idx" ON "AnalyticsEvent"("visitorId", "createdAt");

-- AddForeignKey
ALTER TABLE "FAQItem" ADD CONSTRAINT "FAQItem_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_referredByPartnerId_fkey" FOREIGN KEY ("referredByPartnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPayout" ADD CONSTRAINT "PartnerPayout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

