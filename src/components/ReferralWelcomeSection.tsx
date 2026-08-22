import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Flame, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  QrCode, 
  Smartphone, 
  Coins, 
  Lock, 
  ExternalLink,
  MessageCircle,
  Percent,
  TrendingUp,
  Award,
  AlertCircle,
  RotateCw,
  Sliders,
  DollarSign,
  HelpCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';
import { 
  getUserReferralCode, 
  buildReferralLink, 
  getReferralStats, 
  detectIncomingReferral 
} from '../utils/referralEngine';
import { StreetPalette } from '../types/theme';

interface ReferralWelcomeSectionProps {
  onOpenCustomizer?: () => void;
  onApplyCouponToCart?: (couponCode: string) => void;
  onOpenSlotMachine?: () => void;
  currentPalette?: StreetPalette;
}

export const ReferralWelcomeSection: React.FC<ReferralWelcomeSectionProps> = ({
  onOpenCustomizer,
  onApplyCouponToCart,
  onOpenSlotMachine,
  currentPalette,
}) => {
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [invitedCode, setInvitedCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Dynamic Commission Simulator State
  const [simulatedOrders, setSimulatedOrders] = useState<number>(8);
  const [activeTabDisclaimer, setActiveTabDisclaimer] = useState<'payments' | 'returns' | 'ambassador'>('payments');

  const myReferralCode = getUserReferralCode();
  const myReferralLink = buildReferralLink();
  const incoming = detectIncomingReferral();

  useEffect(() => {
    if (incoming.referrerCode && !invitedCode) {
      setInvitedCode(incoming.referrerCode);
      setCodeValidationStatus('valid');
    }
    const savedReg = localStorage.getItem('fsgod_ambassador_registered');
    const savedName = localStorage.getItem('fsgod_ambassador_name');
    if (savedReg) {
      setIsRegistered(true);
      setHasAcceptedTerms(true);
      if (savedName) setUserName(savedName);
    }
  }, []);

  // Validate referral code when user types
  const handleValidateReferralCode = (code: string) => {
    setInvitedCode(code);
    setValidationError(null);
    if (!code.trim()) {
      setCodeValidationStatus('idle');
      return;
    }
    setIsValidatingCode(true);
    setTimeout(() => {
      setIsValidatingCode(false);
      // Valid if starts with FSG, VIP, AMBASSADOR, or has at least 4 alphanumeric chars
      if (code.toUpperCase().startsWith('FSG') || code.toUpperCase().startsWith('VIP') || code.toUpperCase().startsWith('AMB') || code.length >= 4) {
        setCodeValidationStatus('valid');
        audioEngine.playCashChimeSound();
      } else {
        setCodeValidationStatus('invalid');
      }
    }, 300);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myReferralLink);
    }
    setCopiedLink(true);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCodeOnly = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myReferralCode);
    }
    setCopiedCode(true);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 ¡Ey parcero! Te invito al ecosistema oficial de FsGoD (Streetwear & Ropa Deportiva Personalizada). Usa mi código ${myReferralCode} para obtener un 5% de descuento directo y desbloquear el catálogo con margen de taller: ${myReferralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`FsGoD • Streetwear & Custom Drops | 5% OFF con código ${myReferralCode}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(myReferralLink)}&text=${text}`, '_blank');
  };

  const handleJumpToSlotMachine = () => {
    audioEngine.playClickSound();
    if (onOpenSlotMachine) {
      onOpenSlotMachine();
    } else {
      const slotEl = document.getElementById('street-loot-slot-machine');
      if (slotEl) {
        slotEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleRegisterClick = () => {
    setValidationError(null);

    // If disclaimer has not been viewed and accepted, open the disclaimer modal automatically
    if (!hasAcceptedTerms) {
      setIsDisclaimerModalOpen(true);
      audioEngine.playClickSound();
      return;
    }

    if (!userName.trim()) {
      setValidationError('Por favor ingresa tu nombre o alias de atleta.');
      return;
    }

    // Complete registration
    setIsRegistered(true);
    localStorage.setItem('fsgod_ambassador_registered', 'true');
    localStorage.setItem('fsgod_ambassador_name', userName);
    audioEngine.playCashChimeSound();

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF5722', '#00F0FF', '#FACC15', '#FFFFFF'],
      });
    } catch (e) {}

    if (onApplyCouponToCart) {
      onApplyCouponToCart('AMBASSADOR5');
    }
  };

  const handleAcceptDisclaimerAndProceed = () => {
    setHasAcceptedTerms(true);
    setIsDisclaimerModalOpen(false);
    audioEngine.playClickSound();
    if (userName.trim()) {
      handleRegisterClick();
    }
  };

  // Commission Calculations for the dynamic reward counter & simulator
  const averageGarmentPrice = 78.00; // USD average custom hoodie / jersey
  const commissionRate = 0.10; // 10%
  const estimatedEarningsUSD = +(simulatedOrders * averageGarmentPrice * commissionRate).toFixed(2);
  const estimatedEarningsCOP = +(estimatedEarningsUSD * 4150).toLocaleString('es-CO');

  return (
    <section 
      id="referral-welcome-landing"
      data-component-ref="FE5-REFERRAL-WELCOME"
      className="relative rounded-3xl overflow-hidden p-6 sm:p-10 transition-all duration-700 border-2"
      style={{
        backgroundColor: '#1E1E1E', // 60% Industrial Dark Concrete Background
        borderColor: '#FF5722',     // 30% Safety Orange Framing
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background Decorative Neon Atmospheric Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. WELCOME HERO SECTION: High-Impact Greeting + Branding + Code Validation */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
          <div className="space-y-3.5 max-w-3xl">
            
            {/* Component Identifier & Status Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-[#FF5722]/50 text-xs font-mono font-bold tracking-wider shadow-md">
              <Flame className="w-4 h-4 text-[#FF5722] animate-pulse" />
              <span className="text-white">PROGRAMA DE EMBAJADORES FSGOD</span>
              <span className="text-[#00F0FF] font-mono text-[11px] font-bold">• REF: FE5-REFERRAL-WELCOME</span>
            </div>
            
            {/* Primary Headline with Arial Bold High-Impact */}
            <h2 
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Bienvenido al Ecosistema FsGoD - <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-[#FF5722] to-[#00F0FF] bg-clip-text text-transparent">
                Streetwear & Custom
              </span>
            </h2>

            {/* Sans Uber Clean Readable Subheadline */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-2xl">
              Invita a tus parceros, gana recompensas de taller y desbloquea el catálogo dinámico. Comparte tu código de atleta para que tus amigos reciban <strong className="text-white">5% OFF directo</strong> y tú acumules <strong className="text-amber-400">10% de comisión de taller</strong> en cada prenda confeccionada.
            </p>
          </div>

          {/* Quick Referral Code Pill & Status Badge */}
          <div className="p-5 rounded-2xl bg-neutral-950 border-2 border-[#FF5722]/40 flex flex-col items-center sm:items-end justify-center text-right flex-shrink-0 shadow-2xl space-y-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">
              Tu Código de Embajador:
            </span>
            
            <div className="flex items-center space-x-2">
              <span 
                className="text-2xl font-black text-amber-400 font-mono tracking-wider px-3 py-1 rounded-xl bg-neutral-900 border border-amber-400/30"
              >
                {myReferralCode}
              </span>
              
              <button
                onClick={handleCopyCodeOnly}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#00F0FF] border border-neutral-700 hover:border-[#00F0FF]/50 transition-all cursor-pointer shadow-md"
                title="Copiar código de referido"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enlace Activo & Verificado
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[10px] font-mono text-[#00F0FF] underline hover:text-cyan-300 font-bold ml-2 cursor-pointer"
              >
                {copiedLink ? '¡Enlace Copiado!' : 'Copiar URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Section Soundtrack Bar: Golden Heritage (90s Boombap Lounge) */}
        <SectionSoundtrackBanner sectionKey="referral" />

        {/* ========================================================================= */}
        {/* 2. REWARD COUNTER & LIVE COMMISSION SIMULATOR + 30% SAFETY ORANGE CARDS  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 3 Core Reward Cards (30% Industrial Safety Orange Accent) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: 5% OFF */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-[#FF5722]/50 hover:border-[#FF5722] transition-all space-y-2 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center font-black text-base shadow-sm">
                  <Percent className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  5% OFF para Invitados
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Tus parceros obtienen descuento directo en camisetas 300 GSM, hoodies y equipaciones de club.
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono text-[#00F0FF] font-bold uppercase tracking-wider">
                  Cupón: AMBASSADOR5
                </span>
              </div>
            </div>

            {/* Card 2: 10% Taller Commission */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-[#FF5722]/50 hover:border-[#FF5722] transition-all space-y-2 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-[#00F0FF] flex items-center justify-center font-black text-base shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  10% Comisión de Taller
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Cobras el 10% de cada pedido completado. Retiros directos vía Bancolombia, Zelle o Bitcoin.
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Retiro Mín: $20 USD
                </span>
              </div>
            </div>

            {/* Card 3: Dopamine Slot Machine VIP Perks */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-[#FF5722]/50 hover:border-[#FF5722] transition-all space-y-2 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-base shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Ruleta Dopamina VIP
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Acceso exclusivo a drops limitados (Tagging Bear #3562, Eyes #19868) y giros prioritarios.
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-800/80">
                <button
                  onClick={handleJumpToSlotMachine}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <span>Girar Ruleta</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Live Interactive Commission Simulator (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-neutral-950 border-2 border-[#FF5722]/40 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  SIMULADOR DE GANANCIAS EN VIVO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[#00F0FF]">
                  10% Margen FsGoD
                </span>
              </div>

              {/* Slider for simulated orders */}
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-neutral-400">
                  <span>Prendas referidas al mes:</span>
                  <strong className="text-white font-black text-sm">{simulatedOrders} pedidos</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={simulatedOrders}
                  onChange={(e) => setSimulatedOrders(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FF5722]"
                />
              </div>
            </div>

            {/* Calculated Earnings Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Comisión en USD:</span>
                <span className="text-xl sm:text-2xl font-black text-[#00F0FF] font-mono tracking-tight">
                  ${estimatedEarningsUSD}
                </span>
              </div>
              <div className="border-l border-neutral-800 pl-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Equivalente COP:</span>
                <span className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">
                  ${estimatedEarningsCOP}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Liquidación automática semanal
              </span>
              <button
                onClick={handleJumpToSlotMachine}
                className="text-[#FF5722] hover:text-orange-400 font-bold underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Catálogo Dopamina</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. FRICTIONLESS REGISTRATION FLOW & GLOWING SAFETY ORANGE CTA BUTTONS     */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950/95 border-2 border-[#FF5722]/50 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 
                className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                <span>{isRegistered ? '¡Eres Atleta Embajador FsGoD Verificado!' : 'Activa tu Cuenta de Atleta Embajador'}</span>
                {isRegistered && <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-0.5">
                {isRegistered 
                  ? 'Tu perfil está listo. Comparte tu enlace único para empezar a generar comisiones y cupones de 5% OFF.' 
                  : 'Completa tus datos en 30 segundos para indexar tus recompensas y activar cupones de taller instantáneos.'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[10px] font-mono px-3 py-1.5 rounded-xl bg-neutral-900 text-[#00F0FF] border border-[#00F0FF]/30 font-bold shadow-sm">
                PAGOS: BANCOLOMBIA • ZELLE • BITCOIN
              </span>
            </div>
          </div>

          {!isRegistered ? (
            <div className="space-y-5">
              
              {/* 3 Registration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                    Nombre o Alias de Atleta *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ej: Mateo 'Titan' R."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors"
                  />
                </div>

                {/* 2. Contact */}
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-300 mb-1.5">
                    WhatsApp o Email para Liquidaciones *
                  </label>
                  <input
                    type="text"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    placeholder="+57 310... o atleta@fsgod.com"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors"
                  />
                </div>

                {/* 3. Referral Code with Real-Time Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-bold text-neutral-300">
                      Código de Referido (Opcional)
                    </label>
                    {isValidatingCode && (
                      <span className="text-[10px] font-mono text-[#00F0FF] animate-pulse flex items-center gap-1">
                        <RotateCw className="w-3 h-3 animate-spin" /> Verificando...
                      </span>
                    )}
                    {!isValidatingCode && codeValidationStatus === 'valid' && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> 5% OFF Activo
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={invitedCode}
                      onChange={(e) => handleValidateReferralCode(e.target.value)}
                      placeholder="Ej: FSG-FE-3559 o AMBASSADOR5"
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-900 border text-xs font-mono font-bold uppercase transition-colors focus:outline-none ${
                        codeValidationStatus === 'valid'
                          ? 'border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/30'
                          : codeValidationStatus === 'invalid'
                          ? 'border-red-500 text-red-400 ring-1 ring-red-500/30'
                          : 'border-neutral-700 text-amber-300 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]'
                      }`}
                    />
                    {codeValidationStatus === 'valid' && (
                      <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>

              </div>

              {/* Validation Error Alert */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2.5 shadow-md">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Mandatory Disclaimer Checkbox & Registration Buttons */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 pt-3 border-t border-neutral-800">
                
                {/* Mandatory Disclaimer Checkbox */}
                <label className="flex items-center space-x-3 cursor-pointer select-none text-xs text-neutral-300 group">
                  <input
                    type="checkbox"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded text-[#FF5722] focus:ring-[#FF5722] bg-neutral-900 border-neutral-700 cursor-pointer"
                  />
                  <span className="leading-normal">
                    He leído y acepto los{' '}
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDisclaimerModalOpen(true);
                        audioEngine.playClickSound();
                      }} 
                      className="text-[#FF5722] underline hover:text-orange-400 font-bold transition-colors cursor-pointer"
                    >
                      Términos de Confección & Disclaimer Legal
                    </button>{' '}
                    de FsGoD.
                  </span>
                </label>

                {/* Registration Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                  
                  {/* Secondary Disclaimer Link (Clean muted text / neutral pill) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDisclaimerModalOpen(true);
                      audioEngine.playClickSound();
                    }}
                    className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-sans font-semibold transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span>Ver Términos y Disclaimer Legal</span>
                  </button>

                  {/* Primary CTA: Glowing Safety Orange (#FF5722) Arial Bold + Neon Cyan Highlights */}
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="relative group px-7 py-3.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl shadow-[#FF5722]/40 hover:scale-102 active:scale-98 transition-all flex items-center space-x-2.5 cursor-pointer border border-[#FF5722]"
                    style={{ 
                      fontFamily: 'Arial, sans-serif',
                      boxShadow: '0 0 25px rgba(255, 87, 34, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {/* Neon Cyan Sparkle Accent (10% Rule) */}
                    <Sparkles className="w-4 h-4 text-[#00F0FF] animate-pulse" />
                    <span>Registrarse Ahora</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>

                </div>

              </div>

            </div>
          ) : (
            /* Registered State: Social Links & Immediate Dopamine Activation */
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl flex-shrink-0 shadow-lg">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base font-mono">
                      ¡Tu pase de Atleta Embajador está 100% ACTIVO!
                    </h4>
                    <p className="text-neutral-300 font-sans text-xs">
                      Tu cupón institucional <strong className="text-amber-400 font-mono">AMBASSADOR5</strong> (5% OFF) ya está aplicado a tu sesión.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-wrap">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#25D366] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareTelegram}
                    className="px-4 py-2.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/50 text-[#00F0FF] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={handleJumpToSlotMachine}
                    className="px-4 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#FF5722]/30"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ir a la Ruleta Dopamina</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MANDATORY LEGAL NOTICE DRAWER / MODAL SYSTEM                           */}
      {/* ========================================================================= */}
      {isDisclaimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-[#1E1E1E] border-2 border-[#FF5722] p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 87, 34, 0.35)'
            }}
          >
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5722]/20 border border-[#FF5722] text-[#FF5722] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 
                    className="text-lg sm:text-xl font-black text-white" 
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    Aviso Legal, Términos y Transparencia FsGoD
                  </h3>
                  <span className="text-[10px] font-mono text-[#00F0FF] uppercase font-bold">
                    Ref: FE5-REFERRAL-WELCOME • Transacciones Seguras & Políticas
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDisclaimerModalOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Tab Switcher for Quick Navigation */}
            <div className="flex items-center space-x-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 text-xs font-mono">
              <button
                onClick={() => setActiveTabDisclaimer('payments')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTabDisclaimer === 'payments'
                    ? 'bg-[#FF5722] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>1. Pasarelas de Pago</span>
              </button>
              
              <button
                onClick={() => setActiveTabDisclaimer('returns')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTabDisclaimer === 'returns'
                    ? 'bg-[#FF5722] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Confección & Garantía</span>
              </button>

              <button
                onClick={() => setActiveTabDisclaimer('ambassador')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTabDisclaimer === 'ambassador'
                    ? 'bg-[#FF5722] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. Comisiones</span>
              </button>
            </div>

            {/* Disclaimer Content Body */}
            <div className="space-y-4 text-xs font-sans text-neutral-300 leading-relaxed min-h-[220px]">
              
              {/* Tab 1: Transacciones y Pasarelas */}
              {activeTabDisclaimer === 'payments' && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 animate-in fade-in">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Transacciones Seguras y Liquidación sin Intermediarios</span>
                  </h4>
                  <p>
                    FsGoD opera exclusivamente con liquidación directa para transferir el 100% del ahorro en comisiones bancarias a la calidad de la tela y remuneración de costureros:
                  </p>
                  <ul className="space-y-2 text-neutral-300 font-mono text-[11px]">
                    <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Bancolombia QR Oficial (Colombia):</strong> Pagos en COP a cuenta de ahorros empresarial de FsGoD con validación de comprobante en tiempo real.
                      </div>
                    </li>
                    <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-[#00F0FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Chase Bank Zelle (Estados Unidos):</strong> Pagos institucionales en USD vía correo oficial verificado sin recargos transfronterizos.
                      </div>
                    </li>
                    <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-2">
                      <Coins className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Bitcoin Native SegWit (Bech32):</strong> Dirección institucional <code className="text-amber-300 bg-black px-1.5 py-0.5 rounded text-[10px]">bc1qkpf08p8f2dcsvhcckymu30c88csptjgzfjpzgs</code> con confirmación automática indexada en la red Mempool.
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {/* Tab 2: Políticas de Confección Customizada y Devoluciones */}
              {activeTabDisclaimer === 'returns' && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 animate-in fade-in">
                  <h4 className="text-sm font-black text-[#00F0FF] flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                    <span>Políticas de Confección Bajo Demanda y Garantía 100%</span>
                  </h4>
                  <p>
                    Cada prenda FsGoD (sudaderas técnicas 300 GSM, jerseys Pro-Dry y parches reflectivos Safety Orange) es confeccionada bajo demanda mediante serigrafía HD y sublimación digital 4K.
                  </p>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                    <strong className="text-emerald-400 block font-mono text-[11px]">✓ Garantía Total de Satisfacción (5 Días):</strong>
                    <p className="text-neutral-300 text-[11px]">
                      Si una prenda presenta defectos de costura, fallas en la tela o discrepancias en la estampación respecto a la vista 3D aprobada, FsGoD repondrá la prenda sin costo alguno en un plazo de 5 días hábiles.
                    </p>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    <strong>Política de Personalización Única:</strong> Al ser prendas fabricadas con dorsales, tags y configuraciones únicas, no aplican retractos por cambio de opinión una vez iniciado el corte láser.
                  </p>
                </div>
              )}

              {/* Tab 3: Programa de Embajadores y Comisiones */}
              {activeTabDisclaimer === 'ambassador' && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 animate-in fade-in">
                  <h4 className="text-sm font-black text-[#FF5722] flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <Award className="w-4 h-4 text-[#FF5722]" />
                    <span>Programa de Atletas Embajadores y Código de Transparencia</span>
                  </h4>
                  <p>
                    Las comisiones del 10% acumuladas por compras de tus referidos se acreditan de forma inmediata en cuanto el comprobante de pago es validado por el taller.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-neutral-300 font-mono text-[11px]">
                    <li>Retiro mínimo disponible: <strong>$20 USD</strong> (o equivalente en moneda local).</li>
                    <li>Medios de retiro: Transferencia Bancolombia, Chase Zelle o pago en Bitcoin sin comisión de retiro.</li>
                    <li>Prohibido el uso de spam no solicitado o anuncios engañosos para conservar el código activo.</li>
                  </ul>
                </div>
              )}

            </div>

            {/* Modal Acceptance Footer */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-neutral-400 font-sans">
                Al presionar aceptar confirmas tu conformidad con los términos de confección FsGoD.
              </span>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDisclaimerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={handleAcceptDisclaimerAndProceed}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FF5722]/30 flex items-center space-x-2 cursor-pointer transition-all hover:scale-102"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  <Check className="w-4 h-4" />
                  <span>Aceptar Términos y Continuar</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
