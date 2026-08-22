import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Send, 
  Gift, 
  Sparkles, 
  ExternalLink, 
  QrCode, 
  Mail, 
  Heart,
  Flame,
  CheckCircle2,
  Twitter,
  Facebook,
  Linkedin,
  Video,
  Camera,
  Calculator,
  Tag
} from 'lucide-react';
import { ProductItem, CustomDesignConfig } from '../types';
import { MasterCatalogProduct } from '../data/masterCatalog';
import { getUserReferralCode, buildReferralLink, executeShare } from '../utils/referralEngine';
import { audioEngine } from '../utils/audioEngine';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  masterProduct?: MasterCatalogProduct | null;
  customDesign?: CustomDesignConfig | null;
  customImageUrl?: string;
  title?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  product,
  masterProduct,
  customDesign,
  customImageUrl,
  title,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const referralCode = getUserReferralCode();
  const productId = masterProduct?.sku || product?.id || customDesign?.productId;
  const shareUrl = buildReferralLink(productId);

  const displayTitle = title || (masterProduct
    ? `[${masterProduct.sku}] ${masterProduct.name}`
    : product 
      ? `FsGoD • ${product.name}` 
      : customDesign 
        ? `FsGoD Custom • ${customDesign.frontText || 'Prenda'} #${customDesign.frontNumber || '10'}` 
        : 'FsGoD • Sportswear & Streetwear');

  const displayImage = customImageUrl || masterProduct?.featuredImage || product?.featuredImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

  const shareText = masterProduct
    ? `¡Pillate esta prenda de FsGoD Streetwear! SKU: ${masterProduct.sku} - "${masterProduct.name}". Precio oficial ($${masterProduct.retailPriceCop.toLocaleString('es-CO')} COP con margen +40% y ahorro de $${masterProduct.customerSavingsCop.toLocaleString('es-CO')} COP). Usa mi código "${referralCode}" para 5% de descuento adicional.`
    : product 
      ? `¡Mira esta prenda "${product.name}" de FsGoD! Usa mi enlace de referido para conseguir 5% de descuento en tu compra personalizada.`
      : customDesign
        ? `¡He diseñado esta prenda en FsGoD con dorsal ${customDesign.backPlayerNumber || '10'}! Consigue 5% OFF con mi enlace de referido.`
        : `Descubre FsGoD (Dios por Delante) y personaliza tu prenda urbana con un 5% de descuento exclusivo.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setFeedback('¡Enlace de referido copiado al portapapeles! 🎉');
      setTimeout(() => {
        setCopied(false);
        setFeedback(null);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    const res = await executeShare({
      product: product || undefined,
      customTitle: displayTitle,
      customText: shareText,
    });
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n👉 ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=FsGoD,Streetwear,Colombia`;
    window.open(url, '_blank');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(displayTitle);
    const body = encodeURIComponent(`${shareText}\n\nExplora la prenda aquí:\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareTikTok = async () => {
    audioEngine.playTapeScratchSound();
    const caption = `🔥 ${displayTitle} | FsGoD Official Drop 2026 #FsGoD #Streetwear #Barranquilla #ViralReels\n👉 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(caption);
      setFeedback('¡Caption copiado para TikTok! Pégalo en tu próximo video con sonido y etiqueta a @fsgodstreetwear 🎵');
    } catch (e) {
      console.error(e);
    }
  };

  const shareInstagramReels = async () => {
    audioEngine.playSprayCanSound();
    const caption = `⚡ FsGoD Drop 2026 • ${displayTitle}\nUsa mi código de descuento "${referralCode}" en el checkout.\n👉 ${shareUrl} #FsGoD #Streetwear #DiosPorDelante #Viral`;
    try {
      await navigator.clipboard.writeText(caption);
      setFeedback('¡Caption copiado para Instagram Reels / Stories! 📸');
    } catch (e) {
      console.error(e);
    }
  };

  // Generate an elegant SVG QR representation for scanning
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=0a192f&color=f59e0b&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a0e17] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>COMPARTIR PRENDA & GANAR 5% DE DESCUENTO</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
            Comparte esta Prenda FsGoD
          </h2>

          <p className="text-xs text-slate-300">
            Tus parceros obtienen un <strong className="text-amber-400">5% de descuento inmediato</strong> y tú acumulas crédito para tus compras en taller.
          </p>
        </div>

        {/* Product Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#0a192f] border border-slate-800 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0">
            <img 
              src={displayImage} 
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                REF: {referralCode}
              </span>
              {masterProduct && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  SKU: {masterProduct.sku}
                </span>
              )}
              <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-0.5">
                <Gift className="w-3 h-3" /> Bono 5%
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate mt-1">{displayTitle}</h4>
            {masterProduct ? (
              <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                <span>${masterProduct.retailPriceCop.toLocaleString('es-CO')} COP</span>
                <span className="text-zinc-500 line-through text-[10px]">${masterProduct.competitorPriceCop.toLocaleString('es-CO')}</span>
                <span className="text-amber-400 text-[10px]">Margen +40%</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 truncate">{product?.subtitle || 'Personalización en 3D & Sublimación 4K'}</p>
            )}
          </div>
        </div>

        {/* Primary Social Buttons Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider block">
            Selecciona canal para compartir la prenda:
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            
            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="p-3.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            {/* Instagram Reels */}
            <button
              onClick={shareInstagramReels}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/40 to-slate-900 border border-pink-500/40 hover:border-pink-400 text-pink-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-pink-500/50">
                <Camera className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <span>Instagram / Stories</span>
            </button>

            {/* TikTok */}
            <button
              onClick={shareTikTok}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#121212] to-slate-900 border border-slate-700 hover:border-pink-500/80 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400">
                <Video className="w-3.5 h-3.5 text-pink-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="group-hover:text-pink-300 transition-colors">TikTok</span>
            </button>

            {/* Telegram */}
            <button
              onClick={shareTelegram}
              className="p-3.5 rounded-2xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <Send className="w-6 h-6 text-sky-400" />
              <span>Telegram</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={shareTwitter}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <span className="text-lg font-black leading-none">𝕏</span>
              <span>Twitter / 𝕏</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareFacebook}
              className="p-3.5 rounded-2xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <Facebook className="w-6 h-6 text-blue-400" />
              <span>Facebook</span>
            </button>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Native Web Share */}
            <button
              onClick={handleNativeShare}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Compartir en App</span>
            </button>

            {/* Email */}
            <button
              onClick={shareEmail}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Por Correo</span>
            </button>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQr(!showQr)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{showQr ? 'Ocultar QR' : 'Código QR'}</span>
            </button>
          </div>
        </div>

        {/* QR Code Dropdown */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-[#0a192f] border border-amber-400/30 flex flex-col items-center text-center space-y-2 animate-fade-in">
            <span className="text-xs font-mono text-slate-300 font-bold">
              Escanea con la cámara de tu móvil para abrir con tu 5% de descuento:
            </span>
            <div className="p-2 bg-[#0a192f] rounded-xl border border-amber-400/40">
              <img 
                src={qrSvgUrl} 
                alt="QR Code" 
                className="w-40 h-40 rounded-lg mx-auto" 
              />
            </div>
            <span className="text-[10px] font-mono text-amber-400">Código de Referido: {referralCode}</span>
          </div>
        )}

        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider block">
            O copia tu enlace directo:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono text-center flex items-center justify-center space-x-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

      </div>
    </div>
  );
};
