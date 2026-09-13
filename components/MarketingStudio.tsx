'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Download, 
  Share2, 
  Play, 
  Pause, 
  RotateCcw, 
  Palette, 
  Layers, 
  Type, 
  DollarSign, 
  Tag, 
  Flame, 
  Wand2, 
  Check, 
  Copy, 
  Eye, 
  Sliders, 
  Smartphone, 
  Square, 
  Monitor, 
  Gift, 
  Crown, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  Upload, 
  RefreshCw,
  LayoutTemplate
} from 'lucide-react';

export type AdFormat = 'story' | 'square' | 'banner';
export type AdTheme = 'gold' | 'neon' | 'emerald' | 'cyberpunk' | 'sunset';
export type VideoStyle = 'pulse' | 'slide' | 'luxe';

export const MarketingStudio = () => {
  const { 
    settings, 
    products, 
    formatPrice, 
    generateWhatsAppGeneralLink 
  } = useStore();

  const [activeStudioTab, setActiveStudioTab] = useState<'poster' | 'video' | 'templates' | 'coupons'>('poster');

  // Ad Content State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adFormat, setAdFormat] = useState<AdFormat>('story');
  const [adTheme, setAdTheme] = useState<AdTheme>('gold');
  
  // Customizable texts
  const [headline, setHeadline] = useState('VENTE FLASH EXCLUSIVE 🔥');
  const [productTitle, setProductTitle] = useState(products[0]?.title || 'Montre Chronographe Royal Gold');
  const [productSubtitle, setProductSubtitle] = useState('Offre Spéciale - Stock Limité à Dakar');
  const [productPrice, setProductPrice] = useState<number>(products[0]?.price || 75000);
  const [originalPrice, setOriginalPrice] = useState<number>(products[0]?.originalPrice || 95000);
  const [badgeText, setBadgeText] = useState('-25% CE WEEK-END');
  const [ctaText, setCtaText] = useState('Commandez sur WhatsApp');
  const [productImageUrl, setProductImageUrl] = useState<string>(
    products[0]?.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  );
  const [sticker, setSticker] = useState<string>('⚡ LIVRAISON 24H');
  const [customPhone, setCustomPhone] = useState<string>(settings.whatsappNumber || '+221 77 000 00 00');

  // Video Ad State
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number>(8); // 8 seconds
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('pulse');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState(false);

  // References
  const posterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number>(0);

  // Themes Color Palettes
  const themeStyles = {
    gold: {
      name: 'Luxe Royal Gold',
      bgGradient: ['#0f172a', '#1e1b4b', '#090d16'],
      accent: '#f59e0b',
      accentGradient: ['#fbbf24', '#d97706'],
      textMain: '#ffffff',
      textMuted: '#94a3b8',
      badgeBg: '#78350f',
      badgeText: '#fef3c7',
      glow: 'rgba(245, 158, 11, 0.4)'
    },
    neon: {
      name: 'Vente Flash Néon',
      bgGradient: ['#180026', '#3b0764', '#090014'],
      accent: '#ec4899',
      accentGradient: ['#f43f5e', '#a855f7'],
      textMain: '#ffffff',
      textMuted: '#e9d5ff',
      badgeBg: '#831843',
      badgeText: '#fdf2f8',
      glow: 'rgba(236, 72, 153, 0.5)'
    },
    emerald: {
      name: 'Émeraude & Nature',
      bgGradient: ['#022c22', '#064e3b', '#021e17'],
      accent: '#10b981',
      accentGradient: ['#34d399', '#059669'],
      textMain: '#ffffff',
      textMuted: '#a7f3d0',
      badgeBg: '#064e3b',
      badgeText: '#ecfdf5',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    cyberpunk: {
      name: 'Cyberpunk Night',
      bgGradient: ['#030712', '#1e1b4b', '#0284c7'],
      accent: '#06b6d4',
      accentGradient: ['#38bdf8', '#6366f1'],
      textMain: '#ffffff',
      textMuted: '#bae6fd',
      badgeBg: '#083344',
      badgeText: '#cffafe',
      glow: 'rgba(6, 182, 212, 0.5)'
    },
    sunset: {
      name: 'Sunset Streetwear',
      bgGradient: ['#1c1917', '#431407', '#7c2d12'],
      accent: '#f97316',
      accentGradient: ['#fb923c', '#ea580c'],
      textMain: '#ffffff',
      textMuted: '#fdba74',
      badgeBg: '#7c2d12',
      badgeText: '#ffedd5',
      glow: 'rgba(249, 115, 22, 0.4)'
    }
  };

  // Sync when user selects a product from the boutique catalog
  const handleSelectCatalogProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setProductTitle(prod.title);
      setProductPrice(prod.price);
      setOriginalPrice(prod.originalPrice || Math.round(prod.price * 1.25));
      setProductImageUrl(prod.images[0] || productImageUrl);
      setProductSubtitle(prod.shortDescription || `${prod.categoryName || 'Article'} de haute qualité`);
      if (prod.discountPercent) {
        setBadgeText(`-${prod.discountPercent}% FLASH`);
      }
    }
  };

  // Quick AI Assistant Generator
  const handleGenerateAiCatchphrase = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const phrases = [
        { head: '🔥 OFFRE EXCLUSIVE DU MOMENT', sub: 'Économisez jusqu\'à 35% en commandant aujourd\'hui !', badge: 'PROMO FLASH 24H' },
        { head: '💎 ÉLÉGANCE & HAUTE QUALITÉ', sub: 'L\'excellence à portée de main avec livraison 24h offerte.', badge: 'SÉRIE LIMITÉE VIP' },
        { head: '⚡ DERNIÈRES PIÈCES EN STOCK', sub: 'Ne ratez pas notre meilleure vente de la semaine !', badge: 'DERNIÈRE CHANCE' },
        { head: '🎁 OFFRE SPÉCIALE WEEK-END', sub: 'Paiement sécurisé à la livraison ou par Wave & Orange Money.', badge: 'BEST DEAL 2026' }
      ];
      const random = phrases[Math.floor(Math.random() * phrases.length)];
      setHeadline(random.head);
      setProductSubtitle(random.sub);
      setBadgeText(random.badge);
      setIsAiGenerating(false);
      setAiSuccessMsg(true);
      setTimeout(() => setAiSuccessMsg(false), 2500);
    }, 600);
  };

  // Preset Template loader
  const handleLoadTemplate = (tpl: {
    format: AdFormat;
    theme: AdTheme;
    head: string;
    sub: string;
    badge: string;
    sticker: string;
  }) => {
    setAdFormat(tpl.format);
    setAdTheme(tpl.theme);
    setHeadline(tpl.head);
    setProductSubtitle(tpl.sub);
    setBadgeText(tpl.badge);
    setSticker(tpl.sticker);
    setActiveStudioTab('poster');
  };

  // =========================================================================
  // POSTER CANVAS DRAWING & EXPORT ENGINE (HD Canvas API)
  // =========================================================================
  const drawPosterOnCanvas = (canvas: HTMLCanvasElement, forExport = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Canvas Dimensions based on format
    let width = 1080;
    let height = 1920; // 9:16 default
    if (adFormat === 'square') {
      width = 1080;
      height = 1080;
    } else if (adFormat === 'banner') {
      width = 1200;
      height = 675;
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const currentTheme = themeStyles[adTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, currentTheme.bgGradient[0]);
    bgGrad.addColorStop(0.5, currentTheme.bgGradient[1]);
    bgGrad.addColorStop(1, currentTheme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Ambient Circles
    ctx.save();
    ctx.filter = 'blur(60px)';
    ctx.fillStyle = currentTheme.glow;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.8, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Grid Pattern Overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 4. Header Badge & Store Name
    const paddingX = width * 0.08;
    const topY = height * 0.06;

    // Store Tag
    ctx.fillStyle = currentTheme.accent;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(settings.storeName.toUpperCase() + ' • BOUTIQUE OFFICIELLE', paddingX, topY);

    // Top Headline
    ctx.fillStyle = currentTheme.textMain;
    ctx.font = `900 ${adFormat === 'banner' ? '36px' : '48px'} system-ui, sans-serif`;
    ctx.fillText(headline, paddingX, topY + 55);

    // 5. Product Image Box (Centered / Layout specific)
    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous';
    imgObj.src = productImageUrl;

    const renderRemainingElements = () => {
      // Image Box coords
      let imgX = paddingX;
      let imgY = topY + 90;
      let imgW = width - (paddingX * 2);
      let imgH = height * 0.46;

      if (adFormat === 'banner') {
        imgW = width * 0.42;
        imgH = height * 0.72;
        imgX = width - imgW - paddingX;
        imgY = height * 0.14;
      } else if (adFormat === 'square') {
        imgH = height * 0.44;
      }

      // Draw Rounded Image Container
      ctx.save();
      ctx.beginPath();
      const radius = 28;
      ctx.roundRect(imgX, imgY, imgW, imgH, radius);
      ctx.clip();

      if (imgObj.complete && imgObj.naturalWidth > 0) {
        ctx.drawImage(imgObj, imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }
      ctx.restore();

      // Border around image
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 28);
      ctx.stroke();

      // Badge on image
      if (badgeText) {
        const badgeW = 260;
        const badgeH = 50;
        const bx = imgX + 20;
        const by = imgY + 20;

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.roundRect(bx, by, badgeW, badgeH, 14);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, bx + badgeW / 2, by + 33);
        ctx.textAlign = 'left';
      }

      // Sticker on image
      if (sticker) {
        const stW = 240;
        const stH = 44;
        const sx = imgX + imgW - stW - 20;
        const sy = imgY + imgH - stH - 20;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(sx, sy, stW, stH, 12);
        ctx.fill();

        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sticker, sx + stW / 2, sy + 28);
        ctx.textAlign = 'left';
      }

      // 6. Content Section (Title, Price, CTA)
      let contentY = imgY + imgH + 50;
      if (adFormat === 'banner') {
        contentY = topY + 90;
      }

      // Product Title
      ctx.fillStyle = currentTheme.textMain;
      ctx.font = '900 42px system-ui, sans-serif';
      const maxTextWidth = adFormat === 'banner' ? width * 0.45 : width - (paddingX * 2);
      ctx.fillText(productTitle.length > 32 ? productTitle.slice(0, 30) + '...' : productTitle, paddingX, contentY, maxTextWidth);

      // Subtitle
      ctx.fillStyle = currentTheme.textMuted;
      ctx.font = '500 24px system-ui, sans-serif';
      ctx.fillText(productSubtitle, paddingX, contentY + 40, maxTextWidth);

      // Price Box
      const priceY = contentY + 110;
      ctx.fillStyle = currentTheme.accent;
      ctx.font = '900 54px system-ui, sans-serif';
      ctx.fillText(`${productPrice.toLocaleString('fr-FR')} FCFA`, paddingX, priceY);

      if (originalPrice && originalPrice > productPrice) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 28px system-ui, sans-serif';
        const promoText = `${productPrice.toLocaleString('fr-FR')} FCFA`;
        const promoWidth = ctx.measureText(promoText).width;
        const origText = `${originalPrice.toLocaleString('fr-FR')} FCFA`;
        const origX = paddingX + promoWidth + 24;
        ctx.fillText(origText, origX, priceY - 6);
        // Strikethrough line
        const origWidth = ctx.measureText(origText).width;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origX - 4, priceY - 14);
        ctx.lineTo(origX + origWidth + 4, priceY - 14);
        ctx.stroke();
      }

      // 7. CTA Button & WhatsApp Hotline Footer
      const ctaY = priceY + 60;
      const ctaW = adFormat === 'banner' ? width * 0.42 : width - (paddingX * 2);
      const ctaH = 75;

      const ctaGrad = ctx.createLinearGradient(paddingX, ctaY, paddingX + ctaW, ctaY);
      ctaGrad.addColorStop(0, '#10b981');
      ctaGrad.addColorStop(1, '#059669');
      ctx.fillStyle = ctaGrad;
      ctx.beginPath();
      ctx.roundRect(paddingX, ctaY, ctaW, ctaH, 20);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`💬 ${ctaText.toUpperCase()}`, paddingX + ctaW / 2, ctaY + 47);
      ctx.textAlign = 'left';

      // WhatsApp Footer Phone
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const footY = adFormat === 'banner' ? height - 30 : height * 0.95;
      ctx.fillText(`📞 WhatsApp : ${customPhone} • Livraison 24h Partout au Sénégal`, width / 2, footY);
      ctx.textAlign = 'left';
    };

    if (imgObj.complete) {
      renderRemainingElements();
    } else {
      imgObj.onload = renderRemainingElements;
    }
  };

  // Download High-Resolution PNG Poster
  const handleDownloadPoster = () => {
    const canvas = posterCanvasRef.current;
    if (!canvas) return;

    // Draw full resolution
    drawPosterOnCanvas(canvas, true);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Affiche_${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${adFormat}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Update canvas on parameter change
  useEffect(() => {
    if (posterCanvasRef.current) {
      drawPosterOnCanvas(posterCanvasRef.current);
    }
  }, [adFormat, adTheme, headline, productTitle, productSubtitle, productPrice, originalPrice, badgeText, ctaText, sticker, productImageUrl, customPhone, activeStudioTab]);

  // =========================================================================
  // VIDEO PUB STUDIO & MOTION ENGINE (Canvas 60fps Loop & MediaRecorder)
  // =========================================================================
  useEffect(() => {
    if (activeStudioTab !== 'video') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 1280; // 9:16 Vertical Video format for WhatsApp Status & Reels

    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous';
    imgObj.src = productImageUrl;

    videoStartTimeRef.current = Date.now();

    const renderVideoFrame = () => {
      const elapsed = (Date.now() - videoStartTimeRef.current) / 1000;
      const progress = (elapsed % videoDuration) / videoDuration; // 0 to 1 loop

      const width = canvas.width;
      const height = canvas.height;
      const currentTheme = themeStyles[adTheme];

      // 1. Background Animation (Pulsing Gradient)
      const pulseScale = Math.sin(progress * Math.PI * 2) * 0.2 + 1;
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, (width / 2) * pulseScale * 1.5
      );
      bgGrad.addColorStop(0, currentTheme.bgGradient[1]);
      bgGrad.addColorStop(1, currentTheme.bgGradient[0]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Floating Particles
      ctx.fillStyle = currentTheme.glow;
      for (let i = 0; i < 15; i++) {
        const px = ((i * 123 + elapsed * 50) % width);
        const py = ((i * 231 + Math.sin(elapsed + i) * 80) % height);
        const pSize = (Math.sin(elapsed * 2 + i) + 1.5) * 6;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Header Animated Text
      ctx.fillStyle = currentTheme.accent;
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ ${settings.storeName.toUpperCase()} ⚡`, width / 2, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px system-ui, sans-serif';
      ctx.fillText(headline, width / 2, 130);

      // Countdown Urgency Animation
      const secondsLeft = Math.max(0, Math.floor(videoDuration - (elapsed % videoDuration)));
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 120, 155, 240, 36, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(`⏳ OFFRE EXPIRE DANS : 00:0${secondsLeft}`, width / 2, 179);

      // 4. Product Image with Dynamic Motion (Zoom & Float)
      const imgSize = 460;
      const zoom = videoStyle === 'pulse' 
        ? 1 + Math.sin(progress * Math.PI * 2) * 0.06 
        : 1 + (progress * 0.08);
      const floatY = Math.sin(elapsed * 2.5) * 15;

      const curW = imgSize * zoom;
      const curH = imgSize * zoom;
      const imgX = (width - curW) / 2;
      const imgY = 220 + floatY;

      ctx.save();
      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, curW, curH, 24);
      ctx.clip();
      if (imgObj.complete && imgObj.naturalWidth > 0) {
        ctx.drawImage(imgObj, imgX, imgY, curW, curH);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, curW, curH);
      }
      ctx.restore();

      // Border on video image
      ctx.strokeStyle = currentTheme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, curW, curH, 24);
      ctx.stroke();

      // Badge Floating on video
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 130, imgY + curH - 24, 260, 48, 14);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.fillText(badgeText, width / 2, imgY + curH + 8);

      // 5. Product Title & Price Reveal
      const textY = 770;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 34px system-ui, sans-serif';
      ctx.fillText(productTitle.length > 26 ? productTitle.slice(0, 24) + '...' : productTitle, width / 2, textY);

      ctx.fillStyle = currentTheme.textMuted;
      ctx.font = '500 18px system-ui, sans-serif';
      ctx.fillText(productSubtitle, width / 2, textY + 36);

      // Price Tag Animation
      const priceY = textY + 95;
      ctx.fillStyle = currentTheme.accent;
      ctx.font = '900 46px system-ui, sans-serif';
      ctx.fillText(`${productPrice.toLocaleString('fr-FR')} FCFA`, width / 2, priceY);

      // Strikethrough original price
      if (originalPrice) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`Prix Initial : ${originalPrice.toLocaleString('fr-FR')} FCFA`, width / 2, priceY + 32);
      }

      // 6. WhatsApp Pulsing CTA Button
      const ctaScale = Math.sin(elapsed * 4) * 0.03 + 1;
      const btnW = 540 * ctaScale;
      const btnH = 70 * ctaScale;
      const btnX = (width - btnW) / 2;
      const btnY = 1000;

      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
      btnGrad.addColorStop(0, '#10b981');
      btnGrad.addColorStop(1, '#059669');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 20);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px system-ui, sans-serif';
      ctx.fillText(`💬 ${ctaText.toUpperCase()}`, width / 2, btnY + 44);

      // Footer
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`📞 WhatsApp : ${customPhone}`, width / 2, 1140);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('⚡ Livraison Rapide • Paiement à la Livraison ⚡', width / 2, 1170);

      ctx.textAlign = 'left';

      if (isVideoPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderVideoFrame);
      }
    };

    renderVideoFrame();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeStudioTab, isVideoPlaying, videoDuration, videoStyle, adTheme, headline, productTitle, productSubtitle, productPrice, originalPrice, badgeText, ctaText, productImageUrl, customPhone]);

  // Record Real Video using Browser MediaRecorder API
  const handleRecordVideo = async () => {
    const canvas = videoCanvasRef.current;
    if (!canvas || !('MediaRecorder' in window)) {
      alert('La fonctionnalité d\'enregistrement vidéo est supportée sur Chrome, Edge et Firefox.');
      return;
    }

    setIsRecordingVideo(true);
    setRecordProgress(0);
    setRecordedVideoUrl(null);

    const stream = canvas.captureStream(30); // 30 FPS stream
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideoUrl(videoUrl);
      setIsRecordingVideo(false);
      setRecordProgress(100);

      // Auto trigger download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `Video_Pub_${productTitle.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
      a.click();
    };

    recorder.start();

    // Progress counter
    const startTime = Date.now();
    const durationMs = videoDuration * 1000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(99, Math.floor((elapsed / durationMs) * 100));
      setRecordProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. STUDIO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>STUDIO DE PUBLICITÉ & CRÉATION MÉDIA 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Créez Vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300">Affiches & Vidéos Publicitaires</span> en 1 Clic
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Générez des affiches haute définition (Story WhatsApp, Post Instagram, Bannière) et des vidéos pub animées prêtes à être partagées pour booster vos ventes en <strong>FCFA</strong>.
          </p>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveStudioTab('poster')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStudioTab === 'poster'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Créateur d'Affiches HD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('video')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStudioTab === 'video'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Studio Vidéo & Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeStudioTab === 'templates'
                ? 'bg-amber-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Modèles Prêts</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN STUDIO WORKSPACE (POSTER / VIDEO) */}
      {(activeStudioTab === 'poster' || activeStudioTab === 'video') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTROLS & CUSTOMIZATION FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Catalog Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>1. Sélectionner un Produit du Catalogue :</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectCatalogProduct(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Formats (For Poster Tab) */}
            {activeStudioTab === 'poster' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-500" />
                  <span>2. Format de l'Affiche :</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'story', label: 'Story / WhatsApp', ratio: '9:16', icon: Smartphone },
                    { id: 'square', label: 'Post Carré (Insta/FB)', ratio: '1:1', icon: Square },
                    { id: 'banner', label: 'Bannière Web', ratio: '16:9', icon: Monitor }
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    const isSel = adFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setAdFormat(fmt.id as AdFormat)}
                        className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          isSel
                            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 font-black'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{fmt.label}</span>
                        <span className="text-[10px] text-slate-400">{fmt.ratio}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video Styles & Duration (For Video Tab) */}
            {activeStudioTab === 'video' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Style d'Animation Vidéo :
                  </label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="pulse">Zoom & Pulsation Énergique</option>
                    <option value="slide">Glissement Cyber Fluide</option>
                    <option value="luxe">Luxe & Élégance Flottante</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Durée de la Vidéo :
                  </label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 Secondes (Idéal Story / Statut)</option>
                    <option value={8}>8 Secondes (Recommandé)</option>
                    <option value={12}>12 Secondes (Complet)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Visual Themes Palette */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>3. Palette de Couleurs & Thème :</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(Object.keys(themeStyles) as AdTheme[]).map((thmKey) => {
                  const thm = themeStyles[thmKey];
                  const isSel = adTheme === thmKey;
                  return (
                    <button
                      key={thmKey}
                      type="button"
                      onClick={() => setAdTheme(thmKey)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                        isSel
                          ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${thm.bgGradient[0]}, ${thm.bgGradient[1]})` }}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/30" style={{ background: thm.accent }} />
                      <span className="text-[10px] font-black text-white truncate">{thm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant Button */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs font-black text-purple-900 dark:text-purple-200">Générateur IA de Slogans & Accroches</p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400">Rédigez automatiquement des textes percutants avec l'IA Aïda.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiCatchphrase}
                disabled={isAiGenerating}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAiGenerating ? 'Génération...' : (aiSuccessMsg ? 'Généré !' : 'Générer')}</span>
              </button>
            </div>

            {/* Text Customizations */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre d'Accroche :</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge Promotion :</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom du Produit :</label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sous-titre / Avantage :</label>
                  <input
                    type="text"
                    value={productSubtitle}
                    onChange={(e) => setProductSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prix Promo (FCFA) :</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prix Barré (FCFA) :</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 line-through font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sticker Décoratif :</label>
                  <input
                    type="text"
                    value={sticker}
                    onChange={(e) => setSticker(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bouton d'Action (CTA) :</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL de l'Image du Produit :</label>
                <input
                  type="text"
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

          </div>

          {/* RIGHT: LIVE PREVIEW & EXPORT ACTIONS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            
            {/* Visual Screen Box */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col items-center justify-center space-y-4">
              
              <div className="flex items-center justify-between w-full text-xs text-slate-400 font-bold border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aperçu en Temps Réel HD</span>
                </span>
                <span>{activeStudioTab === 'poster' ? `${adFormat.toUpperCase()}` : 'REELS / 9:16'}</span>
              </div>

              {/* POSTER CANVAS PREVIEW */}
              {activeStudioTab === 'poster' && (
                <div className="w-full flex justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-inner">
                  <canvas
                    ref={posterCanvasRef}
                    className="max-h-[460px] w-auto object-contain rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* VIDEO CANVAS PREVIEW */}
              {activeStudioTab === 'video' && (
                <div className="w-full flex flex-col items-center justify-center space-y-3">
                  <div className="w-full flex justify-center overflow-hidden rounded-2xl border border-purple-500/40 bg-slate-900/60 shadow-2xl relative">
                    <canvas
                      ref={videoCanvasRef}
                      className="max-h-[440px] w-auto object-contain rounded-xl shadow-lg"
                    />

                    {/* Play/Pause Overlay Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="absolute bottom-4 right-4 p-3 bg-slate-950/80 hover:bg-slate-900 text-white rounded-full border border-slate-700 shadow-xl cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                  </div>

                  {/* Video Recording Status */}
                  {isRecordingVideo && (
                    <div className="w-full space-y-1.5 p-3 bg-purple-950/80 border border-purple-500 rounded-xl text-center">
                      <p className="text-xs font-black text-purple-200">
                        🎥 Capture & Enregistrement Vidéo : {recordProgress}%
                      </p>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-200"
                          style={{ width: `${recordProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DOWNLOAD & SHARE ACTIONS */}
              <div className="w-full space-y-2.5 pt-2">
                {activeStudioTab === 'poster' && (
                  <button
                    type="button"
                    onClick={handleDownloadPoster}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger l'Affiche en HD (PNG)</span>
                  </button>
                )}

                {activeStudioTab === 'video' && (
                  <button
                    type="button"
                    onClick={handleRecordVideo}
                    disabled={isRecordingVideo}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-pink-900/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isRecordingVideo ? 'Enregistrement en cours...' : 'Générer & Télécharger la Vidéo Pub (.webm)'}</span>
                  </button>
                )}

                {/* Direct Share on WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const text = `🔥 *${headline}*\n\n🛍️ *${productTitle}*\n💰 Prix Promo Spécial : *${formatPrice(productPrice)}* (au lieu de ${formatPrice(originalPrice)})\n\n👉 Commandez directement ici sur WhatsApp :`;
                    const url = generateWhatsAppGeneralLink(text);
                    window.open(url, '_blank');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager le Texte Promo sur WhatsApp</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 3. TEMPLATES GALLERY TAB */}
      {activeStudioTab === 'templates' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Modèles Publicitaires Prêts à l'Emploi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Chargez un modèle pré-stylisé en 1 clic pour créer votre affiche ou vidéo pub instantanément.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'tpl-flash',
                title: '⚡ Vente Flash Week-end -35%',
                format: 'story' as AdFormat,
                theme: 'neon' as AdTheme,
                head: 'VENTE FLASH DU WEEK-END 🔥',
                sub: 'Jusqu\'à -35% de réduction immédiate à Dakar.',
                badge: 'SUPER DEAL -35%',
                sticker: '⚡ SEULEMENT CE WEEK-END',
                desc: 'Thème vibrant néon violet & rose pour créer l\'urgence.'
              },
              {
                id: 'tpl-luxe',
                title: '💎 Horlogerie & Luxe Prestige',
                format: 'square' as AdFormat,
                theme: 'gold' as AdTheme,
                head: 'COLLECTION LUXE & PRESTIGE 👑',
                sub: 'Articles originaux certifiés avec livraison sécurisée.',
                badge: 'SÉRIE LIMITÉE',
                sticker: '⭐ 100% GARANTI',
                desc: 'Design royal or et noir pour les montres et parfums rares.'
              },
              {
                id: 'tpl-streetwear',
                title: '👟 Arrivage Sneakers & Streetwear',
                format: 'story' as AdFormat,
                theme: 'sunset' as AdTheme,
                head: 'NOUVEL ARRIVAGE TENDANCE 🚀',
                sub: 'Les paires les plus recherchées disponibles en stock.',
                badge: 'NOUVEAU',
                sticker: '🔥 MEILLEURE VENTE',
                desc: 'Ambiance streetwear moderne et chaude pour la mode.'
              },
              {
                id: 'tpl-hightech',
                title: '📱 High-Tech & Objets Connectés',
                format: 'banner' as AdFormat,
                theme: 'cyberpunk' as AdTheme,
                head: 'HIGH-TECH & INNOVATION ⚡',
                sub: 'Smartwatches et écouteurs sans fil haute performance.',
                badge: 'TECH PERFORMANCE',
                sticker: '🚚 LIVRAISON 24H',
                desc: 'Bannière paysage cyberpunk pour les réseaux sociaux.'
              },
              {
                id: 'tpl-bio',
                title: '🌿 Soins, Cosmétique & Bien-Être',
                format: 'square' as AdFormat,
                theme: 'emerald' as AdTheme,
                head: 'SOINS NATURELS D\'EXCEPTION 🍃',
                sub: 'Sublimez votre routine avec nos extraits précieux.',
                badge: 'QUALITÉ SUPÉRIEURE',
                sticker: '✨ 100% NATUREL',
                desc: 'Thème émeraude apaisant pour les cosmétiques et parfums.'
              },
              {
                id: 'tpl-vip',
                title: '🎁 Offre Spéciale Fêtes & Cadeaux',
                format: 'story' as AdFormat,
                theme: 'gold' as AdTheme,
                head: 'LE CADEAU IDÉAL À OFFRIR 🎁',
                sub: 'Emballage cadeau de prestige offert pour toute commande.',
                badge: 'PACK CADEAU VIP',
                sticker: '💝 EMBALLAGE OFFERT',
                desc: 'Format story idéal pour les fêtes, Tabaski et Korité.'
              }
            ].map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {tpl.format.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{tpl.theme.toUpperCase()}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{tpl.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{tpl.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLoadTemplate(tpl)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Utiliser ce Modèle dans le Studio</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
