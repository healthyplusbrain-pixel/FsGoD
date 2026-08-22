import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Share2, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Check, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Heart,
  ZoomIn,
  Download
} from 'lucide-react';
import { ProductItem } from '../types';
import { ASSET_IMAGES, ARTWORK_PRESETS } from '../assets/images';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  onOpenCustomizerForProduct: (product: ProductItem) => void;
  onOpenShareModal: (product: ProductItem) => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  product,
  onOpenCustomizerForProduct,
  onOpenShareModal,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !product) return null;

  // Build the list of high-res images for this product
  const allImages = [
    product.featuredImage,
    ...(product.galleryImages || []),
  ].filter((img, idx, self) => self.indexOf(img) === idx);

  const currentImage = allImages[activeImageIndex] || product.featuredImage;

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    setIsZoomed(false);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setIsZoomed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0a0e17] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
          title="Cerrar galería"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT / TOP: High-Res Image Viewport (60% width) */}
        <div className="relative lg:w-3/5 bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 select-none min-h-[340px] sm:min-h-[460px]">
          
          {/* Main Visualizer Image with Zoom */}
          <div 
            onClick={() => setIsZoomed(!isZoomed)}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl cursor-zoom-in transition-all duration-300 ${
              isZoomed ? 'scale-125 cursor-zoom-out' : ''
            }`}
          >
            <img
              src={currentImage}
              alt={`${product.name} - Vista ${activeImageIndex + 1}`}
              referrerPolicy="no-referrer"
              className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
            />
          </div>

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
              CALIDAD 4K SUBLIMACIÓN
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
              Foto {activeImageIndex + 1} de {allImages.length}
            </span>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 left-4 hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 text-[10px] text-slate-400 font-mono border border-slate-800">
            <ZoomIn className="w-3 h-3 text-amber-400" />
            <span>Haz clic para hacer zoom</span>
          </div>

          {/* Carousel Arrow Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition-all shadow-xl cursor-pointer"
                title="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition-all shadow-xl cursor-pointer"
                title="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          <div className="flex items-center justify-center space-x-2.5 mt-4 overflow-x-auto max-w-full pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImageIndex(idx);
                  setIsZoomed(false);
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-amber-400 shadow-md shadow-amber-400/30 scale-105'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

        </div>

        {/* RIGHT: Product Specs, Brand Manifesto & Direct Action Controls */}
        <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          <div className="space-y-4">
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30 uppercase">
                {product.category}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 font-bold">
                REF: {product.referenceCode || product.id}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Fabric Technology Highlights */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Especificaciones de Confección:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.fabricTech.map((tech, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center space-x-2"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors and Sizes Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">Colores Disponibles:</span>
                <div className="flex items-center space-x-1.5">
                  {product.availableColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-slate-400 text-[10px]">Tallas:</span>
                <p className="text-white font-bold">{product.availableSizes.join(' · ')}</p>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-3.5 rounded-2xl bg-[#0a192f] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Precio Base Atelier FsGoD • Pomelli:</span>
                <span className="text-2xl font-black text-amber-400">${product.basePrice.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold block">
                  5% OFF con Referido
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ${(product.basePrice * 0.95).toFixed(2)} con bono
                </span>
              </div>
            </div>

          </div>

          {/* Action CTAs: Customize in 3D & Share Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenCustomizerForProduct(product);
              }}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalizar en Estudio 3D</span>
            </button>

            <button
              onClick={() => {
                onOpenShareModal(product);
              }}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Compartir Prenda & Ganar 5%</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
