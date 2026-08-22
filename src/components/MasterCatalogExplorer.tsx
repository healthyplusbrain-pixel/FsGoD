import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Tag, 
  DollarSign, 
  Calculator, 
  ShoppingBag, 
  Sparkles, 
  Bot, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  MapPin, 
  Eye, 
  Grid, 
  List,
  Shirt,
  ShieldAlert,
  Flame,
  Award,
  Share2,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { 
  MasterCatalogProduct, 
  FSGOD_MASTER_CATALOG, 
  formatCopCurrency, 
  formatUsdCurrency 
} from '../data/masterCatalog';
import { ShareModal } from './ShareModal';
import { audioEngine } from '../utils/audioEngine';

interface MasterCatalogExplorerProps {
  onOpenAssistantForSku: (sku: string) => void;
  onSelectProductForWhatsApp: (product: MasterCatalogProduct) => void;
}

type CategoryFilter = 'all' | 'jerseys' | 'hoodies' | 'jackets' | 'tees' | 'bags' | 'sets';

export function MasterCatalogExplorer({
  onOpenAssistantForSku,
  onSelectProductForWhatsApp,
}: MasterCatalogExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'sku' | 'priceAsc' | 'priceDesc' | 'margin' | 'savings'>('sku');
  const [sharingProduct, setSharingProduct] = useState<MasterCatalogProduct | null>(null);
  const [quickCopiedSku, setQuickCopiedSku] = useState<string | null>(null);

  const handleQuickShare = (e: React.MouseEvent, product: MasterCatalogProduct) => {
    e.stopPropagation();
    audioEngine.playSprayCanSound();
    setSharingProduct(product);
  };


  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return FSGOD_MASTER_CATALOG.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.sku.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.stockLocation.toLowerCase().includes(q) ||
        product.colors.some((c) => c.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return a.retailPriceCop - b.retailPriceCop;
      if (sortBy === 'priceDesc') return b.retailPriceCop - a.retailPriceCop;
      if (sortBy === 'margin') return b.profitCop - a.profitCop;
      if (sortBy === 'savings') return b.customerSavingsCop - a.customerSavingsCop;
      return a.sku.localeCompare(b.sku);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Aggregate Metrics for the Master Catalog
  const totalItemsCount = FSGOD_MASTER_CATALOG.length;
  const totalInventoryStock = FSGOD_MASTER_CATALOG.reduce((sum, p) => sum + p.stockQuantity, 0);
  const averageMarginPercent = 40;
  const averageCustomerSavings = Math.round(
    FSGOD_MASTER_CATALOG.reduce((sum, p) => sum + p.customerSavingsCop, 0) / totalItemsCount
  );

  return (
    <div className="space-y-8" id="master-catalog-explorer">
      {/* Top Banner: Master Catalog & Strict 40% Margin Logic */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                OFICIAL FSGOD MASTER DATABASE
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Margen +40% Obligatorio
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Catálogo Maestro & Matriz de Rentabilidad
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Consulta en tiempo real las 37 referencias verificadas con su SKU oficial, desglose matemático de costo base de compra, precio final de venta al +40% de margen y comparación directa contra los precios de la competencia.
            </p>
          </div>

          {/* Quick Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4">
            <div className="p-2">
              <span className="text-[11px] text-zinc-400 font-medium block">Prendas Oficiales</span>
              <span className="text-xl font-black text-amber-400 font-mono">{totalItemsCount} SKUs</span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-zinc-400 font-medium block">Margen de Venta</span>
              <span className="text-xl font-black text-emerald-400 font-mono">+{averageMarginPercent}%</span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-zinc-400 font-medium block">Stock en Bodega</span>
              <span className="text-xl font-black text-zinc-200 font-mono">{totalInventoryStock} un</span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-zinc-400 font-medium block">Ahorro Promedio</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                ${(averageCustomerSavings / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Search, Sort & View Mode */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `Todos (${FSGOD_MASTER_CATALOG.length})` },
            { id: 'jerseys', label: 'Jerseys (8)' },
            { id: 'hoodies', label: 'Hoodies 380 GSM (6)' },
            { id: 'jackets', label: 'Chaquetas & Bomber (6)' },
            { id: 'tees', label: 'Camisetas Boxy (8)' },
            { id: 'bags', label: 'Bolsos & Accesorios (4)' },
            { id: 'sets', label: 'Sets Urbanos (5)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Sort & Layout Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar SKU (ej. FSG-JER-02)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="sku">Ordenar por SKU</option>
            <option value="priceAsc">Precio: Menor a Mayor</option>
            <option value="priceDesc">Precio: Mayor a Menor</option>
            <option value="margin">Mayor Margen de Ganancia</option>
            <option value="savings">Mayor Ahorro para el Cliente</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
              title="Vista de cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
              title="Vista de tabla detallada"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.sku}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group shadow-lg"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                {/* Top Badge: SKU & Category */}
                <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-amber-500/40 text-amber-400 font-mono text-xs font-black shadow-lg">
                    {product.sku}
                  </span>
                  {product.isBestSeller && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-extrabold flex items-center">
                      <Flame className="w-3 h-3 mr-0.5" /> TOP DROP
                    </span>
                  )}
                </div>

                {/* Location indicator */}
                <div className="absolute bottom-3 left-3 text-xs text-zinc-300 flex items-center space-x-1 bg-zinc-950/80 px-2 py-1 rounded-md backdrop-blur-sm">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-medium">{product.stockLocation}</span>
                </div>

                <div className="absolute bottom-3 right-3 text-xs text-emerald-400 font-bold bg-zinc-950/80 px-2 py-1 rounded-md backdrop-blur-sm">
                  Stock: {product.stockQuantity} un
                </div>

                {/* Top Right Action Overlay (Share Button) */}
                <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
                  <button
                    onClick={(e) => handleQuickShare(e, product)}
                    className="p-2 rounded-xl bg-zinc-950/90 hover:bg-amber-400 hover:text-zinc-950 text-amber-300 border border-amber-500/40 transition-all duration-200 shadow-xl cursor-pointer hover:scale-105 active:scale-95 group/share"
                    title={`Compartir ${product.name} (Gana 5% con enlace de referido)`}
                    id={`btn-share-grid-${product.sku.toLowerCase()}`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-amber-400/90 font-bold uppercase tracking-wider">
                    {product.categoryLabel}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                {/* Mathematical Pricing Matrix */}
                <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Costo Base de Compra:</span>
                    <span className="font-mono text-zinc-300 font-semibold">
                      ${product.baseCostCop.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-amber-400 font-bold flex items-center">
                      <Calculator className="w-3 h-3 mr-1" /> Margen Reglamentario:
                    </span>
                    <span className="font-mono text-amber-400 font-bold">+40% (+$ {product.profitCop.toLocaleString('es-CO')})</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="font-extrabold text-white">Precio Final FsGoD:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ${product.retailPriceCop.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <span>Mercado / Competencia:</span>
                    <span className="text-zinc-500 line-through">
                      ${product.competitorPriceCop.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                    <span>Ahorro del Cliente:</span>
                    <span>-${product.customerSavingsCop.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>

                {/* Fabric & Sizes */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Tallas: <strong className="text-zinc-200">{product.sizes.join(', ')}</strong></span>
                  <span className="text-zinc-500 truncate max-w-[140px]">{product.fabricTech[0]}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => onOpenAssistantForSku(product.sku)}
                    className="py-2 px-2 rounded-xl bg-zinc-900 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors"
                    title="Consultar detalles y cotización con Valeria IA"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Valeria IA</span>
                  </button>

                  <button
                    onClick={(e) => handleQuickShare(e, product)}
                    className="py-2 px-2 rounded-xl bg-zinc-900 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 text-[11px] font-bold flex items-center justify-center space-x-1 transition-all"
                    title="Compartir prenda en redes o WhatsApp"
                    id={`btn-share-action-${product.sku.toLowerCase()}`}
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Compartir</span>
                  </button>

                  <button
                    onClick={() => onSelectProductForWhatsApp(product)}
                    className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-black flex items-center justify-center space-x-1 shadow-md shadow-amber-500/10 transition-transform active:scale-95"
                    title="Realizar pedido por WhatsApp con liquidación inmediata"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Pedir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Prenda</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 font-bold">Costo Base</th>
                  <th className="p-4 font-bold text-amber-400">Margen +40%</th>
                  <th className="p-4 font-bold text-emerald-400">Precio Final</th>
                  <th className="p-4 font-bold">Ref. Mercado</th>
                  <th className="p-4 font-bold text-emerald-400">Ahorro</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredProducts.map((p) => (
                  <tr key={p.sku} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-mono font-black text-amber-400">{p.sku}</td>
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <img
                          src={p.featuredImage}
                          alt={p.name}
                          className="w-8 h-8 rounded object-cover bg-zinc-900"
                        />
                        <span className="truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400">{p.categoryLabel}</td>
                    <td className="p-4 font-mono">${p.baseCostCop.toLocaleString('es-CO')}</td>
                    <td className="p-4 font-mono text-amber-400 font-bold">
                      +${p.profitCop.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold text-sm">
                      ${p.retailPriceCop.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4 font-mono text-zinc-500 line-through">
                      ${p.competitorPriceCop.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">
                      -${p.customerSavingsCop.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono font-semibold">
                        {p.stockQuantity} un
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onOpenAssistantForSku(p.sku)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-amber-400 border border-zinc-700 text-[11px] font-bold"
                      >
                        Valeria IA
                      </button>
                      <button
                        onClick={(e) => handleQuickShare(e, p)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-[11px] font-bold inline-flex items-center space-x-1"
                        title="Compartir prenda"
                        id={`btn-share-table-${p.sku.toLowerCase()}`}
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Compartir</span>
                      </button>
                      <button
                        onClick={() => onSelectProductForWhatsApp(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold"
                      >
                        Pedir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share Modal Integration for Selected Garment */}
      <ShareModal
        isOpen={!!sharingProduct}
        onClose={() => setSharingProduct(null)}
        masterProduct={sharingProduct}
      />
    </div>
  );
}
