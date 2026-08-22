import React, { useState } from 'react';
import { ProductItem } from '../types';
import { 
  Table, 
  DollarSign, 
  Percent, 
  Copy, 
  Check, 
  Download, 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Package, 
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface PricingMarginMatrixProps {
  products: ProductItem[];
  onOpenCustomizerForProduct: (product: ProductItem) => void;
}

export const PricingMarginMatrix: React.FC<PricingMarginMatrixProps> = ({
  products,
  onOpenCustomizerForProduct,
}) => {
  // Margin toggle state: default 40%, customizable via slider or preset buttons
  const [marginPercent, setMarginPercent] = useState<number>(40);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [selectedVolumeTier, setSelectedVolumeTier] = useState<'unit' | 'tier10' | 'tier50' | 'tier100'>('unit');
  const [searchFilter, setSearchFilter] = useState('');

  // Preset Margin Toggles
  const PRESET_MARGINS = [
    { label: '30% Mayorista Vol.', value: 30 },
    { label: '40% Estándar Retail', value: 40 },
    { label: '50% Alta Rentabilidad', value: 50 },
    { label: '60% Luxury Drop', value: 60 },
  ];

  // Volume discount multipliers on workshop purchase price
  const getVolumeMultiplier = (tier: 'unit' | 'tier10' | 'tier50' | 'tier100') => {
    switch (tier) {
      case 'tier10': return 0.95; // 5% bulk discount
      case 'tier50': return 0.90; // 10% bulk discount
      case 'tier100': return 0.82; // 18% bulk discount
      default: return 1.0;
    }
  };

  const volumeMultiplier = getVolumeMultiplier(selectedVolumeTier);

  // Filter products
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.referenceCode && p.referenceCode.toLowerCase().includes(searchFilter.toLowerCase())) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Generate clean Markdown table
  const generateMarkdownTable = () => {
    let md = `### FsGoD Streetwear — Matriz Dinámica de Precios & Márgenes (${marginPercent}% Margen Sugerido)\n\n`;
    md += `| REF Code | Prenda / Referencia | Costo Taller (Compra) | Margen Bruto (%) | PVP Sugerido | Ganancia Neta / Ud | Confección & Técnica |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    filtered.forEach(p => {
      const purchasePrice = +(p.wholesaleCost || (p.basePrice * 0.35 * volumeMultiplier)).toFixed(2);
      const retailPrice = +(purchasePrice / (1 - marginPercent / 100)).toFixed(2);
      const netProfit = +(retailPrice - purchasePrice).toFixed(2);
      const refCode = p.referenceCode || `REF-${p.id.slice(5, 12).toUpperCase()}`;

      md += `| **${refCode}** | ${p.name} | $${purchasePrice.toFixed(2)} | ${marginPercent}% | **$${retailPrice.toFixed(2)}** | +$${netProfit.toFixed(2)} | ${p.fabricType || 'Sublimación 4K Pro'} |\n`;
    });

    md += `\n*Generado automáticamente por el Engine Financiero FsGoD Streetwear. Valores en USD.*`;
    return md;
  };

  const handleCopyMarkdown = async () => {
    audioEngine.playCashChimeSound();
    const md = generateMarkdownTable();
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 3000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Arquitectura Financiera & Catálogo Mayorista</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Matriz de Precios, PVP Sugerido y Margen Dinámico
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calcula en tiempo real los costos de taller, precios de reventa sugeridos y márgenes netos para tu marca o club.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyMarkdown}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              copiedMarkdown
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
            }`}
          >
            {copiedMarkdown ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMarkdown ? '¡Tabla Markdown Copiada!' : 'Copiar Tabla en Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Margin Customization Controls & Volume Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
        
        {/* Margin Slider & Quick Buttons (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Margen de Ganancia Comercial Sugerido:
            </span>
            <span className="text-sm font-black font-mono text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
              {marginPercent}% MARGEN
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_MARGINS.map(m => (
              <button
                key={m.value}
                onClick={() => {
                  audioEngine.playClickSound();
                  setMarginPercent(m.value);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                  marginPercent === m.value
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Precision Slider */}
          <div className="flex items-center space-x-3 pt-1">
            <span className="text-[11px] font-mono text-slate-400">20%</span>
            <input
              type="range"
              min="20"
              max="75"
              step="1"
              value={marginPercent}
              onChange={(e) => setMarginPercent(parseInt(e.target.value, 10))}
              className="flex-1 accent-amber-400 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400">75%</span>
          </div>
        </div>

        {/* Volume Tier Selector (5 cols) */}
        <div className="md:col-span-5 space-y-2.5 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-3 md:pt-0">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            Escalado por Volumen de Pedido:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'unit', label: '1 - 9 Uds (PVP)', discount: '0% Desc' },
              { id: 'tier10', label: '10 - 49 Uds', discount: '5% Desc' },
              { id: 'tier50', label: '50 - 99 Uds', discount: '10% Desc' },
              { id: 'tier100', label: '100+ Uds Pro', discount: '18% Desc' },
            ].map(tier => (
              <button
                key={tier.id}
                onClick={() => {
                  audioEngine.playClickSound();
                  setSelectedVolumeTier(tier.id as any);
                }}
                className={`p-2 rounded-xl text-left border transition-all ${
                  selectedVolumeTier === tier.id
                    ? 'bg-cyan-500/15 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <p className="text-[11px] font-bold text-white">{tier.label}</p>
                <p className="text-[10px] text-cyan-400 font-mono">{tier.discount}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Pricing Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Código REF</th>
              <th className="py-3.5 px-4">Prenda & Silueta</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4 text-right">Compra Taller (Base)</th>
              <th className="py-3.5 px-4 text-center">Margen Comercial</th>
              <th className="py-3.5 px-4 text-right text-amber-400 font-bold">PVP Sugerido (Venta)</th>
              <th className="py-3.5 px-4 text-right text-emerald-400 font-bold">Ganancia Neta / Ud</th>
              <th className="py-3.5 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {filtered.map(p => {
              const baseCost = +(p.wholesaleCost || (p.basePrice * 0.35 * volumeMultiplier)).toFixed(2);
              const retailPrice = +(baseCost / (1 - marginPercent / 100)).toFixed(2);
              const netProfit = +(retailPrice - baseCost).toFixed(2);
              const refCode = p.referenceCode || `REF-${p.id.slice(5, 12).toUpperCase()}`;

              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {refCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.featuredImage}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover bg-black border border-slate-800 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white group-hover:text-amber-300 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 uppercase font-mono text-[10px]">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-300 whitespace-nowrap">
                    ${baseCost.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono font-bold text-[10px] border border-amber-400/20">
                      {marginPercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400 text-sm whitespace-nowrap">
                    ${retailPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 whitespace-nowrap">
                    +${netProfit.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        audioEngine.playSprayCanSound();
                        onOpenCustomizerForProduct(p);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>3D Mockup</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Formula Footer Note */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Fórmula Oficial: <code className="text-amber-400">PVP = Costo Compra / (1 - Margen%)</code></span>
        </div>
        <span className="text-slate-500">Sublimación Digital 4K • Taller FsGoD 2026</span>
      </div>
    </div>
  );
};
