'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { PaymentMethod } from '@/lib/types';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUnitPriceForQuantity } from '@/lib/tierPricing';
import { trackAnalyticsEvent } from '@/lib/analytics';

export const CheckoutModal = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    cartShippingFee, 
    cartTotal, 
    formatPrice, 
    settings, 
    createOrder,
    setLastCreatedOrder,
    setCurrentView,
    generateWhatsAppOrderLink,
    customer,
    openCustomerAuth
  } = useStore();

  const [customerName, setCustomerName] = useState(customer?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
  const [customerAddress, setCustomerAddress] = useState(customer?.address || '');
  const [customerCity, setCustomerCity] = useState(customer?.city || 'Cocody');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const wasCheckoutOpen = React.useRef(false);

  React.useEffect(() => {
    if (isCheckoutOpen && !wasCheckoutOpen.current) {
      trackAnalyticsEvent({
        eventType: 'checkout_started',
        path: '/checkout',
        label: 'Ouverture du paiement',
        metadata: { cartItems: cart.length },
      });
    }
    wasCheckoutOpen.current = isCheckoutOpen;
  }, [isCheckoutOpen, cart.length]);

  React.useEffect(() => {
    if (customer) {
      if (customer.fullName && !customerName) setCustomerName(customer.fullName);
      if (customer.phone && !customerPhone) setCustomerPhone(customer.phone);
      if (customer.email && !customerEmail) setCustomerEmail(customer.email);
      if (customer.city && (customerCity === 'Cocody' || customerCity === 'Dakar')) setCustomerCity(customer.city);
      if (customer.address && !customerAddress) setCustomerAddress(customer.address);
    }
  }, [customer, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMsg('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        price: getUnitPriceForQuantity(item.product, item.quantity),
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const newOrder = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        customerNotes: customerNotes.trim() || undefined,
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee: cartShippingFee,
        discountAmount: 0,
        totalAmount: cartTotal,
        currency: settings.currency,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        orderStatus: 'pending',
        directPaymentLinkUsed: paymentMethod === 'payment_link' ? settings.customPaymentLinkUrl : undefined,
      });

      // Fire confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // If WhatsApp payment method selected, automatically open WhatsApp with complete order, product links, and images
      if (paymentMethod === 'whatsapp') {
        const whatsappUrl = generateWhatsAppOrderLink(newOrder);
        window.open(whatsappUrl, '_blank');
      }

      setIsCheckoutOpen(false);
      setCurrentView('order-success');
    } catch (err: any) {
      setErrorMsg('Une erreur est survenue lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-w-3xl w-full my-8 relative flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {settings.storeLogoUrl ? (
              <img
                src={settings.storeLogoUrl}
                alt={settings.storeName}
                className="h-9 w-auto max-w-[120px] object-contain rounded-md"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Finaliser Votre Commande
              </h2>
              <p className="text-xs text-slate-500">
                {settings.storeName} • Paiement sécurisé et confirmation instantanée
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Customer Logged In Status or Login Prompt */}
          {customer ? (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {customer.fullName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-indigo-900 block">Connecté en tant que {customer.fullName}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">✓ Coordonnées pré-remplies • +{Math.floor(cartTotal / 1000)} Points VIP gagnés sur cet achat</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">VIP</span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Déjà un compte client ?</span>
              </div>
              <button
                type="button"
                onClick={() => { setIsCheckoutOpen(false); openCustomerAuth('login'); }}
                className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
              >
                Se connecter en 1-clic →
              </button>
            </div>
          )}

          {/* Section 1: Informations Client */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-600" />
              <span>1. Vos Coordonnées & Livraison</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Jean-Marc Kouadio"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Numéro de Téléphone / WhatsApp (Côte d'Ivoire) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: +225 07 12 34 56 78 (10 chiffres)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adresse Email (Facultatif)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Ex: client@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Commune / Ville (Côte d'Ivoire) *</label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    🇨🇮 Abidjan & Intérieur
                  </span>
                </div>
                <select
                  required
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <optgroup label="📍 Abidjan Nord & Centre (Zone 1 - Express 24h)">
                    <option value="Cocody">Cocody (Angré, Riviera, 2 Plateaux, Danga)</option>
                    <option value="Le Plateau">Le Plateau (Centre des affaires)</option>
                    <option value="Adjamé">Adjamé</option>
                    <option value="Attécoubé">Attécoubé</option>
                    <option value="Abobo">Abobo</option>
                  </optgroup>
                  <optgroup label="📍 Abidjan Sud & Ouest (Zone 2 - Express 24h)">
                    <option value="Marcory">Marcory (Zone 4, Biétry, Anoumabo)</option>
                    <option value="Yopougon">Yopougon (Selmer, Maroc, Niangon, Toit Rouge)</option>
                    <option value="Koumassi">Koumassi (Remblais, Prodomo)</option>
                    <option value="Treichville">Treichville (Arras, Avenue 1-25)</option>
                    <option value="Port-Bouët">Port-Bouët (Aéroport, Vridi)</option>
                  </optgroup>
                  <optgroup label="📍 Périphérie Grand Abidjan (Zone 3 - 24h à 48h)">
                    <option value="Bingerville">Bingerville</option>
                    <option value="Songon">Songon</option>
                    <option value="Grand-Bassam">Grand-Bassam</option>
                  </optgroup>
                  <optgroup label="🚛 Villes de l'Intérieur (Expédition sécurisée)">
                    <option value="Yamoussoukro">Yamoussoukro (Capitale politique)</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="San-Pédro">San-Pédro</option>
                    <option value="Korhogo">Korhogo</option>
                    <option value="Daloa">Daloa</option>
                    <option value="Man">Man</option>
                    <option value="Gagnoa">Gagnoa</option>
                    <option value="Autre ville de Côte d'Ivoire">Autre ville de Côte d'Ivoire</option>
                  </optgroup>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Adresse ou Repère de Livraison Précis *</label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Ex: Riviera 3, Carrefour Faya, près de la pharmacie, Villa 45"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Instructions pour le coursier (Optionnel)</label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ex: Appelez-moi avant de démarrer la course"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mode de Paiement & Liens */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>2. Choix du Mode de Paiement</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Instantané & Sans Frais
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option: Wave Mobile Money CI */}
              {settings.enableWavePayment && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'wave' ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wave"
                    checked={paymentMethod === 'wave'}
                    onChange={() => setPaymentMethod('wave')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <span>Wave CI</span>
                      <span className="text-[10px] bg-sky-500 text-white font-black px-1.5 py-0.2 rounded">POPULAIRE 0%</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">
                      Lien direct ou transfert vers le {settings.waveMerchantPhone || '+225 07 89 01 23 45'}
                    </p>
                  </div>
                </label>
              )}

              {/* Option: MTN Mobile Money (MoMo CI) */}
              {settings.enableMtnMoney !== false && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'mtn_money' ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="mtn_money"
                    checked={paymentMethod === 'mtn_money'}
                    onChange={() => setPaymentMethod('mtn_money')}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <span>MTN MoMo CI</span>
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">MOMO</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">
                      Compte marchand : {settings.mtnMerchantNumber || '+225 05 89 01 23 45'}
                    </p>
                  </div>
                </label>
              )}

              {/* Option: Orange Money CI */}
              {settings.enableOrangeMoney && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="orange_money"
                    checked={paymentMethod === 'orange_money'}
                    onChange={() => setPaymentMethod('orange_money')}
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-slate-900">Orange Money CI</span>
                    <p className="text-xs text-slate-500 leading-tight">
                      Code marchand : {settings.orangeMoneyMerchantNumber || '#144*391# ou +225 07 12 34 56 78'}
                    </p>
                  </div>
                </label>
              )}

              {/* Option: Moov Money CI */}
              {settings.enableMoovMoney !== false && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'moov_money' ? 'border-cyan-600 bg-cyan-50/50 shadow-xs ring-1 ring-cyan-600/20' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="moov_money"
                    checked={paymentMethod === 'moov_money'}
                    onChange={() => setPaymentMethod('moov_money')}
                    className="mt-1 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-slate-900">Moov Money CI</span>
                    <p className="text-xs text-slate-500 leading-tight">
                      Numéro marchand : {settings.moovMerchantNumber || '+225 01 23 45 67 89'}
                    </p>
                  </div>
                </label>
              )}

              {/* Option: Lien de paiement direct / Carte Bancaire */}
              {settings.enableCustomPaymentLink && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'payment_link' ? 'border-indigo-500 bg-indigo-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="payment_link"
                    checked={paymentMethod === 'payment_link'}
                    onChange={() => setPaymentMethod('payment_link')}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-slate-900">Carte Bancaire (Visa / Mastercard)</span>
                    <p className="text-xs text-slate-500 leading-tight">
                      Paiement sécurisé crypté SSL en ligne
                    </p>
                  </div>
                </label>
              )}

              {/* Option: WhatsApp Direct Payment / Order */}
              {settings.whatsappDirectOrderEnabled && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'whatsapp' ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp"
                    checked={paymentMethod === 'whatsapp'}
                    onChange={() => setPaymentMethod('whatsapp')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                      <span>WhatsApp Direct Pay</span>
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">
                      Validation directe par WhatsApp avec notre équipe
                    </p>
                  </div>
                </label>
              )}

              {/* Option: Cash on Delivery (Paiement au livreur) */}
              {settings.enableCashOnDelivery && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  paymentMethod === 'cod' ? 'border-slate-900 bg-slate-100 shadow-xs ring-1 ring-slate-900/20' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-bold text-sm text-slate-900">
                      <span>Paiement à la Livraison</span>
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">
                      Réglez en espèces ou Mobile Money au coursier lors de la remise
                    </p>
                  </div>
                </label>
              )}

            </div>
          </div>

          {/* Recap & Action */}
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Total des articles ({cart.length})</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Frais de livraison</span>
              <span>{cartShippingFee === 0 ? <strong className="text-emerald-400">Gratuit</strong> : formatPrice(cartShippingFee)}</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between text-base font-black">
              <span>Montant Total à Régler</span>
              <span className="text-xl text-indigo-400">{formatPrice(cartTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 text-white font-black text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50 ${
                paymentMethod === 'whatsapp'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <span>Création de la commande...</span>
              ) : paymentMethod === 'whatsapp' ? (
                <>
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Confirmer & Ouvrir WhatsApp ({formatPrice(cartTotal)})</span>
                </>
              ) : (
                <>
                  <span>Confirmer la Commande ({formatPrice(cartTotal)})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
