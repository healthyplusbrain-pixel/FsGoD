import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  Smartphone, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  X, 
  ExternalLink,
  QrCode,
  Coins,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ASSET_IMAGES } from '../assets/images';

interface AvatarVideoShowcaseProps {
  onCustomizeClick: () => void;
  onBuyNowClick: () => void;
}

export const AvatarVideoShowcase: React.FC<AvatarVideoShowcaseProps> = ({
  onCustomizeClick,
  onBuyNowClick,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'avatar_lookbook' | 'taz_neural' | 'mobile_concept'>('avatar_lookbook');
  const [showMobileConceptModal, setShowMobileConceptModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'bancolombia' | 'zelle' | 'bitcoin'>('bancolombia');

  return (
    <section id="fsgod-urban-lookbook" className="my-10 relative overflow-hidden rounded-3xl bg-[#1E1E1E] border border-orange-500/30 p-6 sm:p-8 shadow-2xl">
      {/* Background industrial lighting effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#FF5722]/15 border border-[#FF5722]/40 text-[#FF5722] text-xs font-mono font-bold tracking-wider">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>ESTÉTICA 90s HIP-HOP & MULTIMEDIA 3D AVATAR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            FsGoD <span className="text-[#FF5722]">STREETWEAR ATELIER</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
            Concepto visual urbano FsGoD en gris concreto industrial (#1E1E1E) y naranja de seguridad (#FF5722), blanks heavyweight 420 GSM, avatares 3D, tags graffiti, neural charm de Taz y pasarelas de pago instantáneas.
          </p>
        </div>

        {/* Action switch tabs */}
        <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-2xl border border-neutral-800 self-start md:self-auto">
          <button
            onClick={() => setActiveMediaTab('avatar_lookbook')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'avatar_lookbook'
                ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Avatares 3D & Lookbook
          </button>
          <button
            onClick={() => setActiveMediaTab('taz_neural')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'taz_neural'
                ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Taz & Neural Charm
          </button>
          <button
            onClick={() => setShowMobileConceptModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App UI (9:16)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Lookbook & Multimedia vs Active Simulation Badges */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Left Column: Multimedia & Interactive 3D Avatar Video Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-neutral-800 aspect-[16/10] group">
            
            {/* Background artwork showcase */}
            <img
              src={activeMediaTab === 'taz_neural' ? ASSET_IMAGES.streetCartoonCrewArt : (ASSET_IMAGES.fsgodMobileUi || ASSET_IMAGES.streetwearRetroHoodie)}
              alt="FsGoD 3D Avatar Lookbook"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

            {/* Industrial Watermark & Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#1E1E1E]/90 backdrop-blur-md border border-[#FF5722]/50 text-[#FF5722] text-[10px] font-mono font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#FF5722]" /> FSG-FE-5831
              </span>
              <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                3D AVATAR MOTION 4K
              </span>
            </div>

            {/* Taz neural charm indicator */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-lg bg-neutral-900/90 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>TAZ 90s NEURAL CHARM</span>
              </div>
            </div>

            {/* Bottom metadata banner */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#1E1E1E]/95 backdrop-blur-md border border-neutral-700 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">FsGoD Oversize Heavyweight Hoodie</h4>
                <p className="text-[11px] text-neutral-400 font-mono">Heavyweight French Terry 420 GSM • Concreto (#1E1E1E) & Naranja Seguridad (#FF5722)</p>
              </div>

              {/* Glowing Industrial Safety Orange CTA */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onCustomizeClick}
                  className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FF5722]/40 transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customizar</span>
                </button>
                <button
                  onClick={onBuyNowClick}
                  className="px-4 py-2 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] border border-neutral-600 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Comprar Ahora</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features Pills */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#141414] border border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 block">BASE 60%</span>
              <p className="text-xs font-bold text-white">Dark Concrete Grey</p>
            </div>
            <div className="p-3 rounded-xl bg-[#141414] border border-neutral-800">
              <span className="text-[10px] font-mono text-[#FF5722] block font-bold">ESTRUCTURA 30%</span>
              <p className="text-xs font-bold text-white">Safety Orange</p>
            </div>
            <div className="p-3 rounded-xl bg-[#141414] border border-neutral-800">
              <span className="text-[10px] font-mono text-cyan-400 block font-bold">ACENTO 10%</span>
              <p className="text-xs font-bold text-white">Electric Neon Cyan</p>
            </div>
          </div>
        </div>

        {/* Right Column: Active Payment Gateway Simulation Badges & Pricing Matrix Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Pasarelas de Pago Oficiales Activas
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                EN VIVO
              </span>
            </div>

            {/* Gateway Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedGateway('bancolombia')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedGateway === 'bancolombia'
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                    : 'bg-[#1E1E1E] border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bancolombia</span>
                </div>
                <p className="text-[9px] font-mono text-neutral-400 mt-0.5">QR Instant Pay</p>
              </button>

              <button
                onClick={() => setSelectedGateway('zelle')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedGateway === 'zelle'
                    ? 'bg-purple-400/10 border-purple-400 text-purple-300'
                    : 'bg-[#1E1E1E] border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Zelle Chase</span>
                </div>
                <p className="text-[9px] font-mono text-neutral-400 mt-0.5">Direct P2P US</p>
              </button>

              <button
                onClick={() => setSelectedGateway('bitcoin')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedGateway === 'bitcoin'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-300'
                    : 'bg-[#1E1E1E] border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Coins className="w-3.5 h-3.5 text-orange-400" />
                  <span>Bitcoin</span>
                </div>
                <p className="text-[9px] font-mono text-neutral-400 mt-0.5">Native SegWit</p>
              </button>
            </div>

            {/* Gateway Details Box */}
            <div className="p-3.5 rounded-xl bg-[#1E1E1E] border border-neutral-700 text-xs space-y-2">
              {selectedGateway === 'bancolombia' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-400 font-bold">QR Bancolombia / Nequi / PSE</span>
                    <span className="text-neutral-400">Tasa: TRM Oficial COP</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Escaneo directo de código QR oficial desde la App Bancolombia. Verificación instantánea y confirmación directa por WhatsApp.
                  </p>
                </div>
              )}

              {selectedGateway === 'zelle' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-purple-400 font-bold">Zelle via Chase Bank (CLTV.DATA LLC)</span>
                    <span className="text-neutral-400">ID: xxxxxx8471</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Pagos directos en USD desde cualquier cuenta bancaria de EE. UU. (Chase, BoA, Wells Fargo) a <strong>CLTV.DATA LLC</strong> (terminación 8471) con código QR oficial.
                  </p>
                </div>
              )}

              {selectedGateway === 'bitcoin' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-orange-400 font-bold">BTC Native SegWit Wallet</span>
                    <span className="text-neutral-400">Confirmación On-chain</span>
                  </div>
                  <p className="text-[10px] font-mono text-neutral-300 truncate bg-neutral-900 p-1.5 rounded border border-neutral-800">
                    bc1qkpf08p8f2dcsvhcckymu30c88csptjgzfjpzgs
                  </p>
                </div>
              )}
            </div>

            {/* Pricing Summary Micro-table */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">Margen de Taller Sugerido:</span>
                <span className="text-[#FF5722] font-mono font-bold">+40.0% Ganancia Neta</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">Tiempo de Confección:</span>
                <span className="text-cyan-400 font-mono font-bold">24-48 hrs hábiles</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">Resolución Estampado:</span>
                <span className="text-white font-mono font-bold">Sublimación Digital 4K</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onBuyNowClick}
              className="w-full py-3 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF5722]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ir al Checkout con Pasarelas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Concept Modal 9:16 */}
      {showMobileConceptModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#1E1E1E] border border-[#FF5722]/40 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#FF5722]" />
                <span className="text-xs font-bold text-white font-mono">FsGoD Mobile UI Concept (9:16)</span>
              </div>
              <button
                onClick={() => setShowMobileConceptModal(false)}
                className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview 9:16 */}
            <div className="relative aspect-[9/16] bg-black">
              <img
                src={ASSET_IMAGES.fsgodMobileUi || ASSET_IMAGES.streetwearRetroHoodie}
                alt="FsGoD Mobile UI Concept"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#141414] border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400">FSG-FE-5831 UI System</span>
              <button
                onClick={() => {
                  setShowMobileConceptModal(false);
                  onCustomizeClick();
                }}
                className="px-4 py-2 rounded-xl bg-[#FF5722] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Probar en Estudio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
