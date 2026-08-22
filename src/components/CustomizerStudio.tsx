import React, { useState } from 'react';
import { CustomDesignConfig, ProductItem, TeamPlayerRoster } from '../types';
import { GarmentVisualizer } from './GarmentVisualizer';
import { ASSET_IMAGES, ARTWORK_PRESETS } from '../assets/images';
import { 
  Sparkles, 
  RotateCw, 
  Palette, 
  Type, 
  Shield, 
  FileText, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Users, 
  Check, 
  Zap, 
  Flame, 
  Cpu, 
  Download,
  Info,
  Sliders,
  Layers,
  Image as ImageIcon,
  Share2,
  Gift
} from 'lucide-react';
import { ShareModal } from './ShareModal';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';
import { audioEngine } from '../utils/audioEngine';

interface CustomizerStudioProps {
  products: ProductItem[];
  selectedProduct: ProductItem;
  onSelectProduct: (prod: ProductItem) => void;
  onAddToCart: (design: CustomDesignConfig, unitPrice: number, quantity: number) => void;
}

export const CustomizerStudio: React.FC<CustomizerStudioProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onAddToCart,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Active design state
  const [design, setDesign] = useState<CustomDesignConfig>({
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    productCategory: selectedProduct.category,
    viewAngle: selectedProduct.id === 'prod_hoodie_tokyo_navy' ? 'back' : 'front',
    baseColor: selectedProduct.availableColors[0]?.hex || '#ffffff',
    secondaryColor: selectedProduct.availableColors[0]?.secondaryHex || '#00f0ff',
    accentColor: '#00f0ff',
    collarColor: selectedProduct.availableColors[0]?.secondaryHex || '#00f0ff',
    stitchingColor: '#00f0ff',
    pattern: 'solid_matte',
    fabricType: 'fs_dry_pro',
    collarStyle: 'crew',
    frontText: 'FsGoD',
    frontNumber: '10',
    frontLogoType: 'fsgod_apex',
    sponsorText: 'FE EN MOVIMIENTO',
    backPlayerName: 'FsGoD STREETWEAR',
    backPlayerNumber: '10',
    backMotto: 'DIOS POR DELANTE // 2026',
    leftSleeveText: 'FsGoD APEX',
    rightSleeveBadge: 'pro_division',
    fontFamily: '90s Graffiti Tag',
    textColor: '#ffffff',
    textOutlineColor: '#ff5500',
    hasTextOutline: false,
    selectedSize: 'L',
    quantity: 1,
    finishType: 'sublimation_4k',
    productionTier: 'standard',
    graffitiStyle: 'wildstyle_tag',
    hasDistressEffect: false,
    hasChainOverlay: false,
    userUploadedImageScale: 1.0,
    userUploadedImageRotation: 0,
    userUploadedImagePlacement: 'front',
    userUploadedImageBlend: 'normal',
    graphicArtwork: selectedProduct.id === 'prod_hoodie_flame_car' 
      ? 'blue_flame_car' 
      : selectedProduct.id === 'prod_hoodie_tokyo_navy' 
        ? 'tokyo_kanji_crest' 
        : selectedProduct.id === 'prod_hoodie_retro_street' 
          ? 'street_cartoon_crew' 
          : 'blue_flame_car',
    graphicArtworkPlacement: selectedProduct.id === 'prod_hoodie_tokyo_navy' ? 'back' : 'front',
  });

  // Active customizer tab
  const [activeToolTab, setActiveToolTab] = useState<'artworks' | 'graffiti' | 'colors' | 'patterns' | 'text' | 'logos' | 'roster' | 'ai'>('graffiti');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // AI Generator modal/loading state
  const [aiTeamName, setAiTeamName] = useState('Vanguard Club');
  const [aiSport, setAiSport] = useState('soccer');
  const [aiVibe, setAiVibe] = useState('Cyberpunk, agresivo, de élite');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiConceptResult, setAiConceptResult] = useState<any>(null);

  // Tech Pack preview modal
  const [techPackModal, setTechPackModal] = useState<any>(null);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);

  // Team Roster entries
  const [roster, setRoster] = useState<TeamPlayerRoster[]>([
    { id: '1', name: 'MENDOZA', number: '10', size: 'L', captain: true, role: 'Delantero' },
    { id: '2', name: 'SILVA', number: '07', size: 'M', captain: false, role: 'Extremo' },
    { id: '3', name: 'VARGAS', number: '04', size: 'XL', captain: false, role: 'Defensa Central' },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerSize, setNewPlayerSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'>('L');

  // Preset Color Palettes
  const PRESET_THEMES = [
    { name: 'Onyx & Cyber Volt', base: '#0f172a', secondary: '#00f0ff', accent: '#f59e0b', collar: '#00f0ff' },
    { name: 'Stealth Carbon & Crimson', base: '#18181b', secondary: '#e11d48', accent: '#ffffff', collar: '#e11d48' },
    { name: 'Hyper Emerald & Gold', base: '#064e3b', secondary: '#10b981', accent: '#fbbf24', collar: '#10b981' },
    { name: 'Pure Titanium & Royal', base: '#f8fafc', secondary: '#2563eb', accent: '#0f172a', collar: '#2563eb' },
    { name: 'Midnight Navy & Sunset', base: '#0a192f', secondary: '#f97316', accent: '#38bdf8', collar: '#f97316' },
    { name: 'Deep Amethyst & Mint', base: '#2e1065', secondary: '#a855f7', accent: '#2dd4bf', collar: '#a855f7' },
  ];

  // Update design helper
  const updateDesign = (fields: Partial<CustomDesignConfig>) => {
    setDesign(prev => ({ ...prev, ...fields }));
  };

  // Switch base product
  const handleProductChange = (prod: ProductItem) => {
    onSelectProduct(prod);
    if (prod.id === 'prod_jersey_football_heritage') {
      setDesign(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        productCategory: prod.category,
        pattern: 'football_mesh_heavy',
        collarStyle: 'striped_varsity_v',
        frontLogoType: 'heraldic_laurel_crest',
        frontText: 'HARD KNOCKS',
        frontNumber: '61',
        backPlayerName: 'HARD KNOCKS',
        backPlayerNumber: '61',
        backMotto: 'FILIPENSES 4:13 // TODO LO PUEDO EN CRISTO',
        baseColor: '#0a0e17',
        secondaryColor: '#1e293b',
        accentColor: '#f59e0b',
        collarColor: '#f59e0b',
        stitchingColor: '#f59e0b',
        fontFamily: 'Impact Athletic',
        selectedSize: 'XL',
        viewAngle: 'front',
      }));
    } else if (prod.id === 'prod_jersey_baseball_raglan') {
      setDesign(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        productCategory: prod.category,
        pattern: 'solid_matte',
        collarStyle: 'baseball_placket',
        frontLogoType: 'heraldic_laurel_crest',
        frontText: 'NEW YORK FS',
        frontNumber: '61',
        backPlayerName: 'TRINITY',
        backPlayerNumber: '61',
        backMotto: 'ISAÍAS 40:31',
        baseColor: '#064e3b',
        secondaryColor: '#0f172a',
        accentColor: '#ffffff',
        collarColor: '#0f172a',
        stitchingColor: '#ffffff',
        fontFamily: 'Impact Athletic',
        selectedSize: 'L',
        viewAngle: 'front',
      }));
    } else {
      setDesign(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        productCategory: prod.category,
        baseColor: prod.availableColors[0]?.hex || prev.baseColor,
        secondaryColor: prod.availableColors[0]?.secondaryHex || prev.secondaryColor,
      }));
    }
  };

  // Add player to roster
  const addPlayerToRoster = () => {
    if (!newPlayerName.trim() || !newPlayerNumber.trim()) return;
    const newEntry: TeamPlayerRoster = {
      id: Date.now().toString(),
      name: newPlayerName.toUpperCase().trim(),
      number: newPlayerNumber.trim(),
      size: newPlayerSize,
      captain: false,
    };
    const updated = [...roster, newEntry];
    setRoster(updated);
    setDesign(prev => ({
      ...prev,
      teamRoster: updated,
      quantity: updated.length,
    }));
    setNewPlayerName('');
    setNewPlayerNumber('');
  };

  const removePlayerFromRoster = (id: string) => {
    const updated = roster.filter(p => p.id !== id);
    setRoster(updated);
    setDesign(prev => ({
      ...prev,
      teamRoster: updated,
      quantity: Math.max(1, updated.length),
    }));
  };

  // Trigger AI Concept generation
  const handleGenerateAiConcept = async () => {
    setIsGeneratingAi(true);
    setAiConceptResult(null);
    try {
      const res = await fetch('/api/customizer/ai-generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: aiTeamName,
          sport: aiSport,
          vibe: aiVibe,
          targetItem: selectedProduct.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.concept) {
        setAiConceptResult(data.concept);
      }
    } catch (e) {
      console.error('Error generating AI concept:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Apply AI concept directly to customizer
  const applyAiConcept = (concept: any) => {
    setDesign(prev => ({
      ...prev,
      frontText: concept.teamName || prev.frontText,
      backMotto: concept.motto || prev.backMotto,
      baseColor: concept.recommendedColors?.primary || prev.baseColor,
      secondaryColor: concept.recommendedColors?.secondary || prev.secondaryColor,
      accentColor: concept.recommendedColors?.accent || prev.accentColor,
      collarColor: concept.recommendedColors?.secondary || prev.collarColor,
      stitchingColor: concept.recommendedColors?.accent || prev.stitchingColor,
      pattern: concept.suggestedPattern || prev.pattern,
      fontFamily: concept.typographyStyle || prev.fontFamily,
    }));
  };

  // Generate manufacturing Tech Pack
  const handleGenerateTechPack = async () => {
    setIsGeneratingTechPack(true);
    try {
      const res = await fetch('/api/customizer/tech-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design }),
      });
      const data = await res.json();
      if (data.success) {
        setTechPackModal(data.techPack);
      }
    } catch (e) {
      console.error('Error creating Tech Pack:', e);
    } finally {
      setIsGeneratingTechPack(false);
    }
  };

  // Pricing calculations
  const effectiveQty = roster.length > 0 ? roster.length : design.quantity;
  const baseGarmentPrice = selectedProduct.basePrice;
  const customFee40Percent = +(baseGarmentPrice * 0.40).toFixed(2);
  let unitPrice = +(baseGarmentPrice + customFee40Percent).toFixed(2);
  if (design.finishType === 'sublimation_4k') unitPrice += 6.00;
  if (design.finishType === 'hybrid_metallic') unitPrice += 9.00;
  if (design.productionTier === 'express_72h') unitPrice += 12.00;

  const rawSubtotal = unitPrice * effectiveQty;
  let discountRate = 0;
  if (effectiveQty >= 25) discountRate = 0.18;
  else if (effectiveQty >= 12) discountRate = 0.10;
  else if (effectiveQty >= 5) discountRate = 0.05;

  const discountAmount = +(rawSubtotal * discountRate).toFixed(2);
  const finalPrice = +(rawSubtotal - discountAmount).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Studio Header & Product Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#FF5722] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Estudio de Personalización & Confección Digital 3D</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            FsGoD <span className="text-[#FF5722]">CUSTOM STUDIO 3D</span>
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl mt-1">
            Personaliza colores, tramas de graffiti 90s, tipografías dorsales, escudos trinitarios termosellados y genera la ficha técnica oficial de confección.
          </p>
        </div>

        {/* Garment Selector Pills & Quick Share */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
          {products.map(p => (
            <div key={p.id} className="flex items-center bg-[#1E1E1E] rounded-xl border border-neutral-800 p-0.5">
              <button
                onClick={() => handleProductChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedProduct.id === p.id
                    ? 'bg-[#FF5722] text-white shadow-md shadow-[#FF5722]/30 font-black'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span>{p.name.split(' ')[1] || p.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(p);
                  audioEngine.playSprayCanSound();
                  setIsShareModalOpen(true);
                }}
                className="px-1.5 py-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-all cursor-pointer"
                title={`Compartir ${p.name}`}
                aria-label={`Compartir ${p.name}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Quick Share Active Garment */}
          <button
            onClick={() => {
              audioEngine.playSprayCanSound();
              setIsShareModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 border border-amber-500/40 text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer"
            title={`Compartir ${selectedProduct.name}`}
            id="btn-share-customizer-garment"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir Prenda</span>
          </button>
        </div>
      </div>

      {/* Studio Soundtrack: FsGoD Cyber Lab (Techwear Studio Flow) */}
      <div className="mt-6">
        <SectionSoundtrackBanner sectionKey="customizer" />
      </div>

      {/* Main Studio Grid: Visualizer on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        
        {/* LEFT COLUMN: Garment Stage Visualizer & View Controls (5 Cols) */}
        <div className="lg:col-span-6 sticky top-28 space-y-4">
          
          {/* Visualizer Canvas */}
          <GarmentVisualizer design={design} showGrid={true} />

          {/* View Angle Switcher Buttons */}
          <div className="flex items-center justify-center space-x-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => updateDesign({ viewAngle: 'front' })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                design.viewAngle === 'front'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Frente</span>
            </button>

            <button
              onClick={() => updateDesign({ viewAngle: 'back' })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                design.viewAngle === 'back'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Dorsal / Espalda</span>
            </button>

            <button
              onClick={() => updateDesign({ viewAngle: 'side' })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                design.viewAngle === 'side'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Perfil / Manga</span>
            </button>
          </div>

          {/* Preset Theme Quick Switches */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5 text-[#FF5722] font-mono">
                <Flame className="w-3.5 h-3.5 text-[#FF5722]" /> PALETAS OFICIALES FsGoD STREETWEAR
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Clic para aplicar</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_THEMES.map((theme, i) => (
                <button
                  key={i}
                  onClick={() => updateDesign({
                    baseColor: theme.base,
                    secondaryColor: theme.secondary,
                    accentColor: theme.accent,
                    collarColor: theme.collar,
                    stitchingColor: theme.secondary,
                  })}
                  className="group p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 transition-all text-center flex flex-col items-center gap-1.5"
                  title={theme.name}
                >
                  <div className="flex -space-x-1.5">
                    <span className="w-4 h-4 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: theme.base }} />
                    <span className="w-4 h-4 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: theme.secondary }} />
                    <span className="w-4 h-4 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <span className="text-[9px] text-slate-400 group-hover:text-amber-300 font-mono truncate w-full">
                    {theme.name.split('&')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tech Pack & Share Design Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Ficha Técnica (Tech Pack) & Compartir
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pantones exactos, cotas y enlace con 5% de descuento.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Compartir diseño personalizado"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>

              <button
                onClick={handleGenerateTechPack}
                disabled={isGeneratingTechPack}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isGeneratingTechPack ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Tech Pack</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Customization Control Center (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Customizer Sub-Navigation Tabs */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                audioEngine.playSprayCanSound();
                setActiveToolTab('graffiti');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'graffiti' ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-orange-500/20' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Graffiti 90s</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setActiveToolTab('artworks');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'artworks' ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Estampados</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setActiveToolTab('colors');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'colors' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Colores</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setActiveToolTab('patterns');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'patterns' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tramas</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playTapeScratchSound();
                setActiveToolTab('text');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'text' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Dorsales</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setActiveToolTab('logos');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'logos' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Escudos</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setActiveToolTab('roster');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'roster' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Plantilla</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playWhooshSound();
                setActiveToolTab('ai');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                activeToolTab === 'ai' ? 'bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 font-black' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>IA Studio</span>
            </button>
          </div>

          {/* TAB 0: 90s HIP-HOP & GRAFFITI STREETWEAR STUDIO */}
          {activeToolTab === 'graffiti' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-orange-500/40 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>Estudio Streetwear & Graffiti 90s</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Personalización Urbana, Tags & Filtros de Época
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Elige estilos legendarios de graffiti 90s, carga imágenes de referencia y ajusta escala, rotación y efectos de aerosol.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playSprayCanSound();
                    updateDesign({
                      graffitiStyle: 'wildstyle_tag',
                      fontFamily: '90s Graffiti Tag',
                      baseColor: '#121316',
                      secondaryColor: '#ff5500',
                      accentColor: '#00f0ff',
                      collarColor: '#ff5500',
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Preset 90s King</span>
                </button>
              </div>

              {/* 90s Graffiti Style Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Estilos de Graffiti & Overlays 90s</span>
                  <span className="text-[10px] text-orange-400 font-mono">Selección Rápida</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'wildstyle_tag', name: 'Wildstyle Tag 90s', desc: 'Spray aerosol naranja neón', sfx: 'spray' },
                    { id: 'bubble_throwup', name: 'Bubble Throw-Up King', desc: 'Burbujas cian con borde blanco', sfx: 'spray' },
                    { id: 'chrome_3d', name: 'Chrome 3D Chicano XXI', desc: 'Metálico reflectivo plateado', sfx: 'cash' },
                    { id: 'stencil_spray', name: 'Brooklyn Stencil', desc: 'Plantilla callejera estarcido', sfx: 'spray' },
                    { id: 'acid_wash_distress', name: 'Acid-Wash Distressed', desc: 'Lavado ácido vintage', sfx: 'scratch' },
                    { id: 'none', name: 'Sin Overlay Graffiti', desc: 'Prenda lisa deportiva', sfx: 'click' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        if (g.sfx === 'spray') audioEngine.playSprayCanSound();
                        else if (g.sfx === 'scratch') audioEngine.playTapeScratchSound();
                        else if (g.sfx === 'cash') audioEngine.playCashChimeSound();
                        else audioEngine.playClickSound();
                        updateDesign({ graffitiStyle: g.id as any });
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        design.graffitiStyle === g.id
                          ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        {g.name}
                        {design.graffitiStyle === g.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Streetwear Overlays: Heavy Chain & Acid Distress Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playCashChimeSound();
                    updateDesign({ hasChainOverlay: !design.hasChainOverlay });
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    design.hasChainOverlay
                      ? 'bg-amber-400/20 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">Cadena Gruesa Streetwear</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Collar 3D estilo hip-hop 90s</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${design.hasChainOverlay ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    {design.hasChainOverlay ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playTapeScratchSound();
                    updateDesign({ hasDistressEffect: !design.hasDistressEffect });
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    design.hasDistressEffect
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">Textura Acid Wash / Desgaste</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Efecto gastado vintage grunge</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${design.hasDistressEffect ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    {design.hasDistressEffect ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* USER REFERENCE IMAGE UPLOADER & MOCKUP CONTROLS */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-orange-400" />
                    <h4 className="text-xs font-bold text-white">Cargar Imagen de Referencia / Logo Propio</h4>
                  </div>
                  {design.userUploadedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playClickSound();
                        updateDesign({ userUploadedImage: undefined, userUploadedImageName: undefined });
                      }}
                      className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Quitar imagen</span>
                    </button>
                  )}
                </div>

                {!design.userUploadedImage ? (
                  <label 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        audioEngine.playSprayCanSound();
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            updateDesign({
                              userUploadedImage: event.target.result as string,
                              userUploadedImageName: file.name,
                              userUploadedImagePlacement: 'front',
                              userUploadedImageScale: 1.0,
                              userUploadedImageRotation: 0,
                              userUploadedImageBlend: 'normal',
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group ${
                      isDraggingFile
                        ? 'border-cyan-400 bg-cyan-950/40 scale-102 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-700 hover:border-[#FF5722] bg-slate-900/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform ${
                      isDraggingFile ? 'bg-cyan-500/20 text-cyan-300 scale-110' : 'bg-[#FF5722]/15 text-[#FF5722] group-hover:scale-110'
                    }`}>
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isDraggingFile ? '¡Suelta tu archivo de graffiti o tag aquí!' : 'Arrastra o haz clic para subir archivo de tag / graffiti'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Soporta PNG transparente, JPG, WEBP, SVG</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          audioEngine.playSprayCanSound();
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              updateDesign({
                                userUploadedImage: event.target.result as string,
                                userUploadedImageName: file.name,
                                userUploadedImagePlacement: 'front',
                                userUploadedImageScale: 1.0,
                                userUploadedImageRotation: 0,
                                userUploadedImageBlend: 'normal',
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    {/* Active Upload Preview Row */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <img
                        src={design.userUploadedImage}
                        alt="Uploaded preview"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-contain rounded-lg bg-black border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{design.userUploadedImageName || 'Imagen Personalizada'}</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">✓ Renderizado en Mockup 3D</p>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer">
                        <span>Cambiar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              audioEngine.playSprayCanSound();
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  updateDesign({
                                    userUploadedImage: event.target.result as string,
                                    userUploadedImageName: file.name,
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Placement selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300">Ubicación en la Prenda</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'front', label: 'Pecho / Frente', angle: 'front' },
                          { id: 'back', label: 'Espalda / Dorsal', angle: 'back' },
                          { id: 'sleeve', label: 'Manga / Perfil', angle: 'side' },
                        ].map(pos => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => {
                              audioEngine.playClickSound();
                              updateDesign({
                                userUploadedImagePlacement: pos.id as any,
                                viewAngle: pos.angle as any,
                              });
                            }}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              design.userUploadedImagePlacement === pos.id
                                ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scale & Rotation Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Escala / Tamaño:</span>
                          <span className="font-mono text-orange-400">{Math.round((design.userUploadedImageScale || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.8"
                          step="0.05"
                          value={design.userUploadedImageScale || 1.0}
                          onChange={(e) => updateDesign({ userUploadedImageScale: parseFloat(e.target.value) })}
                          className="w-full accent-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Rotación:</span>
                          <span className="font-mono text-orange-400">{design.userUploadedImageRotation || 0}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={design.userUploadedImageRotation || 0}
                          onChange={(e) => updateDesign({ userUploadedImageRotation: parseInt(e.target.value, 10) })}
                          className="w-full accent-orange-500"
                        />
                      </div>
                    </div>

                    {/* Blend Mode Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300">Acabado / Textura Textil</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'normal', name: 'Sublimado 4K' },
                          { id: 'spray_stencil', name: 'Spray Aerosol' },
                          { id: 'acid_wash', name: 'Acid Wash' },
                          { id: 'vintage_screenprint', name: 'Plastisol Retro' },
                        ].map(blend => (
                          <button
                            key={blend.id}
                            type="button"
                            onClick={() => {
                              audioEngine.playSprayCanSound();
                              updateDesign({ userUploadedImageBlend: blend.id as any });
                            }}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                              (design.userUploadedImageBlend || 'normal') === blend.id
                                ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            {blend.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 90s Typography Picker */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300">Tipografías Streetwear 90s & Hip-Hop</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    '90s Graffiti Tag',
                    'East Coast Heavy',
                    'West Coast Gothic',
                    'BoomBap College',
                    'Cyber Chrome',
                    'Impact Athletic',
                  ].map(font => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => {
                        audioEngine.playClickSound();
                        updateDesign({ fontFamily: font as any });
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        design.fontFamily === font
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARTWORKS & SIGNATURE PRINTS */}
          {activeToolTab === 'artworks' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    Estampados & Gráficas de Colección
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Elige entre los artes oficiales FsGoD o carga una gráfica propia para sublimar en alta definición 4K.
                  </p>
                </div>

                {/* Placement Toggle */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => updateDesign({ graphicArtworkPlacement: 'front', viewAngle: 'front' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      design.graphicArtworkPlacement !== 'back' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    onClick={() => updateDesign({ graphicArtworkPlacement: 'back', viewAngle: 'back' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      design.graphicArtworkPlacement === 'back' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Espalda
                  </button>
                </div>
              </div>

              {/* Official Artworks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ARTWORK_PRESETS.map((art) => {
                  const isSelected = design.graphicArtwork === art.id;
                  return (
                    <div
                      key={art.id}
                      onClick={() => {
                        updateDesign({ 
                          graphicArtwork: art.id, 
                          graphicArtworkUrl: undefined,
                          viewAngle: art.id === 'tokyo_kanji_crest' ? 'back' : 'front',
                          graphicArtworkPlacement: art.id === 'tokyo_kanji_crest' ? 'back' : 'front',
                        });
                      }}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                          <img
                            src={art.thumbnailUrl}
                            alt={art.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-mono font-bold text-amber-400/90 tracking-wider">
                            {art.category}
                          </span>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {art.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {art.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {isSelected ? '✓ Aplicado en visualizador' : 'Clic para estampar'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (art.id === 'football_varsity_heritage') {
                              updateDesign({
                                graphicArtwork: art.id,
                                baseColor: '#0a0e17',
                                secondaryColor: '#f59e0b',
                                accentColor: '#fbbf24',
                                collarColor: '#f59e0b',
                                graphicArtworkPlacement: 'front',
                                viewAngle: 'front',
                              });
                            } else if (art.id === 'baseball_raglan_trinity') {
                              updateDesign({
                                graphicArtwork: art.id,
                                baseColor: '#064e3b',
                                secondaryColor: '#0f172a',
                                accentColor: '#f59e0b',
                                collarColor: '#0f172a',
                                graphicArtworkPlacement: 'front',
                                viewAngle: 'front',
                              });
                            } else if (art.id === 'blue_flame_car') {
                              updateDesign({
                                graphicArtwork: art.id,
                                baseColor: '#ffffff',
                                secondaryColor: '#00f0ff',
                                accentColor: '#00f0ff',
                                collarColor: '#00f0ff',
                                graphicArtworkPlacement: 'front',
                                viewAngle: 'front',
                              });
                            } else if (art.id === 'tokyo_kanji_crest') {
                              updateDesign({
                                graphicArtwork: art.id,
                                baseColor: '#1e293b',
                                secondaryColor: '#0f172a',
                                accentColor: '#00f0ff',
                                collarColor: '#0f172a',
                                graphicArtworkPlacement: 'back',
                                viewAngle: 'back',
                              });
                            } else if (art.id === 'street_cartoon_crew' || art.id === 'streetwear_retro_hoodie_edition') {
                              updateDesign({
                                graphicArtwork: art.id,
                                baseColor: '#18181b',
                                secondaryColor: '#ef4444',
                                accentColor: '#ef4444',
                                collarColor: '#ef4444',
                                graphicArtworkPlacement: 'front',
                                viewAngle: 'front',
                              });
                            }
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-slate-900 text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                        >
                          Paleta Recomendada
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Option: Sin Estampado / Clean */}
                <div
                  onClick={() => updateDesign({ graphicArtwork: 'none', graphicArtworkUrl: undefined })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    design.graphicArtwork === 'none' && !design.graphicArtworkUrl
                      ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                      Ø
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Sin Estampado Gráfico</h4>
                      <p className="text-[11px] text-slate-400">Prenda lisa minimalista con solo dorsales o logotipo.</p>
                    </div>
                  </div>
                  {(design.graphicArtwork === 'none' && !design.graphicArtworkUrl) && (
                    <Check className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                {/* Custom Upload Box */}
                <label className="p-4 rounded-2xl border border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-950 cursor-pointer flex items-center justify-between transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300">Cargar Archivo Propio (PNG / JPG)</h4>
                      <p className="text-[11px] text-slate-400">Vector o arte personalizado de tu equipo o marca.</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            updateDesign({
                              graphicArtwork: 'custom_upload',
                              graphicArtworkUrl: event.target.result as string,
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="text-xs font-bold text-cyan-400 underline">Examinar</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 1: COLORS CUSTOMIZER */}
          {activeToolTab === 'colors' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                Configuración de Zonas de Color
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Base Body Color */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Cuerpo Principal (Base)</span>
                    <span className="font-mono text-[11px] text-amber-400">{design.baseColor}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={design.baseColor}
                      onChange={e => updateDesign({ baseColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.baseColor}
                      onChange={e => updateDesign({ baseColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Secondary Panels / Sleeves */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Mangas & Paneles Laterales</span>
                    <span className="font-mono text-[11px] text-cyan-400">{design.secondaryColor}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={design.secondaryColor}
                      onChange={e => updateDesign({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.secondaryColor}
                      onChange={e => updateDesign({ secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Accent Trim */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Líneas de Acento & Vivos</span>
                    <span className="font-mono text-[11px] text-yellow-400">{design.accentColor}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={design.accentColor}
                      onChange={e => updateDesign({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.accentColor}
                      onChange={e => updateDesign({ accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Collar Rib */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Rib de Cuello & Puños</span>
                    <span className="font-mono text-[11px] text-emerald-400">{design.collarColor}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={design.collarColor}
                      onChange={e => updateDesign({ collarColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={design.collarColor}
                      onChange={e => updateDesign({ collarColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Collar Style Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Tipo de Cuello Técnico y Acabado</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'striped_varsity_v', label: '⚡ Cuello V Rayado Varsity' },
                    { id: 'baseball_placket', label: '⚾ Camisola Béisbol Botones' },
                    { id: 'v_neck', label: 'Cuello V Clásico' },
                    { id: 'crew', label: 'Cuello Redondo Rib' },
                    { id: 'athletic_polo', label: 'Polo Deportivo' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateDesign({ collarStyle: c.id as any })}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                        design.collarStyle === c.id
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATTERNS & FABRIC TECH */}
          {activeToolTab === 'patterns' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Texturas y Tramas Sublimadas
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'football_mesh_heavy', name: 'Heavy Pro-Mesh', desc: 'Malla perforada de football americano' },
                  { id: 'baseball_pinstripe', name: 'Pinstripe Vintage', desc: 'Rayas finas clásicas de béisbol' },
                  { id: 'trinity_radiance', name: 'Trinity Radiance', desc: 'Destellos y geometría trinitaria' },
                  { id: 'carbon_hex', name: 'Hexágonos de Carbono', desc: 'Estructura biomecánica pro' },
                  { id: 'circuit_mesh', name: 'Circuit Mesh Cyber', desc: 'Líneas micro-tecnológicas' },
                  { id: 'solid_matte', name: 'Color Sólido Mate', desc: 'Elegancia pura sin tramas' },
                ].map(pat => (
                  <button
                    key={pat.id}
                    onClick={() => updateDesign({ pattern: pat.id as any })}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      design.pattern === pat.id
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-black text-white flex items-center justify-between">
                      {pat.name}
                      {design.pattern === pat.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{pat.desc}</p>
                  </button>
                ))}
              </div>

              {/* Fabric Type Selector */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300">Tecnología de Confección Textil</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'heritage_heavy_mesh', name: 'Heritage Pro-Mesh 240g', gsm: '240g/m² - Máxima Durabilidad & Autenticidad' },
                    { id: 'fs_dry_pro', name: 'FS-Dry 3.0 Micro-Mesh', gsm: '160g/m² - Máxima Transpirabilidad' },
                    { id: 'aerovent_mesh', name: 'AeroVent Ultra-Light', gsm: '130g/m² - Para Maratón y Calor Extremo' },
                    { id: 'thermo_shield', name: 'ThermoShield Dual-Fleece', gsm: '280g/m² - Retención Térmica' },
                  ].map(fab => (
                    <button
                      key={fab.id}
                      onClick={() => updateDesign({ fabricType: fab.id as any })}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        design.fabricType === fab.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{fab.name}</p>
                      <p className="text-[10px] text-cyan-400/90 font-mono mt-0.5">{fab.gsm}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY, NAMES & NUMBERS */}
          {activeToolTab === 'text' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-400" />
                Estampado de Dorsal, Nombres y Versículo Sagrado
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front Team Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Rótulo Frontal (Pecho)</label>
                  <input
                    type="text"
                    value={design.frontText}
                    onChange={e => updateDesign({ frontText: e.target.value.toUpperCase() })}
                    placeholder="HARD KNOCKS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Front Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Número Frontal Biselado</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={design.frontNumber}
                    onChange={e => updateDesign({ frontNumber: e.target.value })}
                    placeholder="61"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                {/* Back Player Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nombre de Jugador (Dorsal)</label>
                  <input
                    type="text"
                    value={design.backPlayerName}
                    onChange={e => updateDesign({ backPlayerName: e.target.value.toUpperCase() })}
                    placeholder="HARD KNOCKS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Back Player Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Número Dorsal Espalda (2-Tonos)</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={design.backPlayerNumber}
                    onChange={e => updateDesign({ backPlayerNumber: e.target.value })}
                    placeholder="61"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Holy Trinity Quick Bible Verse Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>✝️ Versículos de Fortaleza & Fe Trinitaria (Bajo Dorsal)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Selección Rápida</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'FILIPENSES 4:13 // TODO LO PUEDO EN CRISTO',
                    'ISAÍAS 40:31 // LOS QUE ESPERAN EN EL SEÑOR',
                    'JOSUÉ 1:9 // ESFUÉRZATE Y SÉ VALIENTE',
                    'SALMOS 23:1 // EL SEÑOR ES MI PASTOR',
                    '1 CORINTIOS 9:24 // CORRED PARA GANAR',
                    '2 TIMOTEO 4:7 // HE PELEADO LA BUENA BATALLA',
                  ].map(verse => (
                    <button
                      key={verse}
                      type="button"
                      onClick={() => updateDesign({ backMotto: verse, holyTrinityVerse: verse })}
                      className={`px-3 py-2 rounded-xl text-left text-[11px] font-mono font-bold border transition-all truncate ${
                        design.backMotto === verse
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {verse}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selector & Text Styling */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300">Tipografía de Dorsal</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Impact Athletic', 'Cyber Sans', 'Futuristic Mono', 'Bold Display'].map(f => (
                    <button
                      key={f}
                      onClick={() => updateDesign({ fontFamily: f as any })}
                      className={`p-2.5 rounded-xl text-xs border font-bold transition-all ${
                        design.fontFamily === f
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BADGES & SPONSOR LOGOS */}
          {activeToolTab === 'logos' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Escudos Oficiales Trinitarios y Heráldica FsGoD
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'heraldic_laurel_crest', name: 'Corona Laureles FS', desc: 'Sello Champions Oro' },
                  { id: 'roman_numeral_patch', name: 'Parche Romano XXI', desc: 'Emblema Heritage' },
                  { id: 'holy_trinity_crest', name: 'Trinidad 3 Anillos', desc: 'Padre, Hijo, Espíritu' },
                  { id: 'trinity_cross', name: 'Cruz 3-en-1', desc: 'Fe en Movimiento' },
                  { id: 'spirit_flame', name: 'Llama Espíritu', desc: 'Fuego Santo' },
                  { id: 'fsgod_gold_crest', name: 'Cresta 3 Estrellas', desc: 'Escudo Dorado' },
                  { id: 'fsgod_apex', name: 'FsGoD Monograma', desc: 'Sello FsGoD Oficial' },
                  { id: 'titanium_wing', name: 'Titanium Wing', desc: 'Heráldica de Élite' },
                ].map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => updateDesign({ frontLogoType: badge.id as any })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      design.frontLogoType === badge.id
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{badge.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</p>
                  </button>
                ))}
              </div>

              {/* Sponsor text */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300">Logo de Patrocinador Central (Opcional)</label>
                <input
                  type="text"
                  value={design.sponsorText}
                  onChange={e => updateDesign({ sponsorText: e.target.value.toUpperCase() })}
                  placeholder="CYBER CORE / NOMBRE SPONSOR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: TEAM ROSTER & SIZES TABLE */}
          {activeToolTab === 'roster' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    Plantilla del Club / Lista de Jugadores
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Añade los nombres, números y tallas de cada integrante de tu equipo.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-mono text-xs font-bold">
                  {roster.length} Jugadores
                </span>
              </div>

              {/* Add player form */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300">Agregar Nuevo Atleta</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="APELLIDO"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={newPlayerNumber}
                    onChange={e => setNewPlayerNumber(e.target.value)}
                    placeholder="NÚMERO"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                  />
                  <select
                    value={newPlayerSize}
                    onChange={e => setNewPlayerSize(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
                      <option key={s} value={s}>Talla {s}</option>
                    ))}
                  </select>
                  <button
                    onClick={addPlayerToRoster}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center space-x-1 hover:bg-amber-300 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Roster table */}
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {roster.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 font-mono">
                        {player.number}
                      </span>
                      <div>
                        <p className="font-bold text-white">{player.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Talla: {player.size}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => removePlayerFromRoster(player.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AI ATHLETIC DESIGNER */}
          {activeToolTab === 'ai' && (
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-cyan-500/30 space-y-6">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Asistente de Diseño Creativo IA</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Generador de Identidad Deportiva con Gemini
              </h3>
              <p className="text-xs text-slate-400">
                Ingresa los datos de tu club o marca personal y deja que la IA genere una paleta exclusiva, lema de combate y patrones visuales.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nombre del Club / Proyecto</label>
                  <input
                    type="text"
                    value={aiTeamName}
                    onChange={e => setAiTeamName(e.target.value)}
                    placeholder="Ej: Valkyries Athletics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Disciplina Deportiva</label>
                    <select
                      value={aiSport}
                      onChange={e => setAiSport(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                    >
                      <option value="soccer">Fútbol / Club</option>
                      <option value="running">Running / Maratón</option>
                      <option value="crossfit">CrossFit / Gimnasio</option>
                      <option value="basketball">Baloncesto</option>
                      <option value="tennis_padel">Pádel / Tenis</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Estilo / Vibe</label>
                    <input
                      type="text"
                      value={aiVibe}
                      onChange={e => setAiVibe(e.target.value)}
                      placeholder="Cyberpunk, agresivo, elegante"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateAiConcept}
                  disabled={isGeneratingAi}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <span className="animate-spin">⚙️</span>
                      <span>Generando concepto con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Concepto Completo</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Result Card */}
              {aiConceptResult && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/40 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 font-mono uppercase">
                      Propuesta Generada
                    </span>
                    <button
                      onClick={() => applyAiConcept(aiConceptResult)}
                      className="px-3 py-1 rounded-xl bg-cyan-400 text-slate-950 text-[11px] font-black hover:bg-cyan-300 transition-all flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Aplicar al Diseño</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{aiConceptResult.conceptStory}"
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Lema: <strong className="text-white">{aiConceptResult.motto}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">Paleta sugerida:</span>
                    <span className="w-5 h-5 rounded-full border border-slate-700" style={{ backgroundColor: aiConceptResult.recommendedColors?.primary }} />
                    <span className="w-5 h-5 rounded-full border border-slate-700" style={{ backgroundColor: aiConceptResult.recommendedColors?.secondary }} />
                    <span className="w-5 h-5 rounded-full border border-slate-700" style={{ backgroundColor: aiConceptResult.recommendedColors?.accent }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDER & PRICING FOOTER SUMMARY */}
          <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-neutral-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                  Total Prenda Personalizada ({effectiveQty} {effectiveQty === 1 ? 'unidad' : 'unidades'})
                </span>
                <div className="flex items-baseline space-x-3 mt-0.5">
                  <span className="text-3xl font-black text-white">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {discountRate > 0 && (
                    <span className="text-sm line-through text-neutral-500">
                      ${rawSubtotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {discountRate > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {(discountRate * 100)}% Descuento por Volumen
                </div>
              )}
            </div>

            {/* Transparent Cost Breakdown Table */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                <span>Desglose de Confección</span>
                <span className="text-[#FF5722]">Tarifa +40% Aplicada</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Precio Base Prenda:</span>
                <span>${baseGarmentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#FF5722] font-bold">
                <span>Margen Custom Studio (+40%):</span>
                <span>+${customFee40Percent.toFixed(2)}</span>
              </div>
              {design.finishType === 'sublimation_4k' && (
                <div className="flex justify-between text-cyan-300">
                  <span>Sublimación 4K Total:</span>
                  <span>+$6.00</span>
                </div>
              )}
              {design.finishType === 'hybrid_metallic' && (
                <div className="flex justify-between text-cyan-300">
                  <span>Acabado Metálico Holográfico:</span>
                  <span>+$9.00</span>
                </div>
              )}
              {design.productionTier === 'express_72h' && (
                <div className="flex justify-between text-amber-400">
                  <span>Taller Express 72 Horas:</span>
                  <span>+$12.00</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold pt-1 border-t border-neutral-800">
                <span>Precio Unitario Final:</span>
                <span>${unitPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Option toggles: Finish type & Production tier */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 font-bold">Tipo de Estampado</label>
                <select
                  value={design.finishType}
                  onChange={e => updateDesign({ finishType: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-bold focus:border-[#FF5722] outline-none"
                >
                  <option value="sublimation_4k">Sublimación 4K Total (+ $6)</option>
                  <option value="heat_transfer_vinyl">Vinilo Termosellado Mate</option>
                  <option value="hybrid_metallic">Acabado Metálico Holográfico (+ $9)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-bold">Tiempo de Taller</label>
                <select
                  value={design.productionTier}
                  onChange={e => updateDesign({ productionTier: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-bold focus:border-[#FF5722] outline-none"
                >
                  <option value="standard">Estándar (7 días hábiles)</option>
                  <option value="express_72h">Express Pro (72 Horas) (+ $12)</option>
                </select>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={() => onAddToCart(design, unitPrice, effectiveQty)}
              className="w-full py-4 rounded-2xl bg-[#FF5722] hover:bg-[#ff6f43] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF5722]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Añadir al Carrito de Confección</span>
            </button>
          </div>

        </div>

      </div>

      {/* TECH PACK MODAL */}
      {techPackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">
                  FICHA TÉCNICA INDUSTRIAL (TECH PACK) • {techPackModal.techPackId}
                </h3>
              </div>
              <button
                onClick={() => setTechPackModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <p className="text-amber-400 font-bold">PRENDA: {techPackModal.garment.name}</p>
                <p className="text-slate-300">Tejido: {techPackModal.garment.fabricBlend}</p>
                <p className="text-slate-300">Construcción Cuello: {techPackModal.garment.collarConstruction}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold mb-1">MAPA DE PANTONES Y PIGMENTOS:</p>
                <div className="grid grid-cols-2 gap-2">
                  {techPackModal.colorPalettePantone.map((col: any, i: number) => (
                    <div key={i} className="flex items-center space-x-2 p-2 bg-slate-950 rounded-lg">
                      <span className="w-4 h-4 rounded border border-slate-700" style={{ backgroundColor: col.hex }} />
                      <span className="text-slate-300">{col.role}: <strong>{col.hex}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-bold mb-1">COTAS DE ESTAMPADO:</p>
                <div className="space-y-1.5">
                  {techPackModal.printPlacements.map((plc: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-950 rounded-lg flex justify-between">
                      <span className="text-cyan-400 font-bold">{plc.zone}</span>
                      <span className="text-slate-300">{plc.dimensions} • {plc.technique}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-bold mb-1">ESTÁNDARES DE CALIDAD:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {techPackModal.qualityStandards.map((std: string, i: number) => (
                    <li key={i}>{std}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setTechPackModal(null)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
            >
              Cerrar Ficha Técnica
            </button>
          </div>
        </div>
      )}

      {/* Share Modal for Customizer Design */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={selectedProduct}
        customDesign={design}
      />

    </div>
  );
};
