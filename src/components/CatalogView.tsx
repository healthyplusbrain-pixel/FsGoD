import React, { useState, useEffect } from 'react';
import { ProductItem, ProductCategory, SportCategory } from '../types';
import { 
  Sparkles, 
  Filter, 
  Search, 
  Star, 
  ShieldCheck, 
  SlidersHorizontal, 
  Flame, 
  ArrowRight,
  Zap,
  Heart,
  Share2,
  Gift,
  Copy,
  Check,
  Tag,
  DollarSign,
  TrendingDown,
  Users,
  CheckCircle2,
  Eye,
  Maximize2,
  Layers,
  MessageCircle,
  Send
} from 'lucide-react';
import { 
  getLikedProductIds, 
  toggleProductLike, 
  getProductLikesCount, 
  executeShare, 
  detectIncomingReferral,
  getUserReferralCode,
  buildReferralLink
} from '../utils/referralEngine';
import { ReferralModal } from './ReferralModal';
import { ShareModal } from './ShareModal';
import { ImageGalleryModal } from './ImageGalleryModal';
import { PricingMarginMatrix } from './PricingMarginMatrix';
import { AvatarVideoShowcase } from './AvatarVideoShowcase';
import { StreetLootSlotMachine, StreetPalette, STREET_PALETTES } from './StreetLootSlotMachine';
import { ReferralWelcomeSection } from './ReferralWelcomeSection';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';
import { ARTWORK_PRESETS, ASSET_IMAGES } from '../assets/images';
import { audioEngine } from '../utils/audioEngine';

interface CatalogViewProps {
  products: ProductItem[];
  onOpenCustomizerForProduct: (product: ProductItem) => void;
  onOpenReferralModal?: () => void;
  onOpenCart?: () => void;
  onApplyCouponToCart?: (couponCode: string) => void;
  currentPalette?: StreetPalette;
  onSelectPalette?: (palette: StreetPalette) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onOpenCustomizerForProduct,
  onOpenReferralModal,
  onOpenCart,
  onApplyCouponToCart,
  currentPalette = STREET_PALETTES[0],
  onSelectPalette,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'pricing_matrix'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<SportCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Likes state
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});

  // Modals state
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [shareModalProduct, setShareModalProduct] = useState<ProductItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [galleryModalProduct, setGalleryModalProduct] = useState<ProductItem | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incomingReferral, setIncomingReferral] = useState<{ referrerCode: string | null; isNew: boolean }>({ referrerCode: null, isNew: false });
  const [copiedGlobalRef, setCopiedGlobalRef] = useState(false);

  // Initialize Likes & Incoming Referral detection
  useEffect(() => {
    setLikedIds(getLikedProductIds());
    
    // Build initial likes counts map
    const initialMap: Record<string, number> = {};
    products.forEach(p => {
      initialMap[p.id] = getProductLikesCount(p.id, p.likesCount || 100);
    });
    setLikesMap(initialMap);

    // Detect if visitor came from a referral link
    const refData = detectIncomingReferral();
    if (refData.referrerCode) {
      setIncomingReferral({ referrerCode: refData.referrerCode, isNew: refData.isNewReferral });
    }
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Like Toggle
  const handleLikeToggle = (e: React.MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    const currentBase = product.likesCount || 100;
    const { isLiked, newCount } = toggleProductLike(product.id, currentBase);
    
    setLikedIds(prev => {
      const next = new Set(prev);
      if (isLiked) next.add(product.id);
      else next.delete(product.id);
      return next;
    });

    setLikesMap(prev => ({
      ...prev,
      [product.id]: newCount,
    }));

    showToast(isLiked ? `¡Te gusta ${product.name}! ❤️` : `Eliminado de tus favoritos`);
  };

  // Open dedicated Share Modal
  const handleOpenShareDialog = (e: React.MouseEvent, product?: ProductItem) => {
    e.stopPropagation();
    setShareModalProduct(product || null);
    setIsShareModalOpen(true);
  };

  // Open Image Gallery Modal
  const handleOpenGallery = (e: React.MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    setGalleryModalProduct(product);
    setIsGalleryModalOpen(true);
  };

  const handleCopyGlobalLink = async () => {
    const link = buildReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopiedGlobalRef(true);
      showToast('¡Enlace de referido copiado! Compártelo para ganar 5% de descuento en tu próxima compra.');
      setTimeout(() => setCopiedGlobalRef(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSport = selectedSport === 'all' || p.sport === selectedSport;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.referenceCode && p.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSport && matchesSearch;
  });

  const myReferralCode = getUserReferralCode();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a192f] border border-amber-400/80 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-mono animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Incoming Referral Banner (if visitor came from a referral link) */}
      {incomingReferral.referrerCode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#0a192f] to-amber-500/20 border border-amber-400/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center flex-shrink-0">
              5%
            </div>
            <div>
              <p className="font-bold text-white font-mono">
                ¡Has sido invitado por el Atleta <span className="text-amber-400 underline">{incomingReferral.referrerCode}</span>!
              </p>
              <p className="text-slate-300 text-[11px]">
                Tu <strong>5% de descuento por referido</strong> se aplicará automáticamente en tu pedido.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              DESCUENTO ACTIVADO
            </span>
          </div>
        </div>
      )}

      {/* Hero Showcase Banner with Neuromarketing & Trinity Brand Manifesto */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a0e17] via-[#0a192f] to-[#0a0e17] border border-amber-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wider">
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>FsGoD • DIOS POR DELANTE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            DIOS POR DELANTE. <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
              FE EN MOVIMIENTO.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            FsGoD nace para romper los límites de la mente y encender el espíritu del atleta con indumentaria personalizada de máximo rendimiento. Llevamos a Dios en cada fibra: honrando al <strong className="text-amber-300">Padre</strong> en la creación y propósito, al <strong className="text-amber-300">Hijo</strong> en la disciplina y sacrificio, y al <strong className="text-amber-300">Espíritu Santo</strong> en el fuego y rendimiento físico inquebrantable.
          </p>

          {/* Neuromarketing Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#0a0e17]/80 border border-slate-800 hover:border-amber-400/40 transition-colors space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Pilar 01 • Creación</span>
              <h4 className="text-sm font-black text-white">El Padre</h4>
              <p className="text-xs text-slate-400">Propósito supremo y convicción que vence cualquier fatiga mental.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0e17]/80 border border-slate-800 hover:border-amber-400/40 transition-colors space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Pilar 02 • Sacrificio</span>
              <h4 className="text-sm font-black text-white">El Hijo</h4>
              <p className="text-xs text-slate-400">Resiliencia y disciplina inquebrantable en cada repetición y kilómetro.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0e17]/80 border border-slate-800 hover:border-amber-400/40 transition-colors space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Pilar 03 • Rendimiento</span>
              <h4 className="text-sm font-black text-white">El Espíritu Santo</h4>
              <p className="text-xs text-slate-400">Fuego interior y potencia biomecánica para conquistar metas imposibles.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenCustomizerForProduct(products[0])}
              className="px-7 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-400/25 transition-all flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalizar Mi Prenda en 3D</span>
            </button>

            <button
              onClick={() => setIsReferralModalOpen(true)}
              className="px-6 py-4 rounded-2xl bg-[#0a192f] hover:bg-[#0f2744] border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Programa de Referidos (Gana 5%)</span>
            </button>

            <div className="flex items-center space-x-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center text-slate-300">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-400" /> Sublimación Digital 4K
              </span>
              <span className="flex items-center text-slate-300">
                <Zap className="w-4 h-4 mr-1.5 text-cyan-400" /> Validación Manual de Pago
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FSGOD 90s Streetwear Lookbook & 3D Avatar Video Showcase */}
      <AvatarVideoShowcase 
        onCustomizeClick={() => onOpenCustomizerForProduct(products[0])}
        onBuyNowClick={() => {
          if (onOpenCart) {
            onOpenCart();
          } else {
            onOpenCustomizerForProduct(products[0]);
          }
        }}
      />

      {/* Dynamic Casino Slot Machine & 60-30-10 Chromatic Engine */}
      <StreetLootSlotMachine
        products={products}
        onOpenCustomizerForProduct={onOpenCustomizerForProduct}
        onApplyCouponToCart={onApplyCouponToCart}
        currentPalette={currentPalette}
        onSelectPalette={onSelectPalette}
      />

      {/* FE5-REFERRAL-WELCOME: Official Referral Welcome Landing Section */}
      <ReferralWelcomeSection
        onOpenCustomizer={() => onOpenCustomizerForProduct(products[0])}
        onApplyCouponToCart={onApplyCouponToCart}
        onOpenSlotMachine={() => {
          const slotEl = document.getElementById('street-loot-slot-machine');
          if (slotEl) {
            slotEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        currentPalette={currentPalette}
      />

      {/* Section Soundtrack Bar: FsGoD • Dios Por Delante */}
      <SectionSoundtrackBanner sectionKey="catalog" />

      {/* Featured Signature Streetwear Drops Carousel / Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-[#FF5722] font-mono text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-[#FF5722] animate-pulse" />
              <span>Nuevas Imágenes & Drops Exclusivos 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Colección Sublimada 4K & Streetwear Heritage
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400 font-mono">
              Haz clic en cualquier imagen para ver en alta resolución o compartir
            </span>
          </div>
        </div>

        {/* Top 3 Exclusive Signature Drops with High-Res Gallery Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.slice(0, 3).map((drop) => {
            const isLiked = likedIds.has(drop.id);
            const count = likesMap[drop.id] ?? drop.likesCount ?? 100;
            const refCode = drop.referenceCode || drop.cjVariantSku || `FSG-${drop.id.slice(5, 12).toUpperCase()}`;
            const purchaseCost = drop.wholesaleCost || +(drop.basePrice * 0.38).toFixed(2);
            const retailPrice = drop.basePrice;
            const customMargin = +(retailPrice * 0.40).toFixed(2);
            const finalCustomPrice = +(retailPrice + customMargin).toFixed(2);

            return (
              <div
                key={drop.id}
                className="group relative rounded-3xl bg-[#1E1E1E] border border-neutral-800 hover:border-[#FF5722]/60 p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-[#FF5722]/10"
              >
                {/* Image Stage */}
                <div 
                  onClick={(e) => handleOpenGallery(e, drop)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 mb-4 cursor-pointer group/img"
                >
                  <img
                    src={drop.featuredImage}
                    alt={drop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  
                  <div className="absolute top-3 left-3 bg-[#FF5722] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-md">
                    DROP EXCLUSIVO 2026
                  </div>

                  {/* Top Right Action Overlay (Like + Share + Zoom Gallery) */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                    {/* Gallery Zoom Button */}
                    <button
                      onClick={(e) => handleOpenGallery(e, drop)}
                      className="p-2 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-[#FF5722] transition-colors shadow-md cursor-pointer"
                      title="Ver galería en alta resolución"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleOpenShareDialog(e, drop)}
                      className="p-2 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-colors shadow-md cursor-pointer"
                      title="Compartir prenda y ganar 5% de descuento"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Like Button */}
                    <button
                      onClick={(e) => handleLikeToggle(e, drop)}
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-md flex items-center space-x-1 cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-950/90 border-rose-500 text-rose-400 shadow-rose-500/20' 
                          : 'bg-neutral-950/85 border-neutral-700 text-neutral-300 hover:text-rose-400 hover:border-rose-400'
                      }`}
                      title={isLiked ? 'Quitar de favoritos' : 'Me gusta'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''} transition-transform`} />
                      <span className="text-[10px] font-mono font-bold">{count}</span>
                    </button>
                  </div>

                  {/* 3D Studio Pill */}
                  <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-cyan-300 text-[10px] font-mono font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Avatar 3D Ready
                  </div>

                  {/* Hover Quick Look Hint */}
                  <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 rounded-xl bg-[#FF5722] text-white font-black text-xs shadow-lg flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Ver Fotos HD
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-cyan-300 font-bold">
                      REF: {refCode}
                    </span>
                    <span className="text-amber-400 font-bold">★ {drop.rating}</span>
                  </div>

                  <h3 
                    onClick={() => onOpenCustomizerForProduct(drop)}
                    className="text-base font-bold text-white group-hover:text-[#FF5722] transition-colors line-clamp-1 cursor-pointer"
                  >
                    {drop.name}
                  </h3>
                  
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {drop.subtitle}
                  </p>

                  {/* Dynamic Pricing Table Matrix (Purchase, Retail, Custom Margin, Final Price) */}
                  <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono space-y-1.5">
                    <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-800 pb-1 flex justify-between">
                      <span>Estructura de Precios</span>
                      <span className="text-amber-400">Margen +40%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-neutral-300">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Coste Taller:</span>
                        <span className="font-bold text-neutral-200">${purchaseCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">PVP Tienda:</span>
                        <span className="font-bold text-white">${retailPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Margen Custom:</span>
                        <span className="font-bold text-[#FF5722]">+${customMargin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400 font-bold">Total Custom:</span>
                        <span className="font-black text-amber-300">${finalCustomPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: 3D Avatar Preview & Customize */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => onOpenCustomizerForProduct(drop)}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      title="Ver y probar en Avatar 3D interactivo"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Avatar 3D</span>
                    </button>

                    <button 
                      onClick={() => onOpenCustomizerForProduct(drop)}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#FF5722]/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Customizar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Showcase: Nuevas Ilustraciones & Diseños Sublimados 4K */}
        <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                ESTAMPADOS & ILUSTRACIONES DISPONIBLES EN EL ESTUDIO
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Catálogo de Diseños Sublimados Oficiales FsGoD
              </h3>
            </div>
            <button
              onClick={() => handleOpenShareDialog({} as any)}
              className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-mono font-bold transition-all border border-cyan-500/40 flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir Galería Completa</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {ARTWORK_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="group relative rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 p-2.5 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find matching product if any or first product
                        const match = products.find(p => p.id === 'prod_jersey_football_heritage' || p.id === 'prod_hoodie_blue_flame') || products[0];
                        handleOpenGallery(e, match);
                      }}
                      className="p-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-md"
                      title="Ver en grande"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-amber-300">
                    {preset.name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono line-clamp-1">
                    {preset.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & View Mode Switcher Bar */}
      <div className="space-y-4">
        {/* View Mode Selector Tabs */}
        <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                audioEngine.playClickSound();
                setViewMode('grid');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Galería Visual Streetwear</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playCashChimeSound();
                setViewMode('pricing_matrix');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                viewMode === 'pricing_matrix'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                  : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Tabla de Precios & Márgenes Dinámicos (40% Margen)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block pr-3">
            {products.length} Referencias FsGoD 2026
          </span>
        </div>

        {viewMode === 'grid' && (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Sport Filter Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
                {[
                  { id: 'all', label: 'Todos los Deportes' },
                  { id: 'soccer', label: 'Fútbol / Soccer' },
                  { id: 'running', label: 'Running / Maratón' },
                  { id: 'crossfit', label: 'CrossFit / Gym' },
                  { id: 'tennis_padel', label: 'Pádel / Tenis' },
                  { id: 'training', label: 'Entrenamiento' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSport(s.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSport === s.id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-[#0a192f] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por REF, prenda o tela..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a192f] border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
              {[
                { id: 'all', label: 'Ver Todo' },
                { id: 'jerseys', label: 'Camisetas & Polos' },
                { id: 'hoodies', label: 'Sudaderas & Hoodies' },
                { id: 'shorts', label: 'Shorts & Mallas' },
                { id: 'tracksuits', label: 'Conjuntos Chándal' },
                { id: 'jackets', label: 'Chaquetas & Rompevientos' },
                { id: 'compression', label: 'Prendas de Compresión' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RENDER VIEW: PRICING MARGIN MATRIX TABLE */}
      {viewMode === 'pricing_matrix' && (
        <PricingMarginMatrix
          products={products}
          onOpenCustomizerForProduct={onOpenCustomizerForProduct}
        />
      )}

      {/* RENDER VIEW: MAIN PRODUCTS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const isLiked = likedIds.has(product.id);
          const count = likesMap[product.id] ?? product.likesCount ?? 100;
          const refCode = product.referenceCode || product.cjVariantSku || `REF-${product.id.slice(5, 12).toUpperCase()}`;
          const purchaseCost = product.wholesaleCost || product.cjBaseCost || +(product.basePrice * 0.38).toFixed(2);
          const retailPrice = product.basePrice;
          const customMargin = +(retailPrice * 0.40).toFixed(2);
          const finalCustomPrice = +(retailPrice + customMargin).toFixed(2);
          const msrp = product.suggestedRetailPrice || +(product.basePrice * 1.5).toFixed(2);

          return (
            <div
              key={product.id}
              className="group rounded-3xl bg-[#1E1E1E] border border-neutral-800 hover:border-[#FF5722]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#FF5722]/10"
            >
              {/* Product Image Stage */}
              <div 
                onClick={(e) => handleOpenGallery(e, product)}
                className="relative aspect-[4/3] bg-neutral-950 overflow-hidden cursor-pointer group/img"
              >
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Left Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {product.isNewRelease && (
                    <span className="px-2 py-0.5 rounded-md bg-[#FF5722] text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                      NEW 2026
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                      BEST SELLER
                    </span>
                  )}
                </div>

                {/* Top Right Actions (Gallery Zoom + Like + Share) */}
                <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20">
                  {/* Gallery Zoom button */}
                  <button
                    onClick={(e) => handleOpenGallery(e, product)}
                    className="p-2 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-neutral-300 hover:text-white hover:border-[#FF5722] transition-colors shadow-md cursor-pointer"
                    title="Ver fotos en alta resolución"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Share button */}
                  <button
                    onClick={(e) => handleOpenShareDialog(e, product)}
                    className="p-2 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-colors shadow-md cursor-pointer"
                    title="Compartir prenda y ganar 5% de descuento"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Like button */}
                  <button
                    onClick={(e) => handleLikeToggle(e, product)}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-md flex items-center space-x-1 cursor-pointer ${
                      isLiked 
                        ? 'bg-rose-950/90 border-rose-500 text-rose-400 shadow-rose-500/20' 
                        : 'bg-neutral-950/85 border-neutral-700 text-neutral-300 hover:text-rose-400 hover:border-rose-400'
                    }`}
                    title={isLiked ? 'Quitar Me Gusta' : 'Me Gusta'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''} transition-transform`} />
                    <span className="text-[10px] font-mono font-bold">{count}</span>
                  </button>
                </div>

                {/* Customizable Pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-neutral-950/85 backdrop-blur-md border border-neutral-700/60 text-[10px] font-mono text-cyan-300 flex items-center space-x-1 pointer-events-none">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Avatar 3D Ready</span>
                </div>

                {/* Hover Hint */}
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-[#FF5722] text-[#FF5722] font-bold text-xs shadow-lg flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Ver Galería HD
                  </span>
                </div>
              </div>

              {/* Product Meta */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-cyan-300 font-bold">
                      {refCode}
                    </span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => onOpenCustomizerForProduct(product)}
                    className="text-base font-bold text-white group-hover:text-[#FF5722] transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {product.subtitle}
                  </p>
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                  <div className="flex items-center space-x-1.5">
                    {product.availableColors.slice(0, 4).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full border border-neutral-700 shadow-sm"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                    {product.availableColors.length > 4 && (
                      <span className="text-[9px] text-neutral-400 font-mono">+{product.availableColors.length - 4}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Tallas: {product.availableSizes.join(', ')}
                  </span>
                </div>

                {/* DYNAMIC PRICING TABLE MATRIX (Purchase, Retail, Custom Margin, Final Price) */}
                <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono space-y-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-800 pb-1 flex justify-between">
                    <span>Tabla de Precios</span>
                    <span className="text-amber-400">+40% Margen</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Coste Taller:</span>
                      <span className="font-bold text-neutral-200">${purchaseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">PVP Tienda:</span>
                      <span className="font-bold text-white">${retailPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Margen Custom:</span>
                      <span className="font-bold text-[#FF5722]">+${customMargin.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400 font-bold">Total Custom:</span>
                      <span className="font-black text-amber-300">${finalCustomPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Share Incentive Callout on Card with direct Social Share trigger */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-[#FF5722]/5 px-2.5 py-1.5 rounded-lg border border-[#FF5722]/20">
                  <span className="flex items-center text-amber-300">
                    <Gift className="w-3 h-3 mr-1 text-amber-400" />
                    5% OFF referido
                  </span>
                  <button
                    onClick={(e) => handleOpenShareDialog(e, product)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Main Action Buttons: 3D Avatar Preview Button + Customizer Studio */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onOpenCustomizerForProduct(product)}
                    className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-300 hover:text-cyan-200 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    title="Ver y probar en Avatar 3D interactivo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Avatar 3D</span>
                  </button>

                  <button
                    onClick={() => onOpenCustomizerForProduct(product)}
                    className="py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#ff6f43] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#FF5722]/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Customizar</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* Referral Rewards Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
      />

      {/* Social Share Modal with WhatsApp, Twitter, Telegram, QR and Link */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={shareModalProduct}
      />

      {/* High Definition Product Image Gallery Lightbox */}
      <ImageGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        product={galleryModalProduct}
        onOpenCustomizerForProduct={onOpenCustomizerForProduct}
        onOpenShareModal={(prod) => {
          setIsGalleryModalOpen(false);
          setShareModalProduct(prod);
          setIsShareModalOpen(true);
        }}
      />

    </div>
  );
};
