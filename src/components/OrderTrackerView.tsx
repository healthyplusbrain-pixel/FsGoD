import React, { useState, useEffect } from 'react';
import { CustomOrder } from '../types';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  Scissors, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  User, 
  MapPin,
  ArrowRight,
  Upload,
  Building2,
  FileCheck,
  AlertCircle,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { SectionSoundtrackBanner } from './SectionSoundtrackBanner';

interface OrderTrackerViewProps {
  initialOrderNumber?: string;
  onOpenCustomizer?: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  initialOrderNumber = '',
  onOpenCustomizer,
}) => {
  const [searchCode, setSearchCode] = useState(initialOrderNumber || 'FsGoD-CUSTOM-8921');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-tracker receipt upload
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [senderBank, setSenderBank] = useState('Transferencia Bancaria Directa');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptMsg, setReceiptMsg] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const fetchOrder = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMsg(data.message || 'No se encontró ninguna orden con ese identificador.');
      }
    } catch (e) {
      setErrorMsg('Error al consultar el servidor de producción.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('FsGoD-CUSTOM-8921');
    }
  }, [initialOrderNumber]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setUploadingReceipt(true);
    setReceiptMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderBank: senderBank || 'Transferencia Directa',
          referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          receiptImageUrl: receiptPreview || '',
          amountPaid: order.totalAmount,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setReceiptMsg('¡Comprobante subido con éxito! El taller lo validará manualmente a la brevedad.');
      } else {
        setReceiptMsg('No se pudo procesar el comprobante.');
      }
    } catch (e) {
      setReceiptMsg('Error de conexión al enviar el comprobante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Production pipeline stages
  const STAGES = [
    { id: 'tech_pack_review', label: '1. Ficha Técnica & Vector', icon: Package },
    { id: 'cutting_sublimation', label: '2. Sublimación 4K & Corte Láser', icon: Scissors },
    { id: 'stitching_seals', label: '3. Confección & Termosellado', icon: Sparkles },
    { id: 'quality_control', label: '4. Control de Calidad', icon: ShieldCheck },
    { id: 'dispatched', label: '5. En Ruta / Courier', icon: Truck },
    { id: 'delivered', label: '6. Entregado', icon: CheckCircle2 },
  ];

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex(s => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIdx = order ? getStageIndex(order.productionStatus) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Lookup Bar */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
          <Truck className="w-3.5 h-3.5" />
          <span>PORTAL DE SEGUIMIENTO EN TALLER FsGoD</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          RASTREO DE <span className="text-amber-400">PRODUCCIÓN & COMPROBANTES</span>
        </h1>
        <p className="text-xs text-slate-400">
          Ingresa tu número de orden (ej: <code className="text-amber-400 font-bold">FsGoD-CUSTOM-8921</code>) para verificar el estado de pago, corte y confección.
        </p>

        {/* Search input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchOrder(searchCode);
          }}
          className="flex items-center max-w-md mx-auto pt-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="FsGoD-CUSTOM-XXXX"
              className="w-full pl-10 pr-4 py-3 rounded-l-2xl bg-[#0a192f] border border-slate-800 text-xs font-mono font-bold text-white uppercase focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-r-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {/* Factory Dispatch Ambient Soundtrack: Industrial Factory Midnight */}
        <div className="pt-2">
          <SectionSoundtrackBanner sectionKey="tracker" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-br from-[#0a0e17] via-[#0a192f] to-[#0a0e17] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Orden de Confección Oficial</span>
                <h2 className="text-2xl font-black text-amber-400 font-mono">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Cliente: <strong>{order.customerName}</strong> • {order.city}, {order.country}
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1.5">
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                  {order.productionStatusLabel}
                </span>
                
                <div className="flex sm:justify-end">
                  {order.paymentStatus === 'paid' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> PAGO VALIDADO (${order.totalAmount.toFixed(2)})
                    </span>
                  )}
                  {order.paymentStatus === 'receipt_uploaded' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold animate-pulse">
                      <Clock className="w-3 h-3 mr-1" /> COMPROBANTE EN REVISIÓN EN TALLER
                    </span>
                  )}
                  {order.paymentStatus === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
                      <AlertCircle className="w-3 h-3 mr-1" /> PENDIENTE DE COMPROBANTE
                    </span>
                  )}
                  {order.paymentStatus === 'receipt_rejected' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-rose-600/30 border border-rose-500/50 text-rose-300 text-[10px] font-mono font-bold">
                      <AlertCircle className="w-3 h-3 mr-1" /> COMPROBANTE OBSERVADO
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-mono">
                  Entrega estimada: <strong className="text-white">{order.estimatedDelivery}</strong>
                </p>
              </div>
            </div>

            {/* Stepper Pipeline Bar */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono uppercase text-slate-400 font-bold">Línea de Confección & Fulfillment:</p>
                {order.cjOrderId && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 font-bold flex items-center gap-1">
                    <Truck className="w-3 h-3 text-cyan-400" />
                    CJ DROPSHIPPING POD: {order.cjOrderId}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {STAGES.map((st, idx) => {
                  const Icon = st.icon;
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-2 ${
                        isCurrent
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg shadow-amber-400/15'
                          : isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-[#0a0e17] border-slate-800/80 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </div>
                      <p className="text-[10px] font-bold leading-tight">{st.label}</p>
                      {isDone && <span className="text-[9px] font-mono text-emerald-400">✓ Completado</span>}
                      {isCurrent && <span className="text-[9px] font-mono text-amber-400 font-bold animate-pulse">● En Proceso</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CJ TRACKING CARD IF DISPATCHED */}
            {order.cjTrackingNumber && (
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-cyan-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Guía de Despacho Internacional CJ</h4>
                      <p className="text-xs text-slate-300">Courier: <strong>{order.cjCarrier || 'CJ Packet Special Line'}</strong></p>
                    </div>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-slate-400">Nº Guía: </span>
                    <strong className="text-amber-400">{order.cjTrackingNumber}</strong>
                  </div>
                </div>

                {order.cjTrackingUrl && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={order.cjTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center space-x-1.5 transition-all"
                    >
                      <span>Rastrear Envío en Vivo (17TRACK / CJ)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* BANK TRANSFER & RECEIPT SECTION */}
            {order.paymentStatus !== 'paid' && (
              <div className="p-5 bg-[#0a192f]/70 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Validación de Transferencia Bancaria</h4>
                      <p className="text-xs text-slate-400">Total a transferir: <strong className="text-amber-400 font-mono">${order.totalAmount.toFixed(2)}</strong></p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    Concepto: {order.orderNumber}
                  </span>
                </div>

                {/* Quick Account Copies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#0a0e17]/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Santander ES</p>
                      <code className="text-amber-300 text-[11px]">ES76 0049 1500 0512 3456 7890</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('ES7600491500051234567890', 'santander')}
                      className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 hover:text-white"
                    >
                      {copiedAccount === 'santander' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>

                  <div className="p-3 bg-[#0a0e17]/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Bizum / Zelle</p>
                      <code className="text-cyan-300 text-[11px]">+34 600 888 999 • finance@fsgod.com</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('+34600888999', 'bizum')}
                      className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 hover:text-white"
                    >
                      {copiedAccount === 'bizum' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Upload Form inside tracker */}
                <form onSubmit={handleUploadReceiptSubmit} className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Banco / Medio Emisor</label>
                      <input
                        type="text"
                        value={senderBank}
                        onChange={e => setSenderBank(e.target.value)}
                        placeholder="Ej: BBVA / Bizum / Santander"
                        className="mt-1 w-full p-2 bg-[#0a0e17] border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Nº de Referencia de Transferencia</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        placeholder="Ej: TRX-884920"
                        className="mt-1 w-full p-2 bg-[#0a0e17] border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Adjuntar Foto o Captura del Comprobante</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="mt-1 w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                    />
                    {receiptPreview && (
                      <div className="mt-2">
                        <img
                          src={receiptPreview}
                          alt="Previa comprobante"
                          referrerPolicy="no-referrer"
                          className="max-h-24 rounded-lg border border-slate-700 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {receiptMsg && (
                    <p className="text-xs font-bold text-amber-300 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/30">
                      {receiptMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={uploadingReceipt}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    {uploadingReceipt ? (
                      <span>Enviando Comprobante...</span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Subir Comprobante para Validación en Taller</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Receipt Uploaded Details (if already submitted) */}
            {order.paymentReceipt && (
              <div className="p-4 bg-[#0a0e17]/90 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Comprobante Registrado:
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Ref: {order.paymentReceipt.referenceNumber}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
                  <span>Banco: <strong>{order.paymentReceipt.senderBank}</strong></span>
                  <span>Importe: <strong>${order.paymentReceipt.amountPaid.toFixed(2)}</strong></span>
                  <span>Fecha: <strong>{order.paymentReceipt.uploadedAt}</strong></span>
                  <span>Estado: <strong className={order.paymentReceipt.verified ? 'text-emerald-400' : 'text-amber-400'}>{order.paymentReceipt.verified ? 'VALIDADO ✓' : 'EN REVISIÓN'}</strong></span>
                </div>
                {order.paymentReceipt.receiptImageUrl && (
                  <div className="pt-2">
                    <img
                      src={order.paymentReceipt.receiptImageUrl}
                      alt="Comprobante subido"
                      referrerPolicy="no-referrer"
                      className="max-h-36 rounded-xl border border-slate-700 object-contain shadow-md"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Admin / Workshop Notes */}
            {order.adminNotes && (
              <div className="p-4 bg-[#0a0e17] rounded-2xl border border-slate-800/80 text-xs">
                <span className="text-amber-400 font-bold font-mono">BITÁCORA DE CONTROL DE CALIDAD Y TALLER:</span>
                <p className="text-slate-300 mt-1">{order.adminNotes}</p>
              </div>
            )}

          </div>

          {/* Garments in this order */}
          <div className="bg-[#0a0e17] p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Prendas en Confección ({order.items.length})</h3>
            
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a192f]/40 rounded-2xl border border-slate-800 text-xs gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-black text-white text-sm">{item.productName}</p>
                    <p className="text-slate-400 font-mono">
                      Cantidad: <strong>{item.quantity}</strong> • Precio unitario: ${item.unitPrice.toFixed(2)}
                    </p>
                    {item.design && (
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Pecho: {item.design.frontText || 'FsGoD'}
                        </span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Dorsal: #{item.design.backPlayerNumber || '10'} {item.design.backPlayerName}
                        </span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Talla: {item.design.selectedSize}
                        </span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Emblema: {item.design.frontLogoType}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
