import React, { useState, useEffect } from 'react';
import { CustomOrder, CjProductSyncItem, CjTrackingInfo } from '../types';
import { 
  Layers, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  FileText, 
  Search, 
  Filter, 
  Sliders, 
  Clock, 
  Send,
  Download,
  FileCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Eye,
  DollarSign,
  Truck,
  Box,
  Globe2,
  Sparkles,
  ExternalLink,
  Code2,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';

export const AdminProductionPanel: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'cj_catalog' | 'cj_settings'>('orders');
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilterTab, setStatusFilterTab] = useState<'all' | 'pending_receipt' | 'in_production' | 'completed' | 'cj_dispatched'>('all');
  
  // Receipt verification & auto CJ dispatch
  const [verifyingReceipt, setVerifyingReceipt] = useState(false);
  const [showReceiptImageModal, setShowReceiptImageModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [autoDispatchCjToggle, setAutoDispatchCjToggle] = useState(true);

  // CJ Dropshipping state
  const [cjStatus, setCjStatus] = useState<any>(null);
  const [cjProducts, setCjProducts] = useState<CjProductSyncItem[]>([]);
  const [syncingCjCatalog, setSyncingCjCatalog] = useState(false);
  const [dispatchingCjOrderId, setDispatchingCjOrderId] = useState<string | null>(null);
  const [showCjPayloadModal, setShowCjPayloadModal] = useState(false);
  const [showCjTrackingModal, setShowCjTrackingModal] = useState(false);
  const [activeTrackingData, setActiveTrackingData] = useState<CjTrackingInfo | null>(null);
  const [fetchingTracking, setFetchingTracking] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        if (data.orders.length > 0) {
          if (!selectedOrder) {
            setSelectedOrder(data.orders[0]);
            setNewStatus(data.orders[0].productionStatus);
            setAdminNote(data.orders[0].adminNotes || '');
          } else {
            const found = data.orders.find((o: CustomOrder) => o.id === selectedOrder.id);
            if (found) setSelectedOrder(found);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCjData = async () => {
    try {
      const [statusRes, productsRes] = await Promise.all([
        fetch('/api/cj/status'),
        fetch('/api/cj/products'),
      ]);
      const statusData = await statusRes.json();
      const productsData = await productsRes.json();

      if (statusData.success) setCjStatus(statusData.status);
      if (productsData.success) setCjProducts(productsData.products || []);
    } catch (e) {
      console.error('Error fetching CJ data:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCjData();
  }, []);

  const handleSelectOrder = (o: CustomOrder) => {
    setSelectedOrder(o);
    setNewStatus(o.productionStatus);
    setAdminNote(o.adminNotes || '');
    setShowRejectBox(false);
  };

  const handleSyncCjCatalog = async () => {
    setSyncingCjCatalog(true);
    try {
      const res = await fetch('/api/cj/sync-catalog', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCjProducts(data.items || []);
        showNotification(data.message || 'Catálogo de CJ Dropshipping sincronizado exitosamente.');
      } else {
        showNotification(data.message || 'Error al sincronizar con CJ', 'error');
      }
    } catch (e: any) {
      showNotification(`Error de conexión con CJ: ${e.message}`, 'error');
    } finally {
      setSyncingCjCatalog(false);
    }
  };

  const handleVerifyReceipt = async (verified: boolean) => {
    if (!selectedOrder) return;
    setVerifyingReceipt(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/verify-receipt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: verified,
          verificationNotes: verified ? 'Comprobante verificado con cuenta bancaria oficial' : (rejectionReason || 'Comprobante no legible o monto incorrecto'),
          autoDispatchCj: verified ? autoDispatchCjToggle : false,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setShowRejectBox(false);
        setRejectionReason('');
        await fetchOrders();
        showNotification(data.message || 'Estado de pago actualizado');
      }
    } catch (e) {
      console.error('Error verifying receipt:', e);
      showNotification('Error al verificar comprobante', 'error');
    } finally {
      setVerifyingReceipt(false);
    }
  };

  const handleManualDispatchToCj = async () => {
    if (!selectedOrder) return;
    setDispatchingCjOrderId(selectedOrder.id);
    try {
      const res = await fetch(`/api/cj/orders/dispatch/${selectedOrder.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        await fetchOrders();
        showNotification(data.message || '¡Orden despachada a CJ Dropshipping con éxito!');
      } else {
        showNotification(data.message || 'Error al despachar a CJ Dropshipping', 'error');
      }
    } catch (e: any) {
      showNotification(`Fallo de conexión: ${e.message}`, 'error');
    } finally {
      setDispatchingCjOrderId(null);
    }
  };

  const handleOpenTrackingModal = async () => {
    if (!selectedOrder) return;
    setFetchingTracking(true);
    setShowCjTrackingModal(true);
    try {
      const res = await fetch(`/api/cj/orders/${selectedOrder.id}/tracking`);
      const data = await res.json();
      if (data.success && data.tracking) {
        setActiveTrackingData(data.tracking);
      }
    } catch (e) {
      console.error('Error fetching tracking:', e);
    } finally {
      setFetchingTracking(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        if (data.order) {
          setSelectedOrder(data.order);
        }
        showNotification(data.message || 'Estado actualizado');
      }
    } catch (e) {
      console.error('Error updating order:', e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (o.cjOrderId && o.cjOrderId.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilterTab === 'pending_receipt') {
      return o.paymentStatus === 'receipt_uploaded' || o.paymentStatus === 'pending';
    }
    if (statusFilterTab === 'in_production') {
      return o.productionStatus === 'cutting_sublimation' || o.productionStatus === 'stitching_seals' || o.productionStatus === 'quality_control';
    }
    if (statusFilterTab === 'completed') {
      return o.productionStatus === 'dispatched' || o.productionStatus === 'delivered';
    }
    if (statusFilterTab === 'cj_dispatched') {
      return Boolean(o.cjOrderId);
    }
    return true;
  });

  const pendingReceiptCount = orders.filter(o => o.paymentStatus === 'receipt_uploaded').length;
  const cjFulfilledCount = orders.filter(o => Boolean(o.cjOrderId)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast notification */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-mono font-bold shadow-2xl transition-all ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
            : notificationMsg.type === 'error'
            ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
            : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
        }`}>
          <div className="flex items-center space-x-2">
            {notificationMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* Header with integration status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Taller Central FsGoD & Centro de Conexión CJ Dropshipping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ADMINISTRACIÓN DE <span className="text-amber-400">PEDIDOS & CJ FULFILLMENT</span>
          </h1>
        </div>

        {/* Integration Status Pill & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0a192f] border border-amber-500/30 flex items-center space-x-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">CJ Open API:</span>
            <span className="text-amber-400 font-bold">
              {cjStatus?.sandboxMode ? 'Modo Sandbox Activo' : 'Producción Conectada'}
            </span>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#0a192f]/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Top Admin Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeAdminTab === 'orders'
              ? 'border-amber-400 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestión de Pedidos & Validación ({orders.length})</span>
          {pendingReceiptCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {pendingReceiptCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('cj_catalog')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeAdminTab === 'cj_catalog'
              ? 'border-amber-400 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Catálogo Sincronizado CJ Dropshipping ({cjProducts.length} Blanks Oversized)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cj_settings')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeAdminTab === 'cj_settings'
              ? 'border-amber-400 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Configuración API & Webhooks</span>
        </button>
      </div>

      {/* ===================== TAB 1: ORDERS & FULFILLMENT ===================== */}
      {activeAdminTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Orders List (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0a0e17] p-4 rounded-3xl border border-slate-800 space-y-4">
            
            {/* Filter tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono font-bold">
              <button
                onClick={() => setStatusFilterTab('all')}
                className={`p-2 rounded-xl border transition-all ${
                  statusFilterTab === 'all'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#0a192f] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilterTab('pending_receipt')}
                className={`p-2 rounded-xl border transition-all ${
                  statusFilterTab === 'pending_receipt'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#0a192f] text-amber-300 border-amber-500/30'
                }`}
              >
                Por Validar
              </button>
              <button
                onClick={() => setStatusFilterTab('cj_dispatched')}
                className={`p-2 rounded-xl border transition-all ${
                  statusFilterTab === 'cj_dispatched'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#0a192f] text-cyan-300 border-cyan-500/30'
                }`}
              >
                En CJ ({cjFulfilledCount})
              </button>
              <button
                onClick={() => setStatusFilterTab('in_production')}
                className={`p-2 rounded-xl border transition-all ${
                  statusFilterTab === 'in_production'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#0a192f] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                En Taller
              </button>
              <button
                onClick={() => setStatusFilterTab('completed')}
                className={`p-2 rounded-xl border transition-all ${
                  statusFilterTab === 'completed'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#0a192f] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Listos
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Buscar código, cliente, email o ID CJ..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a192f] border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-thin">
              {filteredOrders.map(o => {
                const isReceiptPending = o.paymentStatus === 'receipt_uploaded';
                const isPaid = o.paymentStatus === 'paid';
                const hasCj = Boolean(o.cjOrderId);

                return (
                  <div
                    key={o.id}
                    onClick={() => handleSelectOrder(o)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      selectedOrder?.id === o.id
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                        : isReceiptPending
                        ? 'bg-[#0a192f] border-amber-500/40 text-slate-300 hover:border-amber-400'
                        : 'bg-[#0a192f]/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-amber-400">{o.orderNumber}</span>
                      <span className="text-white">${o.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{o.customerName}</p>
                    
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{o.items.length} prenda(s)</span>
                      
                      <div className="flex items-center space-x-1.5">
                        {hasCj && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center space-x-1">
                            <Truck className="w-2.5 h-2.5" />
                            <span>CJ FULFILLED</span>
                          </span>
                        )}

                        {isReceiptPending ? (
                          <span className="text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded font-bold">
                            COMPROBANTE SUBIDO
                          </span>
                        ) : isPaid ? (
                          <span className="text-emerald-400 font-bold">✓ PAGADO</span>
                        ) : (
                          <span className="text-rose-400">PENDIENTE</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Order Details, CJ Fulfillment & Status Changer (7 Cols) */}
          {selectedOrder ? (
            <div className="lg:col-span-7 bg-[#0a0e17] p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{selectedOrder.orderNumber}</span>
                  <h3 className="text-lg font-black text-white">{selectedOrder.customerName}</h3>
                  <p className="text-xs text-slate-400">{selectedOrder.customerEmail} • {selectedOrder.city}, {selectedOrder.country}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xl font-black text-white font-mono">${selectedOrder.totalAmount.toFixed(2)}</span>
                  <div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedOrder.paymentStatus === 'receipt_uploaded'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      ESTADO PAGO: {selectedOrder.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* CJ DROPSHIPPING AUTOMATED FULFILLMENT STATUS CARD */}
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>Fulfillment Automático CJ Dropshipping (POD Oversized)</span>
                  </div>
                  {selectedOrder.cjOrderId ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-bold">
                      ORDEN ACTIVA EN CJ
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      NO DESPACHADO AÚN
                    </span>
                  )}
                </div>

                {selectedOrder.cjOrderId ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-[#0a0e17] p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">ID ORDEN CJ:</span>
                        <strong className="text-cyan-300">{selectedOrder.cjOrderId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">GUÍA INTERNACIONAL:</span>
                        <strong className="text-amber-400">{selectedOrder.cjTrackingNumber || 'Asignándose...'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">COURIER / LOGÍSTICA:</span>
                        <strong className="text-white truncate block">{selectedOrder.cjCarrier || 'CJ Packet'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">DESPACHADO EN:</span>
                        <strong className="text-slate-300">{selectedOrder.cjDispatchedAt ? new Date(selectedOrder.cjDispatchedAt).toLocaleDateString() : 'Hoy'}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleOpenTrackingModal}
                        className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Ver Línea de Rastreo CJ en Vivo</span>
                      </button>

                      {selectedOrder.cjTrackingUrl && (
                        <a
                          href={selectedOrder.cjTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center space-x-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rastrear en 17TRACK / CJ Global</span>
                        </a>
                      )}

                      <button
                        onClick={() => setShowCjPayloadModal(true)}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Ficha Técnica POD (JSON Enviado)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                      Esta orden está lista para ser transferida a la plataforma de <strong>CJ Dropshipping</strong>. Tras la validación bancaria, el sistema generará automáticamente la ficha de impresión 4K (DTG/Sublimación), asignará el blank oversized correspondiente y enviará la orden a planta para empaque y despacho directo al cliente.
                    </p>

                    {selectedOrder.paymentStatus === 'paid' ? (
                      <button
                        onClick={handleManualDispatchToCj}
                        disabled={Boolean(dispatchingCjOrderId)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                      >
                        {dispatchingCjOrderId ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Transmitiendo Pedido a CJ Dropshipping...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Despachar Ahora a CJ Dropshipping (Fulfillment Inmediato)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>El despacho automático a CJ se activará una vez validado el comprobante de transferencia bancaria.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BANK TRANSFER RECEIPT VALIDATION CARD */}
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Validación de Transferencia Bancaria Directa</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedOrder.paymentReceipt ? 'Comprobante Registrado' : 'Sin Comprobante'}
                  </span>
                </div>

                {selectedOrder.paymentReceipt ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-[#0a0e17] p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">BANCO EMISOR:</span>
                        <strong className="text-white">{selectedOrder.paymentReceipt.bankName || (selectedOrder.paymentReceipt as any).senderBank || 'Banco'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Nº REFERENCIA:</span>
                        <strong className="text-amber-300">{selectedOrder.paymentReceipt.referenceNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">IMPORTE:</span>
                        <strong className="text-white">${selectedOrder.paymentReceipt.amount?.toFixed(2) || (selectedOrder.paymentReceipt as any).amountPaid?.toFixed(2) || selectedOrder.totalAmount.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">FECHA:</span>
                        <strong className="text-white">{selectedOrder.paymentReceipt.uploadedAt?.split('T')[0]}</strong>
                      </div>
                    </div>

                    {selectedOrder.paymentReceipt.receiptImageUrl && (
                      <div className="p-2 bg-[#0a0e17] rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={selectedOrder.paymentReceipt.receiptImageUrl}
                            alt="Comprobante"
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 cursor-pointer"
                            onClick={() => setShowReceiptImageModal(true)}
                          />
                          <span className="text-xs text-slate-300">Captura del comprobante bancario del cliente</span>
                        </div>
                        <button
                          onClick={() => setShowReceiptImageModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver Grande</span>
                        </button>
                      </div>
                    )}

                    {/* Auto CJ dispatch checkbox */}
                    {selectedOrder.paymentStatus !== 'paid' && (
                      <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-[#0a0e17] p-2.5 rounded-xl border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDispatchCjToggle}
                          onChange={e => setAutoDispatchCjToggle(e.target.checked)}
                          className="rounded border-slate-700 text-amber-400 focus:ring-0"
                        />
                        <span>Despachar automáticamente a <strong>CJ Dropshipping</strong> al dar clic en Aprobar</span>
                      </label>
                    )}

                    {/* Verification action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {selectedOrder.paymentStatus !== 'paid' ? (
                        <>
                          <button
                            onClick={() => handleVerifyReceipt(true)}
                            disabled={verifyingReceipt}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprobar Pago y Enviar a CJ Dropshipping</span>
                          </button>

                          <button
                            onClick={() => setShowRejectBox(!showRejectBox)}
                            disabled={verifyingReceipt}
                            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-all flex items-center justify-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Observar / Rechazar</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Transferencia Verificada & Aprobada por Administración FsGoD</span>
                        </div>
                      )}
                    </div>

                    {showRejectBox && (
                      <div className="p-3 bg-[#0a0e17] rounded-xl border border-rose-500/40 space-y-2">
                        <label className="text-xs font-bold text-rose-300">Motivo del rechazo u observación:</label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Ej: Monto incompleto / Comprobante no coincide con número de orden"
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                        <button
                          onClick={() => handleVerifyReceipt(false)}
                          disabled={verifyingReceipt}
                          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
                        >
                          Confirmar Rechazo y Notificar
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    El cliente aún no ha subido el comprobante de transferencia bancaria.
                  </p>
                )}
              </div>

              {/* Change Production Pipeline Stage Form */}
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300">Modificar Estado de Confección en Taller / CJ</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'tech_pack_review', label: '1. Revisión Tech Pack' },
                    { id: 'cutting_sublimation', label: '2. Sublimación POD (CJ / Taller)' },
                    { id: 'stitching_seals', label: '3. Confección & Termosellado' },
                    { id: 'quality_control', label: '4. Control de Calidad CJ' },
                    { id: 'dispatched', label: '5. En Courier Express' },
                    { id: 'delivered', label: '6. Entregado al Cliente' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setNewStatus(s.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        newStatus === s.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                          : 'bg-[#0a0e17] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-300">Notas de Taller & CJ Dropshipping</label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Ej: Archivos vectoriales aprobados. Estampado en vinilo mate completado."
                    className="mt-1 w-full p-2.5 rounded-xl bg-[#0a0e17] border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  {updating ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Estado de Orden</span>
                    </>
                  )}
                </button>
              </div>

              {/* Order Items Specification breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Especificaciones de las Prendas Oversized ({selectedOrder.items.length})
                </h4>

                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#0a192f]/60 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span className="font-mono text-amber-400">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>

                    {item.design && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-400">
                        <div>Pecho: <strong className="text-white">{item.design.frontText || 'FsGoD'}</strong></div>
                        <div>Dorsal: <strong className="text-white">#{item.design.backPlayerNumber || '10'} {item.design.backPlayerName}</strong></div>
                        <div>Talla: <strong className="text-white">{item.design.selectedSize}</strong></div>
                        <div>Técnica: <strong className="text-amber-400">{item.design.finishType}</strong></div>
                        <div>Colores: <strong className="text-white">{item.design.baseColor} / {item.design.secondaryColor}</strong></div>
                        <div>Emblema: <strong className="text-white">{item.design.frontLogoType}</strong></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="lg:col-span-7 p-12 bg-[#0a0e17] rounded-3xl border border-slate-800 text-center text-slate-500">
              Selecciona una orden de la lista para ver sus especificaciones técnicas y gestión con CJ Dropshipping.
            </div>
          )}

        </div>
      )}

      {/* ===================== TAB 2: CJ DROPSHIPPING CATALOG ===================== */}
      {activeAdminTab === 'cj_catalog' && (
        <div className="space-y-6">
          <div className="bg-[#0a0e17] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                <Box className="w-4 h-4" />
                <span>Sincronización Automatizada de Prendas Deportivas Oversized</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Catálogo de Blanks y Prendas POD en Almacén CJ</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prendas con corte drop-shoulder, gramajes pesados (240 a 420 GSM) y áreas preparadas para impresión digital 4K.
              </p>
            </div>

            <button
              onClick={handleSyncCjCatalog}
              disabled={syncingCjCatalog}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${syncingCjCatalog ? 'animate-spin' : ''}`} />
              <span>{syncingCjCatalog ? 'Sincronizando con CJ...' : 'Sincronizar Stock en Tiempo Real'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cjProducts.map((p, idx) => (
              <div key={idx} className="bg-[#0a0e17] rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-5 hover:border-amber-400/50 transition-all">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={p.imageUrl}
                    alt={p.productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-amber-400 font-bold">
                    {p.fabricGsm} GSM Heavyweight
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                    {p.stockQuantity.toLocaleString()} en Stock CJ
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>SKU: {p.sku}</span>
                    <span className="text-cyan-400 font-bold">PID: {p.cjPid}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{p.productName}</h3>
                  <p className="text-xs text-slate-400">{p.categoryName}</p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#0a192f] rounded-xl border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">COSTO BASE CJ:</span>
                      <strong className="text-slate-300">${p.baseCost.toFixed(2)} USD</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">PVP SUGERIDO FsGoD:</span>
                      <strong className="text-amber-400">${p.suggestedRetailPrice.toFixed(2)} USD</strong>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Zonas de Impresión POD:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.printAreaSpecs.map((spec, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: CJ SETTINGS & WEBHOOKS ===================== */}
      {activeAdminTab === 'cj_settings' && (
        <div className="bg-[#0a0e17] p-6 rounded-3xl border border-slate-800 space-y-6 max-w-4xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
              <Globe2 className="w-4 h-4" />
              <span>Conexión Técnica y Parámetros de la API CJ Dropshipping</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Credenciales & Configuración de Webhooks</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#0a192f] rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold">Estado del Endpoint Open API v2.0:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold">
                  CONECTADO & ACTIVO
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 break-all">{cjStatus?.apiEndpoint}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block">CUENTA CJ DROPSHIPPING:</span>
                <strong className="text-xs font-mono text-white">{cjStatus?.email}</strong>
              </div>
              <div className="p-4 bg-[#0a192f] rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block">MODO DE OPERACIÓN:</span>
                <strong className="text-xs font-mono text-amber-400">
                  {cjStatus?.sandboxMode ? 'Sandbox Simulator (Pruebas seguras)' : 'Producción en Vivo'}
                </strong>
              </div>
            </div>

            <div className="p-4 bg-[#0a192f] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">URL de Webhook para Actualizaciones de Envío en Tiempo Real:</span>
              <div className="p-2.5 bg-[#0a0e17] rounded-xl border border-slate-800 font-mono text-xs text-amber-400 select-all">
                https://ais-dev-wrtijlb35a3kv2r72q3lpt-667020250666.us-west2.run.app/api/cj/webhook/order-update
              </div>
              <p className="text-[11px] text-slate-400">
                Pega esta URL en el panel de desarrollador de CJ Dropshipping para recibir notificaciones inmediatas cuando el paquete pase a impresión, control de calidad o se asigne la guía del courier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Size Receipt */}
      {showReceiptImageModal && selectedOrder?.paymentReceipt?.receiptImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl max-w-lg w-full p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white">Comprobante de Pago - {selectedOrder.orderNumber}</h4>
              <button
                onClick={() => setShowReceiptImageModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Cerrar
              </button>
            </div>
            <img
              src={selectedOrder.paymentReceipt.receiptImageUrl}
              alt="Comprobante completo"
              referrerPolicy="no-referrer"
              className="max-h-[70vh] mx-auto rounded-xl object-contain border border-slate-800"
            />
            <div className="text-center">
              <button
                onClick={() => setShowReceiptImageModal(false)}
                className="px-6 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CJ POD Payload JSON Inspector */}
      {showCjPayloadModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0e17] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white font-mono">Payload Oficial de Confección POD Enviado a CJ Dropshipping</h4>
              </div>
              <button
                onClick={() => setShowCjPayloadModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono"
              >
                ✕ CERRAR
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(selectedOrder.cjPodPayload || {
                  orderNumber: selectedOrder.orderNumber,
                  recipient: selectedOrder.customerName,
                  address: selectedOrder.shippingAddress,
                  items: selectedOrder.items.map(i => ({
                    sku: `CJ-OVS-${i.productId}`,
                    size: i.design?.selectedSize || 'L',
                    quantity: i.quantity,
                    frontText: i.design?.frontText,
                    dorsal: `${i.design?.backPlayerName} #${i.design?.backPlayerNumber}`,
                    pantoneTheme: i.design?.pattern,
                  }))
                }, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCjPayloadModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-mono font-bold text-white hover:bg-slate-700"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live CJ Tracking Timeline */}
      {showCjTrackingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white font-mono">
                  Rastreo en Tiempo Real • CJ Logistics Global
                </h4>
              </div>
              <button
                onClick={() => setShowCjTrackingModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold font-mono"
              >
                ✕ CERRAR
              </button>
            </div>

            {fetchingTracking ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Consultando estado en servidores de CJ Dropshipping...</span>
              </div>
            ) : activeTrackingData ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#0a192f] rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nº DE GUÍA:</span>
                    <strong className="text-amber-400">{activeTrackingData.trackingNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TRANSPORTISTA:</span>
                    <strong className="text-white">{activeTrackingData.carrier}</strong>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                    Hitos de Confección & Tránsito Internacional
                  </span>

                  <div className="space-y-3 pl-4 border-l-2 border-cyan-500/30">
                    {activeTrackingData.milestones.map((m, mIdx) => (
                      <div key={mIdx} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#0a0e17]" />
                        <div className="flex items-center justify-between text-xs font-mono">
                          <strong className="text-cyan-300">{m.status}</strong>
                          <span className="text-slate-500 text-[10px]">{new Date(m.date).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300">{m.description}</p>
                        {m.location && (
                          <span className="text-[10px] font-mono text-slate-500 block">Ubicación: {m.location}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se pudo cargar la información de rastreo en este momento.
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowCjTrackingModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-mono font-bold text-white hover:bg-slate-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
