import React, { useState, useEffect } from 'react';
import { ProductItem, CustomDesignConfig } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { StreetPalette, STREET_PALETTES } from './types/theme';
import { Header } from './components/Header';
import { CatalogView } from './components/CatalogView';
import { CustomizerStudio } from './components/CustomizerStudio';
import { TeamKitBuilder } from './components/TeamKitBuilder';
import { OrderTrackerView } from './components/OrderTrackerView';
import { AdminProductionPanel } from './components/AdminProductionPanel';
import { CartCheckoutModal, CartItem } from './components/CartCheckoutModal';
import { ReferralModal } from './components/ReferralModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Footer } from './components/Footer';
import { audioEngine } from './utils/audioEngine';
import { MasterCatalogExplorer } from './components/MasterCatalogExplorer';
import { WhatsAppOrderGenerator, OrderLineItem } from './components/WhatsAppOrderGenerator';
import { FsGodAssistantDrawer } from './components/FsGodAssistantDrawer';
import { MasterCatalogProduct } from './data/masterCatalog';
import { Bot, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'master_catalog' | 'whatsapp_order' | 'customizer' | 'team_kits' | 'tracker' | 'admin'>('master_catalog');
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(INITIAL_PRODUCTS[0]);
  const [currentPalette, setCurrentPalette] = useState<StreetPalette>(STREET_PALETTES[0]);

  // Assistant & WhatsApp order integration state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantSkuQuery, setAssistantSkuQuery] = useState<string | undefined>(undefined);
  const [whatsappOrderItems, setWhatsappOrderItems] = useState<OrderLineItem[]>([]);

  // Global click event to initialize audio on first user click anywhere
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      if (!audioEngine.getIsPlaying()) {
        audioEngine.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  // Synchronize soundtrack automatically when changing tabs (if auto-switch enabled)
  useEffect(() => {
    if (audioEngine.getAutoSwitchBySection()) {
      if (activeTab === 'catalog') {
        audioEngine.switchSectionSoundtrack('catalog');
      } else if (activeTab === 'customizer') {
        audioEngine.switchSectionSoundtrack('customizer');
      } else if (activeTab === 'team_kits') {
        audioEngine.switchSectionSoundtrack('team_kits');
      } else if (activeTab === 'tracker' || activeTab === 'admin') {
        audioEngine.switchSectionSoundtrack('tracker');
      }
    }
  }, [activeTab]);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart_item_sample_1',
      productId: 'prod_jersey_apex',
      productName: 'FsGoD Apex Pro-Dry Jersey',
      unitPrice: 54.00, // with 4K sublimation
      quantity: 1,
      design: {
        productId: 'prod_jersey_apex',
        productName: 'FsGoD Apex Pro-Dry Jersey',
        productCategory: 'jerseys',
        viewAngle: 'front',
        baseColor: '#0f172a',
        secondaryColor: '#00f0ff',
        accentColor: '#f59e0b',
        collarColor: '#00f0ff',
        stitchingColor: '#00f0ff',
        pattern: 'carbon_hex',
        fabricType: 'fs_dry_pro',
        collarStyle: 'v_neck',
        frontText: 'TITANES FC',
        frontNumber: '10',
        frontLogoType: 'titanium_wing',
        sponsorText: 'CYBER CORE',
        backPlayerName: 'MENDOZA',
        backPlayerNumber: '10',
        backMotto: 'NEVER SURRENDER',
        leftSleeveText: 'FsGoD APEX',
        rightSleeveBadge: 'pro_division',
        fontFamily: 'Impact Athletic',
        textColor: '#ffffff',
        textOutlineColor: '#00f0ff',
        hasTextOutline: true,
        selectedSize: 'L',
        quantity: 1,
        finishType: 'sublimation_4k',
        productionTier: 'standard',
      },
    },
  ]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [pendingCouponCode, setPendingCouponCode] = useState<string | undefined>(undefined);
  const [activeTrackerCode, setActiveTrackerCode] = useState<string>('FsGoD-CUSTOM-8921');

  // Handle opening customizer for a specific product
  const handleOpenCustomizerForProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setActiveTab('customizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add customized item to cart
  const handleAddToCart = (design: CustomDesignConfig, unitPrice: number, quantity: number) => {
    const newItem: CartItem = {
      id: `cart_${Date.now()}`,
      productId: design.productId,
      productName: design.productName,
      design,
      unitPrice,
      quantity,
    };
    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(it => it.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = (orderNumber: string) => {
    setActiveTrackerCode(orderNumber);
    setActiveTab('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyCouponInCart = (couponCode: string) => {
    setPendingCouponCode(couponCode);
    setIsReferralOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div 
      className="min-h-screen font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between transition-colors duration-700 relative overflow-x-hidden"
      style={{
        backgroundColor: currentPalette.bodyBg,
        color: currentPalette.textColor,
        backgroundImage: currentPalette.gradientHero,
      }}
    >
      {/* Dynamic Ambient Glow Layers */}
      <div 
        className="fixed top-0 left-1/4 w-[600px] h-[300px] rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-1000 -z-0"
        style={{ backgroundColor: currentPalette.secondary30 }}
      />
      <div 
        className="fixed bottom-0 right-1/4 w-[500px] h-[300px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-colors duration-1000 -z-0"
        style={{ backgroundColor: currentPalette.accent10 }}
      />

      <div className="relative z-10">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenTracker={() => {
            setActiveTab('tracker');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenReferral={() => setIsReferralOpen(true)}
          onOpenAssistant={() => {
            setAssistantSkuQuery(undefined);
            setIsAssistantOpen(true);
          }}
          currentPalette={currentPalette}
          onSelectPalette={setCurrentPalette}
        />

        {/* View Router */}
        <main className="transition-all duration-300 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'master_catalog' && (
            <MasterCatalogExplorer
              onOpenAssistantForSku={(sku) => {
                setAssistantSkuQuery(sku);
                setIsAssistantOpen(true);
              }}
              onSelectProductForWhatsApp={(product) => {
                setWhatsappOrderItems([
                  {
                    product,
                    selectedSize: 'L',
                    quantity: 1,
                  },
                ]);
                setActiveTab('whatsapp_order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'whatsapp_order' && (
            <WhatsAppOrderGenerator
              initialItems={whatsappOrderItems}
              onClose={() => setActiveTab('master_catalog')}
              onOpenAssistantForSku={(sku) => {
                setAssistantSkuQuery(sku);
                setIsAssistantOpen(true);
              }}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogView
              products={products}
              onOpenCustomizerForProduct={handleOpenCustomizerForProduct}
              onOpenReferralModal={() => setIsReferralOpen(true)}
              onOpenCart={() => setIsCartOpen(true)}
              onApplyCouponToCart={handleApplyCouponInCart}
              currentPalette={currentPalette}
              onSelectPalette={setCurrentPalette}
            />
          )}

          {activeTab === 'customizer' && (
            <CustomizerStudio
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          )}

          {activeTab === 'team_kits' && (
            <TeamKitBuilder
              products={products}
              onStartCustomizingKit={handleOpenCustomizerForProduct}
            />
          )}

          {activeTab === 'tracker' && (
            <OrderTrackerView
              initialOrderNumber={activeTrackerCode}
              onOpenCustomizer={() => setActiveTab('customizer')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminProductionPanel />
          )}
        </main>
      </div>

      {/* Cart & Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
        initialCouponCode={pendingCouponCode}
      />

      {/* Referral & Ambassador Modal */}
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onApplyCouponInCart={handleApplyCouponInCart}
      />

      {/* Valeria FsGoD AI Assistant Drawer (Barranquilla Voice) */}
      <FsGodAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantSkuQuery(undefined);
        }}
        initialSkuQuery={assistantSkuQuery}
        onSelectProductForOrder={(product) => {
          setWhatsappOrderItems([
            {
              product,
              selectedSize: 'L',
              quantity: 1,
            },
          ]);
          setActiveTab('whatsapp_order');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Action Button for Valeria AI Assistant */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2">
        <button
          onClick={() => {
            setAssistantSkuQuery(undefined);
            setIsAssistantOpen(true);
          }}
          className="group flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 font-black text-sm shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-amber-300"
          id="btn-valeria-floating"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center font-black">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1">
              <span className="tracking-tight leading-none text-zinc-950 font-extrabold">Valeria FsGoD</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-950 text-amber-300 rounded font-mono font-bold">
                IA 40%
              </span>
            </div>
            <p className="text-[10px] text-zinc-800 font-bold leading-none mt-0.5">
              Voz Barranquillera • Cotizaciones
            </p>
          </div>
        </button>
      </div>

      {/* Global Footer */}
      <Footer 
        onNavigate={setActiveTab} 
        onOpenReferral={() => setIsReferralOpen(true)}
        currentPalette={currentPalette}
      />

      {/* Ambient Background Music Player (Tuned very low) */}
      <BackgroundMusicPlayer />

    </div>
  );
}

export default App;
