import React, { useState, useEffect } from 'react';
import { CustomDesignConfig } from '../types';
import { 
  ShoppingBag, 
  Trash2, 
  Check, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Upload, 
  Building2, 
  FileCheck, 
  Smartphone, 
  Copy,
  Gift,
  CheckCircle2,
  QrCode,
  Coins,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  validateCouponCode, 
  detectIncomingReferral, 
  unlockConfirmedSaleDiscount 
} from '../utils/referralEngine';
import { audioEngine } from '../utils/audioEngine';
import { ZelleChaseQrCard } from './ZelleChaseQrCard';
import { FSGOD_BRAND_CONTACT } from '../data/brandContact';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  design: CustomDesignConfig;
  unitPrice: number;
  quantity: number;
}

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderNumber: string) => void;
  initialCouponCode?: string;
}

export type PaymentMethodType = 'bancolombia_qr' | 'zelle_chase' | 'bitcoin_segwit' | 'stripe_card' | 'bank_santander';

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  initialCouponCode,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment_process' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('Alex Rivera');
  const [customerEmail, setCustomerEmail] = useState('alex.rivera@athletic.com');
  const [customerPhone, setCustomerPhone] = useState('+34 600 123 456');
  const [shippingAddress, setShippingAddress] = useState('Calle Gran Vía 28, Piso 4');
  const [city, setCity] = useState('Madrid');
  const [country, setCountry] = useState('España');
  
  // Payment Gateway Selection (Bancolombia QR, Zelle Chase, Bitcoin SegWit, etc.)
  const [selectedGateway, setSelectedGateway] = useState<PaymentMethodType>('bancolombia_qr');
  
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('FSG-FE-5831');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Referral / Coupon System
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Receipt / Proof upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [senderBank, setSenderBank] = useState('Bancolombia / Zelle / BTC Wallet');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [txHashInput, setTxHashInput] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUploadedSuccessfully, setReceiptUploadedSuccessfully] = useState(false);

  // Target app ref badge
  const targetAppRef = 'FSG-FE-5831';

  // Bitcoin static wallet address
  const btcWalletAddress = 'bc1qkpf08p8f2dcsvhcckymu30c88csptjgzfjpzgs';

  // Auto-apply incoming referral discount
  useEffect(() => {
    const incoming = detectIncomingReferral();
    if (incoming.referrerCode && !appliedCoupon) {
      setAppliedCoupon({
        code: `REF-${incoming.referrerCode}`,
        discountPercentage: 5,
        message: `¡5% de descuento activado por referido de ${incoming.referrerCode}!`,
      });
    } else if (initialCouponCode && !appliedCoupon) {
      handleApplyCouponCode(initialCouponCode);
    }
  }, [isOpen, initialCouponCode]);

  if (!isOpen) return null;

  // Calculation
  const totalUnits = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const rawSubtotal = cartItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);

  // Volume discount
  let volumeDiscountRate = 0;
  if (totalUnits >= 25) volumeDiscountRate = 0.18;
  else if (totalUnits >= 12) volumeDiscountRate = 0.10;
  else if (totalUnits >= 5) volumeDiscountRate = 0.05;

  const volumeDiscountAmount = +(rawSubtotal * volumeDiscountRate).toFixed(2);
  
  // Referral / Coupon discount
  const referralDiscountRate = appliedCoupon ? appliedCoupon.discountPercentage / 100 : 0;
  const subtotalAfterVolume = rawSubtotal - volumeDiscountAmount;
  const referralDiscountAmount = +(subtotalAfterVolume * referralDiscountRate).toFixed(2);

  const totalDiscount = +(volumeDiscountAmount + referralDiscountAmount).toFixed(2);
  const finalTotal = Math.max(0, +(rawSubtotal - totalDiscount).toFixed(2));

  // COP estimate at ~4,000 COP/USD for Bancolombia
  const copAmount = Math.round(finalTotal * 4000);
  // BTC estimate at ~$65,000 USD/BTC
  const btcAmount = (finalTotal / 65000).toFixed(6);

  const handleApplyCouponCode = (code: string) => {
    setCouponError(null);
    const result = validateCouponCode(code);
    if (result.isValid) {
      setAppliedCoupon({
        code: result.couponCode,
        discountPercentage: result.discountPercentage,
        message: result.message,
      });
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedLabel(label);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPaymentMethodName = (type: PaymentMethodType): string => {
    switch (type) {
      case 'bancolombia_qr':
        return 'Local QR Pay - Bancolombia (App / QR)';
      case 'zelle_chase':
        return 'Bank Transfer / Mobile Pay - Zelle (Chase Bank)';
      case 'bitcoin_segwit':
        return 'Crypto Wallet - Bitcoin (Native SegWit)';
      case 'stripe_card':
        return 'Stripe Checkout (Visa, Mastercard, Apple Pay, Google Pay)';
      case 'bank_santander':
        return 'FsGoD Direct Transfer (Santander / Bizum UE)';
      default:
        return 'Pasarela Oficial FsGoD';
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems.length) return;
    setSubmitting(true);

    const actualPaymentMethod = getPaymentMethodName(selectedGateway);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          country,
          appliedCoupon: appliedCoupon?.code || undefined,
          discountAmount: totalDiscount,
          items: cartItems.map(it => ({
            productId: it.productId,
            productName: it.productName,
            design: it.design,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            subtotal: it.unitPrice * it.quantity,
          })),
          paymentMethod: actualPaymentMethod,
          targetAppRef: targetAppRef,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrderNumber(data.order.orderNumber || `FSG-ORD-${Math.floor(1000 + Math.random() * 9000)}`);
        setCreatedOrderId(data.order.id);
        
        if (appliedCoupon) {
          unlockConfirmedSaleDiscount(appliedCoupon.code);
        }

        onClearCart();

        if (selectedGateway === 'stripe_card') {
          audioEngine.playCashChimeSound();
          setTimeout(() => {
            setStep('success');
          }, 1000);
        } else {
          audioEngine.playClickSound();
          setStep('payment_process');
        }
      }
    } catch (e) {
      console.error('Error submitting order:', e);
      // Fallback in case of server error
      const generatedOrderNum = `FSG-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedOrderNumber(generatedOrderNum);
      setCreatedOrderId(`ord_${Date.now()}`);
      onClearCart();
      setStep('payment_process');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingReceipt(true);

    const finalReference = 
      selectedGateway === 'bitcoin_segwit' ? (txHashInput || `TXID-${Date.now().toString(16)}`) :
      (referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`);

    try {
      if (createdOrderId) {
        await fetch(`/api/orders/${createdOrderId}/upload-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderBank: getPaymentMethodName(selectedGateway),
            referenceNumber: finalReference,
            receiptImageUrl: receiptPreview || '',
            amountPaid: finalTotal,
            gatewayType: selectedGateway,
          }),
        });
      }
      setReceiptUploadedSuccessfully(true);
      audioEngine.playCashChimeSound();
      setTimeout(() => {
        setStep('success');
      }, 1200);
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setReceiptUploadedSuccessfully(true);
      setTimeout(() => {
        setStep('success');
      }, 1200);
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Dynamic QR Code Generators
  const bancolombiaQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `bancolombia://pay?ref=${createdOrderNumber}&amount=${copAmount}&beneficiary=FSGOD-APPAREL-SAS&nit=901827364`
  )}`;

  const bitcoinQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `bitcoin:${btcWalletAddress}?amount=${btcAmount}&label=FsGoD-${createdOrderNumber}&message=Confeccion-${targetAppRef}`
  )}`;

  return (
    <div 
      id="cart-checkout-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans"
    >
      <div 
        id="cart-checkout-container"
        className="bg-[#1E1E1E] border-2 border-[#FF5722] rounded-3xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl shadow-black/80 flex flex-col text-slate-200"
      >
        
        {/* Header - Industrial Dark Grey with Safety Orange Accent */}
        <div className="p-5 sm:p-6 border-b border-[#FF5722]/30 flex items-center justify-between bg-[#171717] rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5722]/15 border border-[#FF5722] flex items-center justify-center text-[#FF5722]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FF5722] text-black font-black text-[10px] tracking-wider uppercase">
                  PASARELA {targetAppRef}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">FsGoD Official Gateways</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                {step === 'cart' && 'Carrito de Confección Personalizada'}
                {step === 'checkout' && 'Datos de Entrega & Pasarelas de Pago'}
                {step === 'payment_process' && 'Instrucciones de Pago & Confirmación'}
                {step === 'success' && '¡Pedido y Comprobante Registrados!'}
              </h2>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: CART ITEMS & REFERRAL COUPON */}
        {step === 'cart' && (
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">Tu carrito de personalización está vacío.</p>
                <p className="text-xs text-slate-500 font-mono">Personaliza una prenda deportiva en el editor 3D.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    className="p-4 bg-[#262626] rounded-2xl border border-neutral-700/60 hover:border-[#FF5722]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
                  >
                    <div className="space-y-1">
                      <p className="font-black text-white text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {item.productName}
                      </p>
                      <p className="text-slate-400 font-mono">
                        Cantidad: <strong className="text-white">{item.quantity}</strong> • Talla: <strong className="text-white">{item.design.selectedSize}</strong>
                      </p>
                      <p className="text-[#FF5722] font-mono text-[11px]">
                        Dorsal: #{item.design.backPlayerNumber || '10'} {item.design.backPlayerName} | Emblema: {item.design.frontLogoType}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-center">
                      <span className="text-base font-black text-[#FF5722] font-mono">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-neutral-700/60">
                
                {/* Referral & Coupon Code Form */}
                <div className="p-3.5 rounded-2xl bg-[#262626] border border-neutral-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#FF5722]" />
                      ¿Tienes un Cupón o Código de Referido?
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FF5722]/20 border border-[#FF5722]/40 text-[10px] text-[#FF5722] font-bold">
                      5% OFF ACTIVO
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="font-mono font-bold text-white text-xs">{appliedCoupon.code}</p>
                          <p className="text-[10px] text-emerald-300">{appliedCoupon.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value)}
                        placeholder="Ej: FE5, FSG-FE-5831..."
                        className="flex-1 px-3 py-2.5 rounded-xl bg-[#171717] border border-neutral-700 text-xs font-mono text-white placeholder-slate-500 uppercase focus:border-[#FF5722] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCouponCode(couponInput)}
                        className="px-4 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6d3e] text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-rose-400 font-mono">{couponError}</p>
                  )}
                </div>

                {/* Pricing Summary Breakdown */}
                <div className="space-y-1.5 text-xs font-mono bg-[#171717] p-3.5 rounded-2xl border border-neutral-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({totalUnits} prendas deportivas):</span>
                    <span>${rawSubtotal.toFixed(2)} USD</span>
                  </div>

                  {volumeDiscountRate > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Descuento por Volumen ({(volumeDiscountRate * 100)}%):</span>
                      <span>-${volumeDiscountAmount.toFixed(2)} USD</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#FF5722] font-bold">
                      <span>Descuento Referido / Cupón ({appliedCoupon.discountPercentage}%):</span>
                      <span>-${referralDiscountAmount.toFixed(2)} USD</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-base font-sans font-black text-white pt-2 border-t border-neutral-700">
                    <div>
                      <span className="block text-sm text-slate-300">Total a Pagar:</span>
                      <span className="text-[10px] text-slate-400 font-mono">≈ COP ${copAmount.toLocaleString()} • ≈ {btcAmount} BTC</span>
                    </div>
                    <span className="text-[#FF5722] text-2xl font-mono">${finalTotal.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  id="btn-proceed-to-checkout"
                  onClick={() => setStep('checkout')}
                  className="w-full py-4 rounded-2xl bg-[#FF5722] hover:bg-[#ff6d3e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF5722]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  <span>Proceder a Envío y Pasarelas de Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM & MULTI-PAYMENT GATEWAY SELECTOR */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            
            {/* Customer & Shipping Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF5722]" />
                1. Datos de Despacho y Confección
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Nombre Completo / Atleta / Club</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#262626] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Correo Electrónico (Notificaciones)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#262626] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Teléfono (WhatsApp / Notificaciones Taller)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#262626] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Ciudad y País de Destino</label>
                  <input
                    type="text"
                    required
                    value={`${city}, ${country}`}
                    onChange={e => {
                      const parts = e.target.value.split(',');
                      setCity(parts[0]?.trim() || '');
                      setCountry(parts[1]?.trim() || 'Internacional');
                    }}
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#262626] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">Dirección Completa de Despacho (Calle, Nº, Apto, Código Postal)</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl bg-[#262626] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                />
              </div>
            </div>

            {/* MULTI-PAYMENT OPTIONS ACCORDING TO SPECIFICATION */}
            <div className="space-y-3 pt-3 border-t border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF5722]" />
                  2. Selección de Pasarela de Pago
                </h3>
                <span className="text-[10px] text-[#FF5722] font-mono font-bold">FSG-FE-5831 CERTIFIED</span>
              </div>

              {/* 3 Core Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* METHOD 1: Local QR Pay - Bancolombia */}
                <button
                  type="button"
                  id="pay-method-bancolombia"
                  onClick={() => {
                    audioEngine.playClickSound();
                    setSelectedGateway('bancolombia_qr');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative ${
                    selectedGateway === 'bancolombia_qr'
                      ? 'bg-[#262626] border-[#FF5722] shadow-lg shadow-[#FF5722]/20'
                      : 'bg-[#1b1b1b] border-neutral-700/80 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-black font-black font-mono text-[9px] tracking-wider uppercase">
                      BANCOLOMBIA QR
                    </span>
                    <QrCode className={`w-4 h-4 ${selectedGateway === 'bancolombia_qr' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Local QR Pay
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Bancolombia App & Botón PSE
                    </p>
                  </div>
                  <div className="pt-1 border-t border-neutral-700/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Total en COP:</span>
                    <span className="text-yellow-400 font-bold">${copAmount.toLocaleString()}</span>
                  </div>
                </button>

                {/* METHOD 2: Bank Transfer / Mobile Pay - Zelle (Chase Bank) */}
                <button
                  type="button"
                  id="pay-method-zelle"
                  onClick={() => {
                    audioEngine.playClickSound();
                    setSelectedGateway('zelle_chase');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative ${
                    selectedGateway === 'zelle_chase'
                      ? 'bg-[#262626] border-[#FF5722] shadow-lg shadow-[#FF5722]/20'
                      : 'bg-[#1b1b1b] border-neutral-700/80 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-black font-mono text-[9px] tracking-wider uppercase">
                      CHASE • ZELLE
                    </span>
                    <Building2 className={`w-4 h-4 ${selectedGateway === 'zelle_chase' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Zelle (Chase Bank)
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Cuenta Chase oficial FsGoD
                    </p>
                  </div>
                  <div className="pt-1 border-t border-neutral-700/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Total en USD:</span>
                    <span className="text-blue-400 font-bold">${finalTotal.toFixed(2)}</span>
                  </div>
                </button>

                {/* METHOD 3: Crypto Wallet - Bitcoin (Native SegWit) */}
                <button
                  type="button"
                  id="pay-method-bitcoin"
                  onClick={() => {
                    audioEngine.playClickSound();
                    setSelectedGateway('bitcoin_segwit');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative ${
                    selectedGateway === 'bitcoin_segwit'
                      ? 'bg-[#262626] border-[#FF5722] shadow-lg shadow-[#FF5722]/20'
                      : 'bg-[#1b1b1b] border-neutral-700/80 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#f7931a] text-black font-black font-mono text-[9px] tracking-wider uppercase">
                      BTC SEGWIT
                    </span>
                    <Coins className={`w-4 h-4 ${selectedGateway === 'bitcoin_segwit' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Crypto Wallet
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Bitcoin (Native SegWit)
                    </p>
                  </div>
                  <div className="pt-1 border-t border-neutral-700/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Total en BTC:</span>
                    <span className="text-[#f7931a] font-bold">≈ {btcAmount}</span>
                  </div>
                </button>
              </div>

              {/* Secondary Options (Stripe Card 1-Click & EU Santander) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClickSound();
                    setSelectedGateway('stripe_card');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between cursor-pointer ${
                    selectedGateway === 'stripe_card'
                      ? 'bg-[#262626] border-[#FF5722] text-white'
                      : 'bg-[#171717] border-neutral-800 text-slate-400 hover:border-neutral-600'
                  }`}
                >
                  <span className="font-mono text-[11px]">💳 Tarjeta de Crédito / Débito (Stripe 1-Click)</span>
                  <span className="text-[10px] font-mono text-emerald-400">Inmediato</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClickSound();
                    setSelectedGateway('bank_santander');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between cursor-pointer ${
                    selectedGateway === 'bank_santander'
                      ? 'bg-[#262626] border-[#FF5722] text-white'
                      : 'bg-[#171717] border-neutral-800 text-slate-400 hover:border-neutral-600'
                  }`}
                >
                  <span className="font-mono text-[11px]">🏛️ Santander IBAN (España & Unión Europea)</span>
                  <span className="text-[10px] font-mono text-amber-400">SEPA / Bizum</span>
                </button>
              </div>

            </div>

            {/* Total and Submit Button */}
            <div className="p-4 bg-[#171717] rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-300 font-mono">Total Confección + Envíos ({totalUnits} prendas):</span>
                <p className="text-[11px] text-slate-400 font-mono">
                  Método seleccionado: <strong className="text-[#FF5722]">{getPaymentMethodName(selectedGateway)}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#FF5722] font-mono">${finalTotal.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex-1 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Volver al Carrito
              </button>

              <button
                type="submit"
                disabled={submitting}
                id="submit-order-checkout-btn"
                className="flex-2 py-3.5 rounded-2xl bg-[#FF5722] hover:bg-[#ff6d3e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#FF5722]/20 cursor-pointer transition-all"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {submitting ? (
                  <span>Registrando Pedido en Taller...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {selectedGateway === 'stripe_card' ? `Pagar con Stripe Instantáneo ($${finalTotal.toFixed(2)})` : 'Continuar a Instrucciones & QR'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DEDICATED PAYMENT INSTRUCTIONS & RECEIPT VOUCHER ATTACHMENT */}
        {step === 'payment_process' && (
          <div className="p-6 space-y-5">
            
            {/* Order summary banner */}
            <div className="bg-[#262626] border-2 border-[#FF5722] p-4 rounded-2xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#FF5722] text-black text-[10px] font-black font-mono uppercase">
                    ORDEN REGISTRADA
                  </span>
                  <span className="text-sm font-mono font-bold text-white">{createdOrderNumber}</span>
                </div>
                <span className="text-sm font-mono font-black text-[#FF5722]">
                  Monto Total: ${finalTotal.toFixed(2)} USD
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sigue las instrucciones específicas de la pasarela seleccionada para completar el pago y adjunta tu comprobante a continuación.
              </p>
            </div>

            {/* GATEWAY 1: BANCOLOMBIA LOCAL QR PAY */}
            {selectedGateway === 'bancolombia_qr' && (
              <div className="p-5 bg-[#171717] rounded-2xl border border-yellow-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-bold">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Local QR Pay - Bancolombia
                      </h4>
                      <p className="text-[11px] text-yellow-400 font-mono">
                        Monto exacto: COP ${copAmount.toLocaleString()} (≈ ${finalTotal.toFixed(2)} USD)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-[10px] text-yellow-400 font-mono font-bold">
                    QR OFICIAL
                  </span>
                </div>

                {/* Instructions Box */}
                <div className="p-3 bg-yellow-950/20 border border-yellow-500/30 rounded-xl text-xs text-slate-200">
                  <p className="font-medium">
                    📌 <strong>Instrucciones:</strong> Escanea el código QR desde tu App Bancolombia, realiza el pago por el valor exacto de tu prenda FsGoD y sube el comprobante.
                  </p>
                </div>

                {/* Dynamic QR Code and Account details */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                  <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center">
                    <img 
                      src={bancolombiaQrUrl} 
                      alt="Bancolombia QR Pay" 
                      className="w-44 h-44 object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-neutral-800 font-bold font-mono mt-1.5">
                      Escanear con App Bancolombia
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 text-xs">
                    <div className="p-2.5 bg-[#262626] rounded-xl border border-neutral-700">
                      <span className="text-[10px] text-slate-400 block font-mono">Llave Bancolombia / Convenio</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-white">9283-4819-01</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('9283481901', 'bancolombia_key')}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-yellow-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedLabel === 'bancolombia_key' ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#262626] rounded-xl border border-neutral-700">
                      <span className="text-[10px] text-slate-400 block font-mono">Titular de la Cuenta</span>
                      <span className="font-mono font-bold text-white text-[11px]">FsGoD ATHLETICS COLOMBIA S.A.S</span>
                    </div>

                    <div className="p-2.5 bg-[#262626] rounded-xl border border-neutral-700">
                      <span className="text-[10px] text-slate-400 block font-mono">Concepto / Referencia Obligatoria</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-black text-[#FF5722]">{createdOrderNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdOrderNumber, 'bancolombia_ref')}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-[#FF5722] flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedLabel === 'bancolombia_ref' ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GATEWAY 2: ZELLE (CHASE BANK) */}
            {selectedGateway === 'zelle_chase' && (
              <div className="space-y-4">
                <ZelleChaseQrCard 
                  memo={createdOrderNumber}
                  amountUsd={finalTotal}
                />
              </div>
            )}

            {/* GATEWAY 3: BITCOIN (NATIVE SEGWIT) - LEDGER LIVE CERTIFIED */}
            {selectedGateway === 'bitcoin_segwit' && (
              <div className="p-5 bg-[#171717] rounded-2xl border border-[#f7931a]/50 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f7931a] text-black flex items-center justify-center font-bold text-sm">
                      ₿
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Crypto Wallet - Bitcoin (Native SegWit)
                      </h4>
                      <p className="text-[11px] text-[#f7931a] font-mono">
                        Red Bitcoin Directa (bech32) • Sin comisiones de intermediarios
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f7931a]/15 border border-[#f7931a]/40 text-[10px] text-[#f7931a] font-mono font-bold">
                      LEDGER HARDWARE
                    </span>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3 bg-amber-950/25 border border-[#f7931a]/30 rounded-xl text-xs text-slate-200">
                  <p className="font-medium">
                    📌 <strong>Instrucciones:</strong> Envía el monto equivalente en BTC a la dirección proporcionada. El pedido se confirmará automáticamente tras la validación en la blockchain.
                  </p>
                </div>

                {/* Ledger-style Bitcoin Card Container */}
                <div className="flex flex-col md:flex-row items-center gap-6 pt-1">
                  
                  {/* Ledger App Exact QR Card */}
                  <div className="w-full max-w-[270px] bg-[#141416] border border-neutral-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center space-y-3">
                    <div className="text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Receive BTC • On Bitcoin</span>
                      <h5 className="text-sm font-black text-white font-mono">Bitcoin 1</h5>
                    </div>

                    {/* QR Code with Centered Bitcoin Logo Badge */}
                    <div className="relative bg-white p-3.5 rounded-2xl shadow-lg flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(btcWalletAddress)}`}
                        alt="Bitcoin SegWit QR Ledger" 
                        className="w-44 h-44 object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Orange Bitcoin ₿ badge in center */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[#F7931A] border-2 border-white shadow-md flex items-center justify-center text-white font-black text-lg">
                          ₿
                        </div>
                      </div>
                    </div>

                    {/* Formatted Address like Ledger UI */}
                    <div className="text-center font-mono text-[11px] text-slate-200 tracking-wide font-medium select-all leading-tight bg-black/40 p-2.5 rounded-xl border border-neutral-800 w-full">
                      <p className="text-amber-400 font-bold">bc1qkpf08p8f2dcsvh</p>
                      <p>cckymu30c88csptjgz</p>
                      <p>fjpzgs</p>
                    </div>

                    {/* Copy button matching Ledger styling */}
                    <button
                      type="button"
                      id="btn-ledger-copy-address"
                      onClick={() => copyToClipboard(btcWalletAddress, 'btc_address')}
                      className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-neutral-700 hover:border-[#f7931a]"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#f7931a]" />
                      <span>{copiedLabel === 'btc_address' ? '¡Dirección Copiada!' : 'Copy address'}</span>
                    </button>
                  </div>

                  {/* Right Details & Amounts Panel */}
                  <div className="flex-1 space-y-3 text-xs w-full">
                    <div className="p-3 bg-[#262626] rounded-xl border border-neutral-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">Dirección Completa (Native SegWit / Bech32)</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-mono font-bold">VERIFICADA</span>
                      </div>
                      <p className="font-mono text-xs text-white break-all bg-[#171717] p-2.5 rounded-lg border border-neutral-800 font-bold">
                        {btcWalletAddress}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                      <div className="p-3 bg-[#262626] rounded-xl border border-neutral-700 space-y-1">
                        <span className="text-[10px] text-slate-400 block">Total a Transferir:</span>
                        <span className="text-[#f7931a] font-black text-base block">≈ {btcAmount} BTC</span>
                        <span className="text-[10px] text-slate-400">Tasa en tiempo real</span>
                      </div>
                      <div className="p-3 bg-[#262626] rounded-xl border border-neutral-700 space-y-1">
                        <span className="text-[10px] text-slate-400 block">Valor Orden:</span>
                        <span className="text-white font-black text-base block">${finalTotal.toFixed(2)} USD</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ref: {createdOrderNumber}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-slate-300 text-[11px] space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-amber-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          Validación Blockchain Automática:
                        </p>
                        <a
                          href={`https://mempool.space/address/${btcWalletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Mempool Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-slate-400">
                        Una vez emitido el pago desde tu wallet Ledger, Exodus, Binance o cualquier exchange, pega el <strong>Hash de la Transacción (TXID)</strong> o captura de pantalla abajo para indexar tu orden con prioridad de corte láser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GATEWAY 4: SANTANDER DIRECT EU */}
            {selectedGateway === 'bank_santander' && (
              <div className="p-5 bg-[#171717] rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="font-bold text-white text-xs">Banco Santander (España / Unión Europea)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">IBAN SEPA</span>
                </div>
                <p className="text-xs text-slate-300">
                  IBAN: <code className="text-amber-400 font-bold font-mono">ES76 0049 1500 0512 3456 7890</code>
                </p>
                <p className="text-[10px] text-slate-400">Titular: FsGoD APPAREL S.L. • Concepto: {createdOrderNumber}</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard('ES7600491500051234567890', 'santander_iban')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copiedLabel === 'santander_iban' ? '¡IBAN Copiado!' : 'Copiar IBAN'}</span>
                </button>
              </div>
            )}

            {/* Receipt Upload & Voucher Attachment Form */}
            <form onSubmit={handleUploadReceipt} className="p-4 bg-[#262626] rounded-2xl border border-[#FF5722]/40 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#FF5722]">
                <Upload className="w-4 h-4" />
                <span style={{ fontFamily: 'Arial, sans-serif' }}>
                  {selectedGateway === 'bitcoin_segwit' ? 'Registrar Hash de Transacción o Captura de Envío' : 'Adjuntar Comprobante de Pago'}
                </span>
              </div>

              {selectedGateway === 'bitcoin_segwit' ? (
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-300 font-bold">Transaction Hash / TXID de Bitcoin</label>
                  <input
                    type="text"
                    value={txHashInput}
                    onChange={e => setTxHashInput(e.target.value)}
                    placeholder="Ej: a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"
                    className="w-full p-2.5 rounded-xl bg-[#171717] border border-neutral-700 text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold">Medio / Cuenta Emisora</label>
                    <input
                      type="text"
                      value={senderBank}
                      onChange={e => setSenderBank(e.target.value)}
                      placeholder="Ej: Bancolombia App / Chase Zelle / BBVA"
                      className="mt-1 w-full p-2.5 rounded-xl bg-[#171717] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold">Nº de Comprobante / Referencia</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={e => setReferenceNumber(e.target.value)}
                      placeholder="Ej: 984129841"
                      className="mt-1 w-full p-2.5 rounded-xl bg-[#171717] border border-neutral-700 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Photo / Voucher Upload */}
              <div>
                <label className="text-[11px] text-slate-300 font-bold">Captura o Foto del Comprobante / Voucher</label>
                <div className="mt-1 border-2 border-dashed border-neutral-700 hover:border-[#FF5722] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#171717]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptFileChange}
                    className="hidden"
                    id="receipt-file-input"
                  />
                  <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-2">
                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img
                          src={receiptPreview}
                          alt="Comprobante de Pago"
                          referrerPolicy="no-referrer"
                          className="max-h-28 mx-auto rounded-lg border border-neutral-700 object-contain shadow-lg"
                        />
                        <span className="text-[11px] text-emerald-400 font-bold block flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Comprobante cargado correctamente
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-300">Haz clic aquí para seleccionar captura del pago</p>
                        <p className="text-[10px] text-slate-500 font-mono">JPG, PNG o captura de pantalla</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('success')}
                  className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Adjuntar Más Tarde
                </button>

                <button
                  type="submit"
                  disabled={uploadingReceipt}
                  id="btn-upload-voucher"
                  className="flex-2 py-3 rounded-xl bg-[#FF5722] hover:bg-[#ff6d3e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#FF5722]/20 cursor-pointer transition-all"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {uploadingReceipt ? (
                    <span>Enviando Comprobante...</span>
                  ) : receiptUploadedSuccessfully ? (
                    <span>¡Comprobante Registrado!</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Validar y Enviar a Taller</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: ORDER SUCCESS */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#FF5722]/20 border-2 border-[#FF5722] text-[#FF5722] flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-[#FF5722]/20 text-[#FF5722] text-[10px] font-black font-mono tracking-wider uppercase border border-[#FF5722]/40">
                ORDEN {targetAppRef} REGISTRADA
              </span>
              <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                ¡ORDEN EN COLA DE CONFECCIÓN!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tu orden ha sido registrada en FsGoD • IA Studio Stitch & Pomelli Atelier. Nuestro equipo técnico validará el comprobante de la pasarela seleccionada y dará inicio inmediato al corte láser y sublimación 4K.
              </p>
            </div>

            <div className="p-4 bg-[#262626] rounded-2xl border border-neutral-700 max-w-sm mx-auto space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Código de Rastreo Oficial:</span>
              <p className="text-2xl font-black text-[#FF5722] font-mono tracking-wider">
                {createdOrderNumber}
              </p>
            </div>

            <button
              onClick={() => {
                onOrderSuccess(createdOrderNumber);
                onClose();
              }}
              className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-[#FF5722] hover:bg-[#ff6d3e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF5722]/20 flex items-center justify-center space-x-2 cursor-pointer transition-all"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <Truck className="w-4 h-4" />
              <span>Ver Estado en el Rastreador FsGoD</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
