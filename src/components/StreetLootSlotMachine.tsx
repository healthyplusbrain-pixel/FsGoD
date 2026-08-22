import React, { useState, useEffect, useRef } from 'react';
import { ProductItem } from '../types';
import { 
  Sparkles, 
  Flame, 
  RotateCw, 
  Gift, 
  Trophy, 
  Zap, 
  Volume2, 
  ArrowRight, 
  Percent, 
  Coins, 
  Sliders, 
  Check, 
  Eye, 
  Play, 
  Pause,
  Award,
  QrCode,
  Smartphone,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Vibrate
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';
import { StreetPalette, STREET_PALETTES } from '../types/theme';
import { ZelleChaseQrCard } from './ZelleChaseQrCard';

export type { StreetPalette };
export { STREET_PALETTES };

interface StreetLootSlotMachineProps {
  products: ProductItem[];
  onOpenCustomizerForProduct: (product: ProductItem) => void;
  onApplyCouponToCart?: (couponCode: string) => void;
  currentPalette?: StreetPalette;
  onSelectPalette?: (palette: StreetPalette) => void;
}

export const StreetLootSlotMachine: React.FC<StreetLootSlotMachineProps> = ({
  products,
  onOpenCustomizerForProduct,
  onApplyCouponToCart,
  currentPalette = STREET_PALETTES[0],
  onSelectPalette,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const activePaletteIndex = Math.max(0, STREET_PALETTES.findIndex(p => p.id === currentPalette.id));
  const activePalette = currentPalette || STREET_PALETTES[0];
  
  // Rolling 3-reel item pool
  const [reelItems, setReelItems] = useState<[ProductItem, ProductItem, ProductItem]>([
    products[0] || products[products.length - 1],
    products[1] || products[0],
    products[2] || products[0],
  ]);

  const [jackpotReward, setJackpotReward] = useState<{
    title: string;
    code: string;
    discount: number;
    description: string;
  } | null>(null);

  // Exact 12-second rotation interval required by Ref: FSG-FE-5831
  const [secondsUntilNextSpin, setSecondsUntilNextSpin] = useState(12);
  const [autoSpinEnabled, setAutoSpinEnabled] = useState(true);
  const [spinsCount, setSpinsCount] = useState(0);
  const [claimedReward, setClaimedReward] = useState(false);

  // Interactive 19868 Animated Eyes state
  const [eyePupilOffset, setEyePupilOffset] = useState({ x: 3, y: 0 });

  // Active Pinned Payment Modal / Gateway Drawer state
  const [activePaymentModal, setActivePaymentModal] = useState<'bancolombia' | 'zelle' | 'bitcoin' | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [shakeDetected, setShakeDetected] = useState(false);

  // Audio & Animation references
  const spinAudioIntervalRef = useRef<number | null>(null);
  const spinTimeoutRef = useRef<number | null>(null);

  // Native SegWit BTC address provided in spec
  const BTC_NATIVE_SEGWIT_ADDRESS = 'bc1qkpf08p8f2dcsvhcckymu30c88csptjgzfjpzgs';

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedText(label);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Interactive Eye pupil tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSpinning) return;
      const x = Math.min(Math.max((e.clientX / window.innerWidth - 0.5) * 8, -6), 6);
      const y = Math.min(Math.max((e.clientY / window.innerHeight - 0.5) * 8, -5), 5);
      setEyePupilOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSpinning]);

  // When spinning, rotate eyes wildly
  useEffect(() => {
    if (!isSpinning) return;
    const interval = setInterval(() => {
      setEyePupilOffset({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 8,
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSpinning]);

  // Trigger slot roll
  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setJackpotReward(null);
    setClaimedReward(false);
    setSecondsUntilNextSpin(12);
    setShakeDetected(true);
    setTimeout(() => setShakeDetected(false), 800);

    // Audio SFX: Lever pull & mechanical spin clicks
    audioEngine.playLeverPull();
    
    let ticks = 0;
    if (spinAudioIntervalRef.current) clearInterval(spinAudioIntervalRef.current);
    spinAudioIntervalRef.current = window.setInterval(() => {
      audioEngine.playSlotSpin();
      ticks++;
      if (ticks > 14) {
        if (spinAudioIntervalRef.current) clearInterval(spinAudioIntervalRef.current);
      }
    }, 85);

    // Enforce 60-30-10 chromatic shifts across reels
    const nextPaletteIdx = (activePaletteIndex + 1) % STREET_PALETTES.length;
    if (onSelectPalette) {
      onSelectPalette(STREET_PALETTES[nextPaletteIdx]);
    }

    // Select 3 random products from the rolling pool (including ID 19868, 3559, 3560, 3561, 3562 & 197xx)
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = window.setTimeout(() => {
      const p1 = products[Math.floor(Math.random() * products.length)] || products[0];
      const p2 = products[Math.floor(Math.random() * products.length)] || products[0];
      const p3 = products[Math.floor(Math.random() * products.length)] || products[0];

      setReelItems([p1, p2, p3]);
      setIsSpinning(false);
      setSpinsCount(prev => prev + 1);
      audioEngine.playSlotReelStop();

      // Win Condition: 65% probability or matching categories
      const isJackpot = Math.random() < 0.65 || p1.category === p2.category;
      if (isJackpot) {
        audioEngine.playSlotJackpot();
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#FF5722', '#00F0FF', '#FACC15', '#FFFFFF'],
          });
        } catch (e) {
          // ignore
        }

        const rewards = [
          {
            title: '🔥 JACKPOT: 15% OFF STREET DROP',
            code: 'JACKPOT15',
            discount: 15,
            description: 'Cupón especial de ruleta activado para tu próximo pedido customizado.',
          },
          {
            title: '⚡ 40% MARGEN TALLER VIP UNLOCKED',
            code: 'TIER40VIP',
            discount: 10,
            description: 'Tarifa VIP de confección aplicada en referencias FSG-FE-5831, 19868 y 197xx.',
          },
          {
            title: '👑 4K SUBLIMATION FREE UPGRADE',
            code: 'FREE4K',
            discount: 8,
            description: 'Upgrade gratuito a sublimación digital 4K y parche bordado en mangas.',
          },
        ];
        const selected = rewards[Math.floor(Math.random() * rewards.length)];
        setJackpotReward(selected);
      }
    }, 1600);
  };

  // Automated 12-second interval timer
  useEffect(() => {
    if (!autoSpinEnabled || isSpinning) return;

    const interval = window.setInterval(() => {
      setSecondsUntilNextSpin(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [autoSpinEnabled, isSpinning]);

  // When timer reaches 0, trigger automated spin
  useEffect(() => {
    if (secondsUntilNextSpin === 0 && !isSpinning && autoSpinEnabled) {
      handleSpinRoulette();
    }
  }, [secondsUntilNextSpin, isSpinning, autoSpinEnabled]);

  // Shake detection listener on mobile devices
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 200) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const x = current.x || 0;
        const y = current.y || 0;
        const z = current.z || 0;

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 800 && !isSpinning) {
          handleSpinRoulette();
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    }

    return () => {
      if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion, true);
      }
      if (spinAudioIntervalRef.current) clearInterval(spinAudioIntervalRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, [isSpinning]);

  // Center highlighted drop calculations
  const centerItem = reelItems[1];
  const refCode = centerItem.referenceCode || centerItem.cjVariantSku || `FSG-${centerItem.id.slice(5, 12).toUpperCase()}`;
  const purchaseCost = centerItem.wholesaleCost || centerItem.cjBaseCost || +(centerItem.basePrice * 0.38).toFixed(2);
  const retailPrice = centerItem.basePrice;
  const customMargin = +(retailPrice * 0.40).toFixed(2);
  const finalCustomPrice = +(retailPrice + customMargin).toFixed(2);

  const handleClaimReward = () => {
    if (jackpotReward && onApplyCouponToCart) {
      onApplyCouponToCart(jackpotReward.code);
      setClaimedReward(true);
      audioEngine.playCashChimeSound();
    }
  };

  return (
    <div 
      id="street-loot-slot-machine"
      className={`relative rounded-3xl p-5 sm:p-8 overflow-hidden shadow-2xl transition-all duration-700 border-2 ${
        shakeDetected ? 'animate-bounce' : ''
      }`}
      style={{
        backgroundColor: '#1E1E1E', // 60% Industrial Concrete Dark Grey
        borderColor: '#FF5722',     // 30% Structural Safety Orange Frame
        boxShadow: `0 25px 60px -12px ${activePalette.secondary30}40`,
      }}
    >
      {/* Background Industrial Metallic Texture & Neon Orbs */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activePalette.secondary30 }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activePalette.accent10 }}
      />

      <div className="relative z-10 space-y-6">
        
        {/* Top Control Bar: Title + 19868 Animated Eyes Badge + Palette Switcher + 12s Timer + Manual Lever */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center space-x-4">
            
            {/* ID 19868 Animated Googly Eyes Interactive Icon */}
            <div 
              onClick={handleSpinRoulette}
              className="relative p-2 rounded-2xl bg-neutral-950 border-2 border-[#FF5722] shadow-lg flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
              title="ID: 19868 Googly Eyes - Haz clic para girar la ruleta"
            >
              <svg width="48" height="32" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Eye */}
                <ellipse cx="20" cy="20" rx="14" ry="17" fill="white" stroke="#18181b" strokeWidth="3" />
                <circle 
                  cx={20 + eyePupilOffset.x} 
                  cy={20 + eyePupilOffset.y} 
                  r="6" 
                  fill="#09090b" 
                />
                <circle 
                  cx={18 + eyePupilOffset.x} 
                  cy={18 + eyePupilOffset.y} 
                  r="1.8" 
                  fill="white" 
                />
                
                {/* Right Eye */}
                <ellipse cx="42" cy="19" rx="13" ry="16" fill="white" stroke="#18181b" strokeWidth="3" />
                <circle 
                  cx={42 + eyePupilOffset.x} 
                  cy={19 + eyePupilOffset.y} 
                  r="5.5" 
                  fill="#09090b" 
                />
                <circle 
                  cx={40 + eyePupilOffset.x} 
                  cy={17 + eyePupilOffset.y} 
                  r="1.6" 
                  fill="white" 
                />
              </svg>
              <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 bg-[#FF5722] text-white text-[8px] font-mono font-black rounded">
                19868
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-neutral-900 border border-neutral-700">
                <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-white">FSGOD CASINO LOOT DROPS</span>
                <span className="text-[#FF5722]">• 40% MARGIN TIER</span>
                <span className="text-cyan-400 font-mono text-[10px]">REF: FSG-FE-5831</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                <span>Ruleta Streetwear Dinámica</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#FF5722] text-white font-bold uppercase tracking-wider">
                  60-30-10 ENGINE
                </span>
              </h2>
            </div>
          </div>

          {/* Dynamic Theme Swatches + 12s Progress + Shake & Lever Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 5 Chromatic Theme Swatches */}
            <div className="flex items-center space-x-1.5 bg-neutral-950/90 p-1.5 rounded-2xl border border-neutral-800">
              <Sliders className="w-3.5 h-3.5 text-neutral-400 ml-1 mr-1" />
              {STREET_PALETTES.map((pal, idx) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    if (onSelectPalette) onSelectPalette(pal);
                    audioEngine.playClickSound();
                  }}
                  className={`w-6 h-6 rounded-lg transition-all border flex items-center justify-center cursor-pointer ${
                    activePaletteIndex === idx
                      ? 'scale-110 border-white shadow-md ring-2 ring-[#FF5722]'
                      : 'border-neutral-700 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: pal.secondary30 }}
                  title={pal.name}
                >
                  {activePaletteIndex === idx && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* 12s Auto-Spin Interval Countdown Progress */}
            <div className="flex items-center space-x-2.5 bg-neutral-950/90 px-3.5 py-2 rounded-2xl border border-neutral-800 text-xs font-mono">
              <button
                onClick={() => {
                  setAutoSpinEnabled(!autoSpinEnabled);
                  audioEngine.playClickSound();
                }}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  autoSpinEnabled ? 'text-emerald-400 bg-emerald-950/60' : 'text-neutral-400 hover:text-white'
                }`}
                title={autoSpinEnabled ? 'Pausar auto-giro de 12s' : 'Activar auto-giro de 12s'}
              >
                {autoSpinEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="flex flex-col min-w-[70px]">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-neutral-400">Giro en:</span>
                  <strong className="text-amber-400">{secondsUntilNextSpin}s</strong>
                </div>
                {/* 12s Visual Progress Bar */}
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-[#FF5722] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((12 - secondsUntilNextSpin) / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shake / Tap Button Trigger */}
            <button
              onClick={handleSpinRoulette}
              disabled={isSpinning}
              className="p-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              title="Agitar o pulsar para girar instantáneamente"
            >
              <Vibrate className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Agitar</span>
            </button>

            {/* Main Spin Button / Casino Lever (30% Safety Orange) */}
            <button
              onClick={handleSpinRoulette}
              disabled={isSpinning}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all flex items-center space-x-2 cursor-pointer ${
                isSpinning
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#FF5722] hover:bg-[#ff6f43] text-white hover:scale-105 shadow-[#FF5722]/30 active:scale-95'
              }`}
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Girando Carretes...' : 'Girar Ruleta (12s)'}</span>
            </button>
          </div>
        </div>

        {/* Slot Arcade Sound Bar: Tokyo Midnight Arcade */}
        <SectionSoundtrackBanner sectionKey="slot" />

        {/* Casino 3-Reel Product Display Matrix (with Glowing Neon 10% Borders) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {reelItems.map((item, idx) => {
            const isCenter = idx === 1;
            const itemRefCode = item.referenceCode || item.cjVariantSku || `FSG-${item.id.slice(5, 12).toUpperCase()}`;
            const pCost = item.wholesaleCost || item.cjBaseCost || +(item.basePrice * 0.38).toFixed(2);
            const rPrice = item.basePrice;
            const cMargin = +(rPrice * 0.40).toFixed(2);
            const finalPrice = +(rPrice + cMargin).toFixed(2);

            return (
              <div
                key={`${item.id}-${idx}-${spinsCount}`}
                onClick={() => {
                  if (!isSpinning) {
                    onOpenCustomizerForProduct(item);
                  }
                }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 flex flex-col justify-between p-4 border cursor-pointer group ${
                  isSpinning
                    ? 'blur-sm scale-95 opacity-70 animate-pulse'
                    : isCenter
                    ? 'bg-neutral-950/95 border-[#FF5722] shadow-2xl scale-100 sm:scale-102 z-20'
                    : 'bg-neutral-950/70 border-neutral-800 opacity-90 hover:opacity-100 hover:border-neutral-700'
                }`}
                style={{
                  boxShadow: isCenter
                    ? `0 0 25px ${activePalette.accent10}50, inset 0 0 15px ${activePalette.secondary30}30`
                    : undefined,
                  borderColor: isCenter ? activePalette.secondary30 : undefined,
                }}
              >
                {/* Center Neon Glowing Scanner Beam */}
                {isCenter && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-90"
                    style={{ backgroundColor: activePalette.accent10 }}
                  />
                )}

                {/* Top Header Badge */}
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                  <span className={`px-2.5 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1 ${
                    isCenter ? 'bg-[#FF5722] text-white shadow-md' : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    {isCenter ? (
                      <>
                        <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
                        <span>DROP DESTACADO FSGOD</span>
                      </>
                    ) : (
                      <span>REEL 0{idx + 1}</span>
                    )}
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded bg-neutral-900/90 text-cyan-400 border border-cyan-500/30">
                    REF: {itemRefCode}
                  </span>
                </div>

                {/* Garment Image Stage with 10% Neon Glowing Accents */}
                <div 
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 mb-3 group/img"
                  style={{
                    border: isCenter ? `1.5px solid ${activePalette.accent10}` : '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <img
                    src={item.featuredImage}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 group-hover/img:opacity-0 transition-opacity" />
                  
                  {/* High Quality Tag */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-neutral-950/90 backdrop-blur-md text-[9px] font-mono text-cyan-300 border border-neutral-700">
                    4K Sublimación
                  </div>

                  {isCenter && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF5722] text-white text-[9px] font-mono font-black uppercase shadow-lg">
                      🔥 40% Tier
                    </div>
                  )}
                </div>

                {/* Metadata & 40% Custom Margin Breakdown */}
                <div className="space-y-2.5">
                  <div>
                    <h4 className="text-sm font-black text-white hover:text-[#FF5722] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Dopamine Feedback: Instant 40% Custom Markup Calculation Updates */}
                  <div className="p-3 rounded-xl bg-neutral-900/95 border border-neutral-800 text-[10px] font-mono space-y-1.5">
                    <div className="flex justify-between text-neutral-400">
                      <span>Costo Proveedor Base (CJ):</span>
                      <span className="text-neutral-300 font-bold">${pCost.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#FF5722]" /> Margen Confección (+40%):
                      </span>
                      <span className="text-[#FF5722] font-black">+${cMargin.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1.5 border-t border-neutral-800/80">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> PVP Streetwear:
                      </span>
                      <span className="text-amber-300 font-black text-xs">${finalPrice.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCustomizerForProduct(item);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isCenter
                        ? 'bg-[#FF5722] hover:bg-[#ff6f43] text-white shadow-lg shadow-[#FF5722]/40 hover:scale-102'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Personalizar en 3D</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jackpot Reward Banner (When unlocked) */}
        {jackpotReward && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-neutral-950 to-[#FF5722]/20 border-2 border-amber-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center flex-shrink-0 font-black text-xl shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ¡JACKPOT RULETA DESBLOQUEADO!
                </span>
                <h3 className="text-base font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {jackpotReward.title}
                </h3>
                <p className="text-xs text-neutral-300">
                  {jackpotReward.description} Código: <strong className="text-amber-300 font-mono text-sm">{jackpotReward.code}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleClaimReward}
                disabled={claimedReward}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                  claimedReward
                    ? 'bg-emerald-500 text-black'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/25'
                }`}
              >
                {claimedReward ? <Check className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                <span>{claimedReward ? '¡Cupón Aplicado!' : 'Aplicar al Carrito'}</span>
              </button>

              <button
                onClick={() => onOpenCustomizerForProduct(centerItem)}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-cyan-500/40 text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Ir al Estudio 3D
              </button>
            </div>
          </div>
        )}

        {/* PINNED PAYMENT GATEWAYS BAR (Bancolombia QR, Chase Zelle, Bitcoin Native SegWit) */}
        <div className="pt-4 border-t border-neutral-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5722]/15 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider block">
                  PASARELAS DE PAGO ACTIVAS & SEGURAS • VERIFICACIÓN INMEDIATA (REF: FSG-FE-5831)
                </span>
                <p className="text-xs font-bold text-white">
                  Liquidación directa sin comisiones ocultas para pedidos personalizados FSGOD
                </p>
              </div>
            </div>

            {/* 3 Active Gateway Quick-Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* 1. Bancolombia QR Button */}
              <button
                onClick={() => {
                  setActivePaymentModal('bancolombia');
                  audioEngine.playClickSound();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FDDA24]/15 hover:bg-[#FDDA24]/25 border border-[#FDDA24]/50 text-[#FDDA24] text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer hover:scale-102"
              >
                <QrCode className="w-4 h-4 text-[#FDDA24]" />
                <span>Bancolombia QR</span>
              </button>

              {/* 2. Chase Zelle Button */}
              <button
                onClick={() => {
                  setActivePaymentModal('zelle');
                  audioEngine.playClickSound();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#7414CA]/20 hover:bg-[#7414CA]/30 border border-[#7414CA]/60 text-purple-300 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer hover:scale-102"
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Chase Zelle</span>
              </button>

              {/* 3. Bitcoin Native SegWit Button */}
              <button
                onClick={() => {
                  setActivePaymentModal('bitcoin');
                  audioEngine.playClickSound();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#F7931A]/20 hover:bg-[#F7931A]/30 border border-[#F7931A]/60 text-amber-300 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer hover:scale-102 shadow-md shadow-[#F7931A]/10"
              >
                <Coins className="w-4 h-4 text-[#F7931A]" />
                <span>Bitcoin Native SegWit</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL / DRAWER: Pinned Payment Gateway Details */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1E1E1E] border-2 border-[#FF5722] p-6 sm:p-8 shadow-2xl text-white space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-3">
                {activePaymentModal === 'bancolombia' && <QrCode className="w-6 h-6 text-[#FDDA24]" />}
                {activePaymentModal === 'zelle' && <Smartphone className="w-6 h-6 text-purple-400" />}
                {activePaymentModal === 'bitcoin' && <Coins className="w-6 h-6 text-[#F7931A]" />}
                
                <div>
                  <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {activePaymentModal === 'bancolombia' && 'Pasarela Bancolombia QR Oficial'}
                    {activePaymentModal === 'zelle' && 'Zelle Direct Transfer (Chase Bank US)'}
                    {activePaymentModal === 'bitcoin' && 'Bitcoin Native SegWit (Bech32 On-Chain)'}
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Depósito Seguro • Liquidación Taller FSGOD (Ref: FSG-FE-5831)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActivePaymentModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Gateway Specific Info */}
            {activePaymentModal === 'bancolombia' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="p-3 bg-white rounded-xl shadow-md flex-shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent('bancolombia://pay?account=31288490129&name=FSGOD-SAS&nit=901442890-1')}`}
                      alt="Bancolombia QR"
                      referrerPolicy="no-referrer"
                      className="w-28 h-28"
                    />
                  </div>
                  <div className="space-y-2 flex-grow text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Banco:</span>
                      <strong className="text-white">Bancolombia S.A.</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Tipo:</span>
                      <strong className="text-white">Ahorros</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Cuenta:</span>
                      <div className="flex items-center space-x-1.5">
                        <strong className="text-amber-400">312-8849-0129</strong>
                        <button
                          onClick={() => handleCopy('31288490129', 'cuenta_bancolombia')}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-400 cursor-pointer"
                          title="Copiar número de cuenta"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Titular:</span>
                      <strong className="text-white">FSGOD S.A.S.</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                  💡 <strong>Instrucciones:</strong> Realiza tu transferencia desde la App Bancolombia o escanea el QR en caja. Adjunta tu comprobante en el carrito para validación inmediata de confección.
                </div>
              </div>
            )}

            {activePaymentModal === 'zelle' && (
              <div className="space-y-4">
                <ZelleChaseQrCard 
                  memo="FSG-STREET-LOOT"
                />
              </div>
            )}

            {activePaymentModal === 'bitcoin' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Criptomoneda:</span>
                    <strong className="text-amber-400">Bitcoin (BTC)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Formato / Red:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                      Native SegWit (Bech32 - Comisiones Bajas)
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(`bitcoin:${BTC_NATIVE_SEGWIT_ADDRESS}`)}`}
                        alt="Bitcoin QR"
                        referrerPolicy="no-referrer"
                        className="w-24 h-24"
                      />
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <span className="text-neutral-400 block text-[10px]">Dirección de Depósito BTC:</span>
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 break-all text-amber-300 font-bold text-[11px] select-all flex items-center justify-between gap-1.5">
                        <span>{BTC_NATIVE_SEGWIT_ADDRESS}</span>
                        <button
                          onClick={() => handleCopy(BTC_NATIVE_SEGWIT_ADDRESS, 'btc_address')}
                          className="p-1.5 rounded-lg bg-[#FF5722] hover:bg-[#ff6f43] text-white flex-shrink-0 cursor-pointer shadow-md"
                          title="Copiar dirección Bitcoin"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <span>⚡ <strong>Verificación On-Chain:</strong> Tu orden de confección personalizada se aprueba automáticamente tras 1 confirmación.</span>
                    <a
                      href={`https://mempool.space/address/${BTC_NATIVE_SEGWIT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors flex-shrink-0"
                    >
                      <span>Mempool Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Copy Feedback Toast */}
            {copiedText && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Copiado al portapapeles con éxito!</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActivePaymentModal(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setActivePaymentModal(null);
                  onOpenCustomizerForProduct(centerItem);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white text-xs font-mono font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-[#FF5722]/30"
              >
                <span>Proceder a Personalizar 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
