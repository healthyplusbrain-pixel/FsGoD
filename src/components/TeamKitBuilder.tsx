import React, { useState } from 'react';
import { ProductItem, CustomDesignConfig } from '../types';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Plus, 
  FileSpreadsheet, 
  ArrowRight, 
  Award, 
  Flame,
  Truck,
  Percent,
  Share2
} from 'lucide-react';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';
import { ShareModal } from './ShareModal';
import { audioEngine } from '../utils/audioEngine';

interface TeamKitBuilderProps {
  products: ProductItem[];
  onStartCustomizingKit: (jerseyProduct: ProductItem) => void;
}

export const TeamKitBuilder: React.FC<TeamKitBuilderProps> = ({
  products,
  onStartCustomizingKit,
}) => {
  const [clubName, setClubName] = useState('Real Gladiadores FC');
  const [sportType, setSportType] = useState('soccer');
  const [playerCount, setPlayerCount] = useState<number>(18);
  const [selectedBundle, setSelectedBundle] = useState<'pro_match' | 'full_squad' | 'elite_championship'>('pro_match');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Bundle tiers
  const BUNDLES = [
    {
      id: 'pro_match',
      name: 'Pack Match Pro (2 Piezas)',
      includes: ['Camiseta Apex Pro-Dry Sublimada 4K', 'Short CarbonFlex con Calza'],
      pricePerPlayer: 76.00,
      badge: 'Más Popular',
    },
    {
      id: 'full_squad',
      name: 'Pack Full Squad (3 Piezas)',
      includes: ['Camiseta Apex Pro-Dry 4K', 'Short CarbonFlex Pro', 'Medias Técnicas de Compresión'],
      pricePerPlayer: 92.00,
      badge: 'Recomendado Clubes',
    },
    {
      id: 'elite_championship',
      name: 'Pack Elite Championship (4 Piezas)',
      includes: ['Camiseta Apex Pro-Dry', 'Short CarbonFlex', 'Medias Pro', 'Chaqueta StormShield o Hoodie'],
      pricePerPlayer: 154.00,
      badge: 'Delegación Completa',
    },
  ];

  const currentBundleObj = BUNDLES.find(b => b.id === selectedBundle) || BUNDLES[0];
  const rawSubtotal = currentBundleObj.pricePerPlayer * playerCount;
  
  let discountRate = 0;
  if (playerCount >= 25) discountRate = 0.18;
  else if (playerCount >= 12) discountRate = 0.10;
  else if (playerCount >= 5) discountRate = 0.05;

  const discountAmount = +(rawSubtotal * discountRate).toFixed(2);
  const totalAmount = +(rawSubtotal - discountAmount).toFixed(2);

  const jerseyItem = products.find(p => p.id === 'prod_jersey_apex') || products[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>EQUIPAMIENTO COLECTIVO PARA CLUBES & ACADEMIAS</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          DISEÑA LA EQUIPACIÓN DE TU <span className="text-amber-400">CLUB</span>
        </h1>

        <p className="text-sm text-slate-300">
          Sublimación ilimitada 4K sin costo extra por cantidad de patrocinadores, números o banderas. Descuentos automáticos por volumen de hasta el 18% para toda la plantilla.
        </p>
      </div>

      {/* Locker Room Sound: FsGoD Stadium Drill */}
      <SectionSoundtrackBanner sectionKey="team_kits" />

      {/* Interactive Kit Configurator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Club Details & Bundle Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              1. Información del Equipo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300">Nombre del Club / Empresa</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Disciplina Deportiva</label>
                <select
                  value={sportType}
                  onChange={e => setSportType(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white"
                >
                  <option value="soccer">Fútbol / Fútbol 7 / Sala</option>
                  <option value="running">Running / Atletismo</option>
                  <option value="basketball">Baloncesto</option>
                  <option value="crossfit">CrossFit / Gimnasio</option>
                  <option value="tennis_padel">Pádel / Tenis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Número de Jugadores / Kits ({playerCount} kits)</span>
                <span className="text-emerald-400 font-mono">
                  {discountRate > 0 ? `${discountRate * 100}% Descuento Aplicado` : 'Mínimo 5 para descuento'}
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={playerCount}
                onChange={e => setPlayerCount(parseInt(e.target.value))}
                className="w-full mt-2 accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>5 Jugadores (5% OFF)</span>
                <span>12 Jugadores (10% OFF)</span>
                <span>25+ Jugadores (18% OFF)</span>
                <span>100 Jugadores</span>
              </div>
            </div>
          </div>

          {/* Bundle Options */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-cyan-400" />
              2. Selecciona el Paquete de Equipación
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BUNDLES.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBundle(b.id as any)}
                  className={`p-5 rounded-3xl text-left border transition-all flex flex-col justify-between space-y-4 ${
                    selectedBundle === b.id
                      ? 'bg-amber-400/10 border-amber-400 shadow-xl shadow-amber-400/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase">
                      {b.badge}
                    </span>
                    <h3 className="text-sm font-black text-white">{b.name}</h3>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {b.includes.map((it, idx) => (
                        <li key={idx} className="flex items-center text-[11px]">
                          <Check className="w-3 h-3 text-amber-400 mr-1 flex-shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Por jugador</span>
                    <span className="text-xl font-black text-white">
                      ${b.pricePerPlayer.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Summary Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 rounded-3xl border border-amber-400/40 shadow-2xl space-y-6 sticky top-28">
          
          <div>
            <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
              PRESUPUESTO ESTIMADO DE EQUIPACIÓN
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {clubName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentBundleObj.name} • {playerCount} Atletas
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono border-t border-b border-slate-800 py-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({playerCount} kits x ${currentBundleObj.pricePerPlayer.toFixed(2)}):</span>
              <span>${rawSubtotal.toFixed(2)}</span>
            </div>

            {discountRate > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Descuento por Volumen ({(discountRate * 100)}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Sublimación Digital 4K & Escudos:</span>
              <span className="text-cyan-400 font-bold">INCLUIDO ($0)</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Envío Express a Sede de Club:</span>
              <span className="text-cyan-400 font-bold">GRATIS</span>
            </div>

            <div className="flex justify-between text-base font-sans font-black text-white pt-2 border-t border-slate-800">
              <span>Total Club:</span>
              <span className="text-amber-400 text-2xl">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Value props */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" />
              <span>Garantía de reposición de tallas por 12 meses</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 text-amber-400 mr-2" />
              <span>Diseño 3D y muestra previa digital aprobada por ti</span>
            </div>
            <div className="flex items-center">
              <Truck className="w-4 h-4 text-cyan-400 mr-2" />
              <span>Entrega de equipaciones completas en 7 días</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => onStartCustomizingKit(jerseyItem)}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalizar los Colores y Escudo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                audioEngine.playSprayCanSound();
                setIsShareModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Compartir Propuesta con el Club (5% OFF)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={jerseyItem}
        customTitle={`Equipación Oficial ${clubName} - FsGoD Custom`}
      />

    </div>
  );
};
