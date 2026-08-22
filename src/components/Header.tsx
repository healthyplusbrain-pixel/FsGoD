import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Users, 
  ShoppingBag, 
  Layers, 
  Truck, 
  ShieldCheck, 
  Flame, 
  Menu, 
  X,
  Clock,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Gift,
  Palette,
  Check,
  Calculator,
  Bot,
  MessageSquare
} from 'lucide-react';
import { audioEngine, AudioTrackInfo } from '../utils/audioEngine';
import { StreetPalette, STREET_PALETTES } from '../types/theme';

interface HeaderProps {
  activeTab: 'catalog' | 'master_catalog' | 'whatsapp_order' | 'customizer' | 'team_kits' | 'tracker' | 'admin';
  setActiveTab: (tab: 'catalog' | 'master_catalog' | 'whatsapp_order' | 'customizer' | 'team_kits' | 'tracker' | 'admin') => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onOpenReferral?: () => void;
  onOpenAssistant?: () => void;
  currentPalette?: StreetPalette;
  onSelectPalette?: (palette: StreetPalette) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartItemsCount,
  onOpenCart,
  onOpenTracker,
  onOpenReferral,
  onOpenAssistant,
  currentPalette = STREET_PALETTES[0],
  onSelectPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [currentTrack, setCurrentTrack] = useState<AudioTrackInfo>(audioEngine.getCurrentTrack());
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const palette = currentPalette || STREET_PALETTES[0];

  // Synchronize with audio engine
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
      setVolume(state.volume);
      setCurrentTrack(state.currentTrack);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleTogglePlay = () => {
    audioEngine.toggle();
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleToggleMute = () => {
    audioEngine.toggleMute();
  };

  return (
    <header 
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-700 shadow-2xl"
      style={{
        backgroundColor: `${palette.headerBg}f2`,
        borderColor: `${palette.borderHex}35`,
      }}
    >
      {/* Top micro bar for brand highlights & Trinity dedication */}
      <div 
        className="border-b py-1.5 px-4 text-[11px] transition-colors duration-700"
        style={{
          backgroundColor: `${palette.bodyBg}dd`,
          borderColor: `${palette.borderHex}20`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span 
              className="inline-flex items-center font-bold tracking-wider font-mono transition-colors duration-700"
              style={{ color: palette.secondary30 }}
            >
              <Flame className="w-3.5 h-3.5 mr-1 animate-pulse" style={{ color: palette.secondary30 }} /> FsGoD • DIOS POR DELANTE
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:inline text-neutral-300 font-medium">
              <span className="text-white font-bold">Estudio de Confección Urbana</span> & Streetwear 2026
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[10px]">
            {/* Theme switcher badge */}
            <div className="relative">
              <button
                onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: palette.cardBg,
                  borderColor: `${palette.secondary30}60`,
                  color: palette.secondary30,
                }}
                title="Cambiar paleta de colores del sitio web"
              >
                <Palette className="w-3 h-3" />
                <span className="hidden sm:inline">{palette.shortName} (60-30-10)</span>
                <span className="sm:hidden">Tema</span>
              </button>

              {showPaletteMenu && (
                <div 
                  className="absolute top-full right-0 mt-2 w-64 rounded-2xl p-3 shadow-2xl z-50 border text-xs animate-in fade-in slide-in-from-top-2"
                  style={{
                    backgroundColor: palette.cardBg,
                    borderColor: `${palette.secondary30}60`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-700">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                      🎨 Paleta Cromática 60-30-10
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">FSGOD CASINO</span>
                  </div>
                  <div className="space-y-1.5">
                    {STREET_PALETTES.map((pal) => (
                      <button
                        key={pal.id}
                        onClick={() => {
                          if (onSelectPalette) onSelectPalette(pal);
                          setShowPaletteMenu(false);
                          audioEngine.playClickSound();
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          palette.id === pal.id ? 'bg-neutral-800/90 text-white font-bold' : 'hover:bg-neutral-800/50 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: pal.secondary30 }}
                          />
                          <span className="text-xs">{pal.nameEs}</span>
                        </div>
                        {palette.id === pal.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="hidden md:flex items-center text-cyan-400">
              <Clock className="w-3 h-3 mr-1 text-cyan-400" /> Confección Digital 3D
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => setActiveTab('catalog')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div 
              className="w-12 h-12 rounded-2xl p-0.5 shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${palette.secondary30}, ${palette.accent10})`,
                boxShadow: `0 10px 25px -5px ${palette.secondary30}40`,
              }}
            >
              <div 
                className="w-full h-full rounded-[14px] flex items-center justify-center border"
                style={{
                  backgroundColor: palette.cardBg,
                  borderColor: `${palette.secondary30}50`,
                }}
              >
                <span 
                  className="font-black text-xl tracking-tighter text-white transition-colors"
                  style={{ color: palette.textColor }}
                >
                  FsG
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-widest text-white font-sans">
                  Fs<span style={{ color: palette.secondary30 }}>GoD</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-semibold">
                Custom Sportswear & Streetwear Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav 
            className="hidden xl:flex items-center space-x-1 p-1.5 rounded-2xl border transition-colors duration-700"
            style={{
              backgroundColor: `${palette.bodyBg}bb`,
              borderColor: `${palette.borderHex}30`,
            }}
          >
            <button
              onClick={() => setActiveTab('master_catalog')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'master_catalog'
                  ? 'text-zinc-950 font-black shadow-lg bg-amber-400'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Catálogo Maestro</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                +40%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'text-white font-black shadow-lg'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
              }`}
              style={activeTab === 'catalog' ? {
                backgroundColor: palette.secondary30,
                boxShadow: `0 4px 14px ${palette.secondary30}50`,
              } : undefined}
            >
              <Shirt className="w-4 h-4" />
              <span>Explorar</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp_order')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'whatsapp_order'
                  ? 'text-zinc-950 font-black shadow-lg bg-emerald-400'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Pedidos</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customizer'
                  ? 'text-white font-black shadow-lg'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
              }`}
              style={activeTab === 'customizer' ? {
                backgroundColor: palette.secondary30,
                boxShadow: `0 4px 14px ${palette.secondary30}50`,
              } : undefined}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="flex items-center gap-1.5">
                Personalizador 3D
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </span>
            </button>

            <button
              onClick={() => setActiveTab('team_kits')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team_kits'
                  ? 'text-white font-black shadow-lg'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
              }`}
              style={activeTab === 'team_kits' ? {
                backgroundColor: palette.secondary30,
                boxShadow: `0 4px 14px ${palette.secondary30}50`,
              } : undefined}
            >
              <Users className="w-4 h-4" />
              <span>Crews</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'text-white font-black shadow-lg'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
              }`}
              style={activeTab === 'tracker' ? {
                backgroundColor: palette.secondary30,
                boxShadow: `0 4px 14px ${palette.secondary30}50`,
              } : undefined}
            >
              <Truck className="w-4 h-4" />
              <span>Rastreo</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Taller</span>
            </button>
          </nav>

          {/* Right Action Area (Valeria AI CTA + Audio + Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Valeria AI Assistant CTA */}
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title="Abrir Asistente Oficial Valeria FsGoD (Voz Barranquillera)"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Valeria IA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-950 text-amber-300 font-mono">
                  40%
                </span>
              </button>
            )}
            
            {/* Global Audio Controller in Header (Play, Pause, Stop, Mute) */}
            <div 
              className="relative flex items-center border rounded-2xl p-1 shadow-md transition-all"
              style={{
                backgroundColor: palette.cardBg,
                borderColor: `${palette.borderHex}40`,
              }}
            >
              
              {/* Play / Pause Button */}
              <button
                onClick={handleTogglePlay}
                className="p-2 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer"
                style={isPlaying ? {
                  backgroundColor: palette.secondary30,
                  color: '#FFFFFF',
                  boxShadow: `0 2px 8px ${palette.secondary30}40`,
                } : {
                  color: palette.secondary30,
                }}
                title={isPlaying ? 'Pausar audio (Pause)' : 'Reproducir audio (Play)'}
                aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={handleStop}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/60 transition-colors flex items-center justify-center cursor-pointer"
                title="Detener audio por completo (Stop)"
                aria-label="Detener audio"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Mute / Unmute Button */}
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer ${
                  isMuted
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-neutral-300 hover:text-amber-400 hover:bg-neutral-800/60'
                }`}
                title={isMuted ? 'Activar sonido (Unmute)' : 'Silenciar audio (Mute)'}
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar audio'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Mini visual indicator & track info for large screens */}
              <div 
                onClick={() => setShowVolumePopup(!showVolumePopup)}
                className="hidden md:flex items-center space-x-1.5 px-2 cursor-pointer border-l border-neutral-800"
                title="Ajustar volumen"
              >
                <div className="flex items-end space-x-0.5 h-3.5 w-3.5">
                  <div 
                    className={`w-0.5 rounded-full transition-all duration-100 ${isPlaying && !isMuted ? 'h-3 animate-pulse' : 'h-1 opacity-40'}`} 
                    style={{ backgroundColor: palette.secondary30 }}
                  />
                  <div 
                    className={`w-0.5 rounded-full transition-all duration-100 ${isPlaying && !isMuted ? 'h-2 animate-bounce' : 'h-1 opacity-40'}`} 
                    style={{ backgroundColor: palette.secondary30 }}
                  />
                  <div 
                    className={`w-0.5 rounded-full transition-all duration-100 ${isPlaying && !isMuted ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'}`} 
                    style={{ backgroundColor: palette.secondary30 }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 font-semibold max-w-[85px] truncate">
                  {isPlaying ? (isMuted ? 'Muted' : '90s Beat') : 'Audio OFF'}
                </span>
              </div>

              {/* Mini Volume Popover */}
              {showVolumePopup && (
                <div 
                  className="absolute top-full right-0 mt-2 w-48 border rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                  style={{
                    backgroundColor: palette.cardBg,
                    borderColor: `${palette.secondary30}60`,
                  }}
                >
                  <div 
                    className="flex items-center justify-between text-[11px] mb-2 font-mono"
                    style={{ color: palette.secondary30 }}
                  >
                    <span>Volumen:</span>
                    <span>{isMuted ? '0% (Muted)' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => audioEngine.setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#FF5722]"
                  />
                  <p className="text-[9px] text-neutral-400 mt-2 truncate font-mono">
                    🎵 {currentTrack.title}
                  </p>
                </div>
              )}

            </div>

            {/* Referral Ambassador CTA Button */}
            {onOpenReferral && (
              <button
                onClick={onOpenReferral}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono transition-all cursor-pointer"
                title="Gana 5% compartiendo con tu código de referido"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Gana 5%</span>
              </button>
            )}

            {/* Customizer CTA Button */}
            <button
              onClick={() => setActiveTab('customizer')}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              style={{
                backgroundColor: palette.secondary30,
                boxShadow: `0 8px 20px -4px ${palette.secondary30}50`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalizar</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl border text-neutral-200 hover:text-white transition-all flex items-center justify-center shadow-md cursor-pointer"
              style={{
                backgroundColor: palette.cardBg,
                borderColor: `${palette.borderHex}40`,
              }}
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: palette.secondary30 }} />
              {cartItemsCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white font-black text-[11px] flex items-center justify-center shadow-md animate-bounce"
                  style={{ backgroundColor: palette.secondary30 }}
                >
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl border text-neutral-300 hover:text-white cursor-pointer"
              style={{
                backgroundColor: palette.cardBg,
                borderColor: `${palette.borderHex}40`,
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="xl:hidden border-t p-4 space-y-2 animate-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: `${palette.headerBg}fa`,
            borderColor: `${palette.borderHex}30`,
          }}
        >
          {/* Mobile Theme Swatch Row */}
          <div className="p-3 rounded-2xl border space-y-2 mb-2" style={{ backgroundColor: palette.cardBg, borderColor: `${palette.borderHex}30` }}>
            <span className="text-[10px] font-mono text-neutral-400 font-bold block uppercase">
              🎨 Tema de Color (60-30-10)
            </span>
            <div className="flex items-center gap-2">
              {STREET_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    if (onSelectPalette) onSelectPalette(pal);
                    audioEngine.playClickSound();
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    palette.id === pal.id ? 'border-white text-white font-black' : 'border-neutral-700 text-neutral-400'
                  }`}
                  style={{ backgroundColor: palette.id === pal.id ? pal.secondary30 : undefined }}
                >
                  <span>{pal.shortName.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Audio Controls Bar inside Drawer */}
          <div 
            className="p-3 rounded-2xl border flex items-center justify-between mb-3"
            style={{
              backgroundColor: palette.cardBg,
              borderColor: `${palette.borderHex}30`,
            }}
          >
            <div className="min-w-0 mr-2">
              <span className="text-[10px] font-mono text-[#FF5722] font-bold block uppercase">
                🎵 Audio en Segundo Plano
              </span>
              <span className="text-xs font-bold text-white block truncate">
                {currentTrack.title}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleTogglePlay}
                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center ${
                  isPlaying ? 'bg-[#FF5722] text-white' : 'bg-neutral-800 text-[#FF5722]'
                }`}
                title={isPlaying ? 'Pausa' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                onClick={handleStop}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-rose-400 flex items-center justify-center"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl flex items-center justify-center ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-300'
                }`}
                title="Mute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {onOpenAssistant && (
            <button
              onClick={() => { onOpenAssistant(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-md"
            >
              <div className="flex items-center space-x-2.5">
                <Bot className="w-4 h-4" />
                <span>Valeria IA • Asistente Barranquillera</span>
              </div>
              <span className="text-[10px] bg-zinc-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                Margen 40%
              </span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('master_catalog'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'master_catalog' ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-zinc-900/80 text-amber-400 border border-amber-500/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calculator className="w-4 h-4" />
              <span>Catálogo Maestro (37 SKUs)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              Regla +40%
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('whatsapp_order'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'whatsapp_order' ? 'bg-emerald-400 text-zinc-950 font-black' : 'bg-zinc-900/80 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Pedidos & Liquidación</span>
          </button>

          {onOpenReferral && (
            <button
              onClick={() => { onOpenReferral(); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold bg-amber-400/10 border border-amber-500/30 text-amber-300"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Programa de Referidos (Gana 5%)</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'catalog' ? 'text-white font-black' : 'text-neutral-300'
            }`}
            style={activeTab === 'catalog' ? { backgroundColor: palette.secondary30 } : undefined}
          >
            <Shirt className="w-4 h-4" />
            <span>Explorar Colecciones</span>
          </button>

          <button
            onClick={() => { setActiveTab('customizer'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'customizer' ? 'text-white font-black' : 'text-neutral-300'
            }`}
            style={activeTab === 'customizer' ? { backgroundColor: palette.secondary30 } : undefined}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Personalizador 3D</span>
          </button>

          <button
            onClick={() => { setActiveTab('team_kits'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'team_kits' ? 'text-white font-black' : 'text-neutral-300'
            }`}
            style={activeTab === 'team_kits' ? { backgroundColor: palette.secondary30 } : undefined}
          >
            <Users className="w-4 h-4" />
            <span>Crews & Equipos</span>
          </button>

          <button
            onClick={() => { setActiveTab('tracker'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'tracker' ? 'text-white font-black' : 'text-neutral-300'
            }`}
            style={activeTab === 'tracker' ? { backgroundColor: palette.secondary30 } : undefined}
          >
            <Truck className="w-4 h-4" />
            <span>Rastreo & Comprobantes</span>
          </button>

          <button
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'admin' ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Panel Taller / Confección</span>
          </button>
        </div>
      )}
    </header>
  );
};
