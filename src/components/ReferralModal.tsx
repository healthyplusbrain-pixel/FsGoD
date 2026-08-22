import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Flame, 
  Sparkles, 
  Users, 
  Percent, 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  getUserReferralCode, 
  buildReferralLink, 
  getReferralStats, 
  executeShare 
} from '../utils/referralEngine';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCouponInCart?: (code: string) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  onApplyCouponInCart,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const referralCode = getUserReferralCode();
  const referralLink = buildReferralLink();
  const stats = getReferralStats();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      if (onApplyCouponInCart) {
        onApplyCouponInCart(code);
      }
      setTimeout(() => setCopiedCoupon(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    const res = await executeShare({
      customTitle: 'FsGoD • Sportswear & Streetwear',
      customText: `¡Únete a la familia FsGoD! Usa mi código ${referralCode} para obtener un 5% de descuento en tu prenda urbana personalizada.`,
    });
    setShareFeedback(res.message);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Descubre la ropa deportiva y urbana personalizada de FsGoD (Dios por Delante). Usa mi enlace de referido para conseguir 5% de descuento directo en tu primera compra: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`FsGoD • Dios por Delante | 5% OFF`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0e17] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>PROGRAMA DE EMBAJADORES FsGoD</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Comparte la Fe & Gana <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
              5% de Descuento en Cada Venta Confirmada
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Invita a tus compañeros de equipo, amigos del gimnasio y atletas de fe. Cuando compren con tu enlace o código, <strong className="text-amber-300">ellos reciben 5% de descuento</strong> y tú desbloqueas automáticamente un <strong className="text-amber-300">cupón del 5% adicional</strong> para tu próxima compra.
          </p>
        </div>

        {/* Dynamic Referral Link Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0a192f] border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Tu Enlace Único de Referido:
            </span>
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              CÓDIGO: {referralCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 select-all focus:outline-none"
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Compartir en apps nativas"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {shareFeedback && (
            <p className="text-xs text-amber-300 font-mono text-center animate-fade-in">
              {shareFeedback}
            </p>
          )}

          {/* Social Quick Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Compartir directo en:</span>
            
            <button
              onClick={shareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Shares</span>
            <p className="text-xl font-black text-white">{stats.totalShares}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Clics Generados</span>
            <p className="text-xl font-black text-cyan-400">{stats.totalClicks}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Ventas Confirmadas</span>
            <p className="text-xl font-black text-emerald-400">{stats.confirmedSalesCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Cupones 5% Listos</span>
            <p className="text-xl font-black text-amber-400">{stats.unlockedCoupons.filter(c => !c.isUsed).length}</p>
          </div>
        </div>

        {/* Unlocked Coupons Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Tus Cupones del 5% Desbloqueados:
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Aplicables en el Checkout
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {stats.unlockedCoupons.map((coupon, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    5%
                  </div>
                  <div>
                    <span className="font-mono font-black text-white text-xs tracking-wider">
                      {coupon.code}
                    </span>
                    <p className="text-[11px] text-slate-400">{coupon.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCoupon === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Step Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-[#0a0e17]/60 border border-slate-800 space-y-1">
            <span className="font-mono text-amber-400 font-bold text-[10px]">1. COMPARTE</span>
            <p className="text-slate-300">Envía tu enlace o código a atletas y equipos deportivos.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0a0e17]/60 border border-slate-800 space-y-1">
            <span className="font-mono text-cyan-400 font-bold text-[10px]">2. COMPRAN CON 5% OFF</span>
            <p className="text-slate-300">Ellos reciben descuento inmediato al realizar su pedido.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0a0e17]/60 border border-slate-800 space-y-1">
            <span className="font-mono text-emerald-400 font-bold text-[10px]">3. RECIBES TU 5%</span>
            <p className="text-slate-300">Al validarse la transferencia, ganas tu cupón 5% automáticamente.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
