import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  MapPin, 
  CreditCard, 
  Calculator, 
  CheckCircle2, 
  Truck, 
  Phone, 
  User, 
  ArrowRight,
  ShieldCheck,
  Flame,
  X,
  Share2
} from 'lucide-react';
import { MasterCatalogProduct, FSGOD_MASTER_CATALOG, formatCopCurrency } from '../data/masterCatalog';
import { FSGOD_BRAND_CONTACT, getWhatsAppUrl } from '../data/brandContact';
import { ZelleChaseQrCard } from './ZelleChaseQrCard';
import { ShareModal } from './ShareModal';
import { audioEngine } from '../utils/audioEngine';


export interface OrderLineItem {
  product: MasterCatalogProduct;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}

interface WhatsAppOrderGeneratorProps {
  initialItems?: OrderLineItem[];
  onClose?: () => void;
  onOpenAssistantForSku?: (sku: string) => void;
}

const COLOMBIAN_CITIES = [
  { name: 'Barranquilla (Domicilio Mismo Día)', shippingCop: 8000 },
  { name: 'Soledad / Área Metropolitana', shippingCop: 8000 },
  { name: 'Bogotá D.C.', shippingCop: 14000 },
  { name: 'Medellín / Valle de Aburrá', shippingCop: 14000 },
  { name: 'Cali / Valle del Cauca', shippingCop: 15000 },
  { name: 'Cartagena de Indias', shippingCop: 10000 },
  { name: 'Santa Marta', shippingCop: 10000 },
  { name: 'Bucaramanga', shippingCop: 14000 },
  { name: 'Pereira / Eje Cafetero', shippingCop: 14000 },
  { name: 'Otras Ciudades Nacionales', shippingCop: 16000 },
];

const PAYMENT_METHODS = [
  { id: 'nequi', name: 'Nequi (300 929 2929)', icon: '📱' },
  { id: 'daviplata', name: 'Daviplata (300 929 2929)', icon: '📲' },
  { id: 'bancolombia_qr', name: 'Bancolombia Transferencia / QR', icon: '🏦' },
  { id: 'zelle_chase', name: 'Zelle® Chase USA (CLTV.DATA LLC - xxxxxx8471)', icon: '🏛️' },
  { id: 'contraentrega', name: 'Pago Contraentrega Nacional (Efectivo)', icon: '💵' },
];

export function WhatsAppOrderGenerator({
  initialItems = [],
  onClose,
  onOpenAssistantForSku,
}: WhatsAppOrderGeneratorProps) {
  const [items, setItems] = useState<OrderLineItem[]>(
    initialItems.length > 0
      ? initialItems
      : [
          {
            product: FSGOD_MASTER_CATALOG[1], // FSG-JER-02 Junior 1993
            selectedSize: 'L',
            quantity: 1,
          },
          {
            product: FSGOD_MASTER_CATALOG[8], // FSG-HDY-01 Street Rebel Bear
            selectedSize: 'XL',
            quantity: 1,
          },
        ]
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState(COLOMBIAN_CITIES[0]);
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [sharingProduct, setSharingProduct] = useState<MasterCatalogProduct | null>(null);

  // Math: Calculate Subtotal, 40% Margin retail pricing, Shipping and Grand Total
  const subtotalCop = items.reduce(
    (acc, it) => acc + it.product.retailPriceCop * it.quantity,
    0
  );
  const baseCostTotalCop = items.reduce(
    (acc, it) => acc + it.product.baseCostCop * it.quantity,
    0
  );
  const totalProfitCop = items.reduce(
    (acc, it) => acc + it.product.profitCop * it.quantity,
    0
  );
  const totalCompetitorReferenceCop = items.reduce(
    (acc, it) => acc + it.product.competitorPriceCop * it.quantity,
    0
  );
  const totalSavingsCop = Math.max(0, totalCompetitorReferenceCop - subtotalCop);

  const isFreeShipping = subtotalCop >= 200000;
  const effectiveShippingCop = isFreeShipping ? 0 : selectedCity.shippingCop;
  const grandTotalCop = subtotalCop + effectiveShippingCop;

  // Add more item from catalog
  const handleAddCatalogItem = (sku: string) => {
    const prod = FSGOD_MASTER_CATALOG.find((p) => p.sku === sku);
    if (!prod) return;

    setItems((prev) => {
      const existing = prev.find((it) => it.product.sku === sku);
      if (existing) {
        return prev.map((it) =>
          it.product.sku === sku ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { product: prod, selectedSize: 'L', quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((it, idx) => {
          if (idx === index) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as OrderLineItem[]
    );
  };

  const handleUpdateSize = (index: number, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, selectedSize: size } : it))
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Generate Colombian formatted WhatsApp message
  const generateWhatsAppMessage = () => {
    const lines = items
      .map(
        (it, idx) =>
          `  ${idx + 1}. *[${it.product.sku}]* ${it.product.name}\n` +
          `     • Talla: *${it.selectedSize}* | Cant: *${it.quantity}* | P. Unit: *$${it.product.retailPriceCop.toLocaleString('es-CO')} COP*\n` +
          `     • Subtotal: *$${(it.product.retailPriceCop * it.quantity).toLocaleString('es-CO')} COP*`
      )
      .join('\n\n');

    const paymentMethodLabel =
      PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name || selectedPayment;

    return (
      `🇨🇴 *NUEVO PEDIDO OFICIAL FSGOD STREETWEAR* 🇨🇴\n` +
      `-----------------------------------------\n` +
      `¡Hola Valeria y equipo FsGoD! Quiero confirmar mi pedido del Catálogo Maestro:\n\n` +
      `📦 *PRENDAS SOLICITADAS:*\n${lines}\n\n` +
      `-----------------------------------------\n` +
      `💰 *RESUMEN DE LIQUIDACIÓN:*\n` +
      `• Subtotal Prendas (Margen +40%): *$${subtotalCop.toLocaleString('es-CO')} COP*\n` +
      `• Envío / Domicilio (${selectedCity.name}): *${isFreeShipping ? '¡GRATIS!' : `$${effectiveShippingCop.toLocaleString('es-CO')} COP`}*\n` +
      `• *TOTAL A PAGAR: $${grandTotalCop.toLocaleString('es-CO')} COP*\n` +
      `• (Ahorro estimado vs mercado: $${totalSavingsCop.toLocaleString('es-CO')} COP 🎉)\n\n` +
      `👤 *DATOS DE ENTREGA:*\n` +
      `• Cliente: *${customerName || 'Por confirmar'}*\n` +
      `• WhatsApp/Teléfono: *${customerPhone || 'Por confirmar'}*\n` +
      `• Ciudad: *${selectedCity.name}*\n` +
      `• Dirección: *${address || 'Por confirmar'}*\n` +
      `• Barrio: *${neighborhood || 'N/A'}*\n` +
      `• Método de Pago: *${paymentMethodLabel}*\n` +
      (customerNotes ? `• Notas: _${customerNotes}_\n` : '') +
      `\nQuedo atento a la confirmación de despacho desde bodega. ¡Todo al pelo!`
    );
  };

  const handleSendToWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    const whatsappUrl = getWhatsAppUrl(msg);
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyText = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 lg:p-8 text-zinc-100 shadow-2xl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
              FsGoD Colombia Engine
            </span>
            <span className="flex items-center text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Margen 40% Aplicado
            </span>
            <a 
              href={FSGOD_BRAND_CONTACT.whatsappLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold transition-all hover:bg-emerald-900/60"
            >
              <Phone className="w-3 h-3 mr-1 text-emerald-400" />
              WhatsApp Oficial: {FSGOD_BRAND_CONTACT.whatsappFormatted}
            </a>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-2">
            Procesador de Pedidos & WhatsApp
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Cotización oficial en tiempo real con liquidación de envíos y despacho directo al <strong className="text-emerald-400 font-mono">{FSGOD_BRAND_CONTACT.whatsappFormatted}</strong>.
          </p>
        </div>

        {/* Quick Add Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-zinc-400 font-medium">Añadir SKU:</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddCatalogItem(e.target.value);
                e.target.value = '';
              }
            }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">+ Seleccionar prenda del catálogo...</option>
            {FSGOD_MASTER_CATALOG.map((prod) => (
              <option key={prod.sku} value={prod.sku}>
                [{prod.sku}] {prod.name} (${prod.retailPriceCop.toLocaleString('es-CO')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Order Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" /> Prendas en la Orden ({items.length})
          </h3>

          {items.length === 0 ? (
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
              <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-400">No hay prendas en la orden aún.</p>
              <p className="text-xs mt-1">Selecciona un SKU del menú superior para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div
                  key={`${it.product.sku}-${idx}`}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={it.product.featuredImage}
                      alt={it.product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-950 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {it.product.sku}
                        </span>
                        {onOpenAssistantForSku && (
                          <button
                            onClick={() => onOpenAssistantForSku(it.product.sku)}
                            className="text-[10px] text-amber-300/80 hover:text-amber-300 underline"
                          >
                            Consultar a Valeria
                          </button>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate mt-1">
                        {it.product.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs mt-1">
                        <span className="text-emerald-400 font-bold">
                          ${it.product.retailPriceCop.toLocaleString('es-CO')} COP
                        </span>
                        <span className="text-zinc-500 line-through text-[11px]">
                          ${it.product.competitorPriceCop.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Size & Quantity Controls */}
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {/* Size selector */}
                    <div className="flex items-center space-x-1">
                      <label className="text-[11px] text-zinc-400">Talla:</label>
                      <select
                        value={it.selectedSize}
                        onChange={(e) =>
                          handleUpdateSize(idx, e.target.value as 'S' | 'M' | 'L' | 'XL' | 'XXL')
                        }
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-400 focus:outline-none"
                      >
                        {it.product.sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-950 overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-white">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Share Garment */}
                    <button
                      onClick={() => {
                        audioEngine.playSprayCanSound();
                        setSharingProduct(it.product);
                      }}
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors border border-amber-500/20"
                      title={`Compartir ${it.product.name}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Eliminar de la orden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mathematical Transparency Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center">
                <Calculator className="w-3.5 h-3.5 mr-1 text-amber-400" /> Costo Base Acumulado:
              </span>
              <span className="font-mono text-zinc-300">${baseCostTotalCop.toLocaleString('es-CO')} COP</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Margen FsGoD Aplicado (+40%):</span>
              <span className="font-mono text-amber-400 font-bold">+${totalProfitCop.toLocaleString('es-CO')} COP</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
              <span>Ahorro del Cliente vs Tiendas Externas:</span>
              <span className="font-mono text-emerald-400 font-bold">-${totalSavingsCop.toLocaleString('es-CO')} COP 🎉</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Shipping (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center">
            <Truck className="w-4 h-4 mr-2" /> Datos de Despacho & Pago
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo:</label>
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp / Móvil:</label>
                <input
                  type="text"
                  placeholder="300 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Ciudad Destino:</label>
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const city = COLOMBIAN_CITIES.find((c) => c.name === e.target.value);
                    if (city) setSelectedCity(city);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
                >
                  {COLOMBIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (${c.shippingCop.toLocaleString('es-CO')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Dirección:</label>
                <input
                  type="text"
                  placeholder="Cra. 53 # 84 - 20"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Barrio:</label>
                <input
                  type="text"
                  placeholder="Alto Prado / El Prado"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Medio de Pago:</label>
              <div className="grid grid-cols-1 gap-1.5">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      selectedPayment === pm.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>
                      {pm.icon} {pm.name}
                    </span>
                    {selectedPayment === pm.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>

              {selectedPayment === 'zelle_chase' && (
                <div className="mt-3">
                  <ZelleChaseQrCard 
                    memo={customerName ? `FSG-${customerName.toUpperCase().slice(0, 8)}` : 'FSG-WHATSAPP'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Subtotal Prendas:</span>
              <span className="font-mono text-zinc-200">${subtotalCop.toLocaleString('es-CO')} COP</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Envío / Domicilio:</span>
              <span className="font-mono text-zinc-200">
                {isFreeShipping ? (
                  <strong className="text-emerald-400">¡GRATIS (Orden {'>'} $200k)!</strong>
                ) : (
                  `$${effectiveShippingCop.toLocaleString('es-CO')} COP`
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
              <span className="text-amber-400">Total Liquidado:</span>
              <span className="text-emerald-400 font-mono text-lg">
                ${grandTotalCop.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendToWhatsApp}
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido a WhatsApp FsGoD</span>
            </button>

            <button
              onClick={handleCopyText}
              disabled={items.length === 0}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
            >
              <span>{isCopied ? '¡Copiado al portapapeles!' : 'Copiar Resumen de Pedido'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!sharingProduct}
        onClose={() => setSharingProduct(null)}
        masterProduct={sharingProduct}
      />
    </div>
  );
}
