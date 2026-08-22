import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { cjDropshippingService } from './src/services/cjDropshippingService';
import { CjFulfillmentStatus, CjTrackingInfo } from './src/types';
import { FSGOD_MASTER_CATALOG, searchCatalog, findProductBySku } from './src/data/masterCatalog';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------- IN-MEMORY INITIAL DATA STORE -----------------

export interface BankTransferReceiptEntity {
  bankName: string;
  referenceNumber: string;
  senderName: string;
  amount: number;
  receiptImageUrl?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface CustomOrderEntity {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city: string;
  country: string;
  postalCode?: string;
  items: Array<{
    productId: string;
    productName: string;
    design: any;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  totalAmount: number;
  discountApplied: number;
  productionStatus: 'tech_pack_review' | 'cutting_sublimation' | 'stitching_seals' | 'quality_control' | 'dispatched' | 'delivered';
  productionStatusLabel: string;
  estimatedDelivery: string;
  createdAt: string;
  paymentStatus: 'paid' | 'authorized' | 'pending' | 'receipt_uploaded' | 'receipt_rejected';
  paymentMethod: string;
  paymentReceipt?: BankTransferReceiptEntity;
  techPackUrl?: string;
  adminNotes?: string;

  // CJ Dropshipping Fulfillment & Tracking Entity properties
  cjOrderId?: string;
  cjOrderNumber?: string;
  cjFulfillmentStatus?: CjFulfillmentStatus;
  cjDispatchedAt?: string;
  cjTrackingNumber?: string;
  cjCarrier?: string;
  cjTrackingUrl?: string;
  cjPodPayload?: any;
  cjTrackingInfo?: CjTrackingInfo;
}

// Initial Sample Orders in Production Pipeline reflecting FSGOD Trinity Brand and Bank Transfer Workflow
let customOrders: CustomOrderEntity[] = [
  {
    id: 'ord_fsgod_001',
    orderNumber: 'FSGOD-CUSTOM-8921',
    customerName: 'Pastor David & Club Guerreros de Fe',
    customerEmail: 'david.guerreros@fsgodathletics.org',
    customerPhone: '+34 612 890 321',
    shippingAddress: 'Av. Diagonal 482, Planta 3',
    city: 'Barcelona',
    country: 'España',
    items: [
      {
        productId: 'prod_jersey_apex',
        productName: 'FSGOD Apex Pro-Dry Jersey (Edición Santísima Trinidad)',
        unitPrice: 48.00,
        quantity: 18,
        subtotal: 864.00,
        design: {
          productId: 'prod_jersey_apex',
          productName: 'FSGOD Apex Pro-Dry Jersey',
          productCategory: 'jerseys',
          viewAngle: 'front',
          baseColor: '#0a0e17',
          secondaryColor: '#0a192f',
          accentColor: '#f59e0b',
          collarColor: '#0a192f',
          stitchingColor: '#f59e0b',
          pattern: 'trinity_radiance',
          fabricType: 'fs_dry_pro',
          collarStyle: 'v_neck',
          frontText: 'GUERREROS FC',
          frontNumber: '77',
          frontLogoType: 'holy_trinity_crest',
          sponsorText: 'DIOS POR DELANTE',
          backPlayerName: 'TRINIDAD',
          backPlayerNumber: '77',
          backMotto: 'FE EN MOVIMIENTO • TODO LO PUEDO',
          leftSleeveText: 'FSGOD TRINITY',
          rightSleeveBadge: 'trinity_badge',
          fontFamily: 'Impact Athletic',
          textColor: '#ffffff',
          textOutlineColor: '#f59e0b',
          hasTextOutline: true,
          selectedSize: 'L',
          quantity: 18,
          finishType: 'sublimation_4k',
          productionTier: 'standard',
        },
      },
    ],
    totalAmount: 777.60, // With 10% team kit discount
    discountApplied: 86.40,
    productionStatus: 'cutting_sublimation',
    productionStatusLabel: 'En Impresión y Sublimación Digital 4K',
    estimatedDelivery: '2026-08-20',
    createdAt: '2026-08-10T14:30:00Z',
    paymentStatus: 'paid',
    paymentMethod: 'Transferencia Bancaria Directa FSGOD',
    paymentReceipt: {
      bankName: 'Banco Santander (España)',
      referenceNumber: 'TRF-SANT-9842109',
      senderName: 'David Albarracín / Club Guerreros',
      amount: 777.60,
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      uploadedAt: '2026-08-10T14:45:00Z',
      verifiedAt: '2026-08-10T15:10:00Z',
      verifiedBy: 'Administración Taller FSGOD',
      notes: 'Transferencia IBAN confirmada en cuenta central. Ficha técnica autorizada para corte.',
    },
    cjOrderId: 'CJPOD-98412093',
    cjOrderNumber: 'CJ-FSG-8921-701',
    cjFulfillmentStatus: 'cj_in_production',
    cjDispatchedAt: '2026-08-10T15:15:00Z',
    cjTrackingNumber: 'CJPKT9841209381YQ',
    cjCarrier: 'CJ Packet Special Line / Correos Express',
    cjTrackingUrl: 'https://t.17track.net/en#nums=CJPKT9841209381YQ',
    adminNotes: 'Comprobante verificado con éxito. Orden despachada automáticamente a planta CJ Dropshipping (ID: CJPOD-98412093, Guía: CJPKT9841209381YQ).',
  },
  {
    id: 'ord_fsgod_002',
    orderNumber: 'FSGOD-CUSTOM-9044',
    customerName: 'Valeria Rivas (Atleta de Alto Rendimiento)',
    customerEmail: 'valeria.rivas@gmail.com',
    customerPhone: '+52 55 4912 7701',
    shippingAddress: 'Paseo de la Reforma 222',
    city: 'Ciudad de México',
    country: 'México',
    items: [
      {
        productId: 'prod_hoodie_flame_car',
        productName: 'FSGOD "Neon Blue Flame Rod" Tech Hoodie',
        unitPrice: 84.00,
        quantity: 1,
        subtotal: 84.00,
        design: {
          productId: 'prod_hoodie_flame_car',
          productName: 'FSGOD "Neon Blue Flame Rod" Tech Hoodie',
          productCategory: 'hoodies',
          viewAngle: 'front',
          baseColor: '#ffffff',
          secondaryColor: '#0a192f',
          accentColor: '#f59e0b',
          collarColor: '#0a192f',
          stitchingColor: '#00f0ff',
          pattern: 'solid_matte',
          fabricType: 'thermo_shield',
          collarStyle: 'crew',
          frontText: 'FE Y FUEGO',
          frontNumber: '07',
          frontLogoType: 'spirit_flame',
          sponsorText: 'ESPÍRITU SANTO',
          backPlayerName: 'RIVAS',
          backPlayerNumber: '07',
          backMotto: 'CORRO CON PROPÓSITO',
          leftSleeveText: 'FSGOD ELITE',
          rightSleeveBadge: 'trinity_badge',
          fontFamily: 'Cyber Sans',
          textColor: '#ffffff',
          textOutlineColor: '#0a192f',
          hasTextOutline: false,
          selectedSize: 'M',
          quantity: 1,
          finishType: 'sublimation_4k',
          productionTier: 'express_72h',
          graphicArtwork: 'blue_flame_car',
          graphicArtworkPlacement: 'front',
        },
      },
    ],
    totalAmount: 84.00,
    discountApplied: 0,
    productionStatus: 'quality_control',
    productionStatusLabel: 'Control de Calidad & Empaque de Lujo',
    estimatedDelivery: '2026-08-16',
    createdAt: '2026-08-12T16:20:00Z',
    paymentStatus: 'paid',
    paymentMethod: 'Transferencia Bancaria Directa FSGOD',
    paymentReceipt: {
      bankName: 'BBVA Bancomer',
      referenceNumber: 'SPEI-BBVA-551029',
      senderName: 'Valeria Rivas',
      amount: 84.00,
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      uploadedAt: '2026-08-12T16:30:00Z',
      verifiedAt: '2026-08-12T16:45:00Z',
      verifiedBy: 'Contabilidad FSGOD',
      notes: 'Pago validado. Sublimación 4K y termosellado finalizados con éxito.',
    },
    adminNotes: 'Inspección de costuras flatlock y ribete dorado superada al 100%. Empaque con sello de garantía.',
  },
  {
    id: 'ord_fsgod_003',
    orderNumber: 'FSGOD-CUSTOM-9102',
    customerName: 'Marcos Benítez (Comunidad Tri-Unity CrossFit)',
    customerEmail: 'marcos.benitez@triunity.org',
    customerPhone: '+1 (305) 910-4422',
    shippingAddress: 'Brickell Ave 1200, Suite 800',
    city: 'Miami, FL',
    country: 'Estados Unidos',
    items: [
      {
        productId: 'prod_hoodie_tokyo_navy',
        productName: 'FSGOD "Tokyo Shadow" Kanji Heritage Hoodie',
        unitPrice: 82.00,
        quantity: 2,
        subtotal: 164.00,
        design: {
          productId: 'prod_hoodie_tokyo_navy',
          productName: 'FSGOD "Tokyo Shadow" Kanji Heritage Hoodie',
          productCategory: 'hoodies',
          viewAngle: 'back',
          baseColor: '#0a192f',
          secondaryColor: '#0a0e17',
          accentColor: '#f59e0b',
          collarColor: '#0a192f',
          stitchingColor: '#f59e0b',
          pattern: 'solid_matte',
          fabricType: 'thermo_shield',
          collarStyle: 'crew',
          frontText: 'FSGOD',
          frontNumber: '03',
          frontLogoType: 'trinity_cross',
          sponsorText: 'DISCIPLINA Y SACRIFICIO',
          backPlayerName: 'BENÍTEZ',
          backPlayerNumber: '03',
          backMotto: 'PADRE • HIJO • ESPÍRITU',
          leftSleeveText: 'TRI-UNITY',
          rightSleeveBadge: 'trinity_badge',
          fontFamily: 'Bold Display',
          textColor: '#ffffff',
          textOutlineColor: '#0a192f',
          hasTextOutline: true,
          selectedSize: 'XL',
          quantity: 2,
          finishType: 'sublimation_4k',
          productionTier: 'standard',
          graphicArtwork: 'tokyo_kanji_crest',
          graphicArtworkPlacement: 'back',
        },
      },
    ],
    totalAmount: 164.00,
    discountApplied: 0,
    productionStatus: 'tech_pack_review',
    productionStatusLabel: 'Recepción & Verificación de Tech Pack',
    estimatedDelivery: '2026-08-22',
    createdAt: '2026-08-13T10:00:00Z',
    paymentStatus: 'receipt_uploaded',
    paymentMethod: 'Transferencia Bancaria Directa FSGOD',
    paymentReceipt: {
      bankName: 'Zelle / Chase Bank',
      referenceNumber: 'ZLL-903810239',
      senderName: 'Marcos Benitez',
      amount: 164.00,
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      uploadedAt: '2026-08-13T10:15:00Z',
      notes: 'Comprobante recibido por el cliente. Pendiente de verificación por el equipo de administración.',
    },
    adminNotes: 'Comprobante de transferencia Zelle recibido. Pendiente de cotejo en extracto bancario oficial.',
  },
];

// Helper: Lazy Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Could not initialize Gemini Client:', e);
    }
  }
  return geminiClient;
}

// In-memory like counters map
const productLikesMap: Record<string, number> = {};

// ----------------- API ROUTES -----------------

// Health check endpoint for container lifecycle
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'FSGOD Sportswear' });
});

// Like endpoint for products
app.post('/api/products/:id/like', (req, res) => {
  const { id } = req.params;
  const { liked } = req.body;
  if (!productLikesMap[id]) {
    productLikesMap[id] = 100;
  }
  if (liked) {
    productLikesMap[id] += 1;
  } else {
    productLikesMap[id] = Math.max(0, productLikesMap[id] - 1);
  }
  res.json({ success: true, productId: id, likesCount: productLikesMap[id] });
});

// 1. GET /api/orders - List all custom orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: customOrders });
});

// 2. GET /api/orders/:orderNumber - Lookup order by order number or email
app.get('/api/orders/:orderNumber', (req, res) => {
  const query = req.params.orderNumber.trim().toUpperCase();
  const order = customOrders.find(
    o => o.orderNumber.toUpperCase() === query || o.customerEmail.toLowerCase() === req.params.orderNumber.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ success: false, message: `No se encontró la orden ${query}.` });
  }

  res.json({ success: true, order });
});

// 3. POST /api/orders/create - Submit customized sportswear order
app.post('/api/orders/create', (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, city, country, items, paymentMethod, paymentReceipt } = req.body;

  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Datos incompletos para procesar la orden de personalización.' });
  }

  const rawSubtotal = items.reduce((acc: number, it: any) => acc + (it.unitPrice * (it.quantity || 1)), 0);
  const totalQty = items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);

  // Bulk Discount calculation:
  // 5-11 units: 5% OFF | 12-24 units: 10% OFF | 25+ units: 18% OFF
  let discountPercent = 0;
  if (totalQty >= 25) discountPercent = 0.18;
  else if (totalQty >= 12) discountPercent = 0.10;
  else if (totalQty >= 5) discountPercent = 0.05;

  const discountAmount = +(rawSubtotal * discountPercent).toFixed(2);
  const totalAmount = +(rawSubtotal - discountAmount).toFixed(2);

  const orderNum = `FSGOD-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;

  // Estimated delivery: 7 days standard or 3 days express
  const hasExpress = items.some((it: any) => it.design?.productionTier === 'express_72h');
  const deliveryDays = hasExpress ? 3 : 7;
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + deliveryDays);

  const newOrder: CustomOrderEntity = {
    id: `ord_${Date.now()}`,
    orderNumber: orderNum,
    customerName: customerName.trim(),
    customerEmail: customerEmail.toLowerCase().trim(),
    customerPhone: customerPhone || '+34 600 000 000',
    shippingAddress: shippingAddress || 'Dirección de Entrega Principal',
    city: city || 'Ciudad',
    country: country || 'Internacional',
    items,
    totalAmount,
    discountApplied: discountAmount,
    productionStatus: 'tech_pack_review',
    productionStatusLabel: 'Recepción & Verificación de Tech Pack',
    estimatedDelivery: estDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    paymentStatus: paymentReceipt ? 'receipt_uploaded' : 'pending',
    paymentMethod: paymentMethod || 'Transferencia Bancaria Directa FSGOD',
    paymentReceipt: paymentReceipt ? {
      ...paymentReceipt,
      uploadedAt: paymentReceipt.uploadedAt || new Date().toISOString(),
    } : undefined,
    adminNotes: paymentReceipt 
      ? `Comprobante de transferencia bancaria adjuntado (${paymentReceipt.bankName} Ref: ${paymentReceipt.referenceNumber}). Pendiente de validación manual en taller.`
      : 'Orden registrada. Esperando comprobante de transferencia bancaria para iniciar corte.',
  };

  customOrders.unshift(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: `¡Orden ${orderNum} confirmada con éxito! Tu prenda personalizada ha ingresado al sistema de confección FSGOD.`,
  });
});

// 4. POST /api/orders/:id/upload-receipt - Upload / update bank transfer receipt
app.post('/api/orders/:id/upload-receipt', (req, res) => {
  const { id } = req.params;
  const { 
    bankName, 
    senderBank, 
    referenceNumber, 
    senderName, 
    amount, 
    amountPaid, 
    receiptImageUrl, 
    notes 
  } = req.body;

  const order = customOrders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
  }

  const effectiveBank = bankName || senderBank || 'Transferencia Bancaria Directa';
  const effectiveRef = referenceNumber || `REF-${Date.now()}`;
  const effectiveAmount = amount || amountPaid || order.totalAmount;

  order.paymentReceipt = {
    bankName: effectiveBank,
    referenceNumber: effectiveRef,
    senderName: senderName || order.customerName,
    amount: effectiveAmount,
    receiptImageUrl: receiptImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    uploadedAt: new Date().toISOString(),
    notes: notes || 'Comprobante adjuntado por el cliente para validación manual.',
  };

  order.paymentStatus = 'receipt_uploaded';
  order.adminNotes = `Comprobante de transferencia recibido (${effectiveBank}, Ref: ${effectiveRef}). En cola de validación manual por administración.`;

  res.json({
    success: true,
    order,
    message: 'Comprobante de transferencia bancaria recibido correctamente. Nuestro taller lo validará a la brevedad.',
  });
});

// 5. PATCH /api/orders/:id/verify-receipt - Verify or reject bank transfer receipt (Admin) with optional CJ Dropshipping automated fulfillment
app.patch('/api/orders/:id/verify-receipt', async (req, res) => {
  const { id } = req.params;
  const { isApproved, verificationNotes, autoDispatchCj } = req.body;

  const order = customOrders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
  }

  if (isApproved) {
    order.paymentStatus = 'paid';
    if (order.paymentReceipt) {
      order.paymentReceipt.verifiedAt = new Date().toISOString();
      order.paymentReceipt.verifiedBy = 'Administración Central FSGOD';
      order.paymentReceipt.notes = verificationNotes || 'Transferencia cotejada y aprobada en cuenta bancaria oficial.';
    }
    
    // Auto-dispatch to CJ Dropshipping if requested or enabled
    if (autoDispatchCj || order.cjFulfillmentStatus === 'pending_dispatch') {
      try {
        const cjResult = await cjDropshippingService.dispatchOrderToCj(order as any);
        order.cjOrderId = cjResult.cjOrderId;
        order.cjOrderNumber = cjResult.cjOrderNumber;
        order.cjFulfillmentStatus = 'cj_in_production';
        order.cjDispatchedAt = cjResult.dispatchedAt;
        order.cjTrackingNumber = cjResult.trackingNumber;
        order.cjCarrier = cjResult.carrier;
        order.cjTrackingUrl = `https://t.17track.net/en#nums=${cjResult.trackingNumber}`;
        order.cjPodPayload = cjResult.rawPayload;
        order.cjTrackingInfo = cjDropshippingService.getTrackingInfo(cjResult.cjOrderId, cjResult.trackingNumber, order.orderNumber);
        
        order.productionStatus = 'cutting_sublimation';
        order.productionStatusLabel = 'En Confección & Sublimación POD (CJ Dropshipping)';
        order.adminNotes = `Pago verificado al 100%. Orden enviada automáticamente a CJ Dropshipping (ID: ${cjResult.cjOrderId}, Guía: ${cjResult.trackingNumber}). ${verificationNotes || ''}`;
      } catch (err: any) {
        order.adminNotes = `Pago verificado. Nota CJ: Error al despachar (${err?.message}). Requiere reintento manual.`;
      }
    } else {
      order.adminNotes = `Pago verificado al 100%. Orden lista para manufactura o despacho a CJ Dropshipping. ${verificationNotes || ''}`;
      if (order.productionStatus === 'tech_pack_review') {
        order.productionStatus = 'cutting_sublimation';
        order.productionStatusLabel = 'En Impresión y Sublimación Digital 4K';
      }
    }
  } else {
    order.paymentStatus = 'receipt_rejected';
    if (order.paymentReceipt) {
      order.paymentReceipt.notes = verificationNotes || 'El comprobante no coincide con el importe o el número de referencia no fue localizado.';
    }
    order.adminNotes = `Comprobante observado o rechazado: ${verificationNotes || 'Favor de reenviar comprobante válido.'}`;
  }

  res.json({
    success: true,
    order,
    message: isApproved 
      ? `Comprobante de la orden ${order.orderNumber} verificado con éxito.${order.cjOrderId ? ` Despachado a CJ Dropshipping (${order.cjOrderId}).` : ''}`
      : `Comprobante de la orden ${order.orderNumber} marcado como pendiente de corrección.`,
  });
});

// ----------------- CJ DROPSHIPPING INTEGRATION ENDPOINTS -----------------

// CJ-1. GET /api/cj/status - Check API configuration and connection
app.get('/api/cj/status', (req, res) => {
  const status = cjDropshippingService.getStatus();
  res.json({ success: true, status });
});

// CJ-2. GET /api/cj/products - List synchronized oversized customizable sportswear
app.get('/api/cj/products', (req, res) => {
  const data = cjDropshippingService.getSyncedCatalog();
  res.json({ success: true, ...data });
});

// CJ-3. POST /api/cj/sync-catalog - Trigger real-time inventory and pricing sync with CJ
app.post('/api/cj/sync-catalog', async (req, res) => {
  try {
    const result = await cjDropshippingService.syncCatalog();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Error sincronizando con CJ Dropshipping: ${err?.message}` });
  }
});

// CJ-4. POST /api/cj/orders/dispatch/:id - Dispatch verified order to CJ Dropshipping for POD fulfillment
app.post('/api/cj/orders/dispatch/:id', async (req, res) => {
  const { id } = req.params;
  const order = customOrders.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada para despacho.' });
  }

  if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'authorized') {
    return res.status(400).json({
      success: false,
      message: `No se puede despachar la orden ${order.orderNumber} a CJ Dropshipping porque el pago aún no ha sido verificado (Estado actual: ${order.paymentStatus}).`,
    });
  }

  try {
    const cjResult = await cjDropshippingService.dispatchOrderToCj(order as any);
    
    order.cjOrderId = cjResult.cjOrderId;
    order.cjOrderNumber = cjResult.cjOrderNumber;
    order.cjFulfillmentStatus = 'cj_in_production';
    order.cjDispatchedAt = cjResult.dispatchedAt;
    order.cjTrackingNumber = cjResult.trackingNumber;
    order.cjCarrier = cjResult.carrier;
    order.cjTrackingUrl = `https://t.17track.net/en#nums=${cjResult.trackingNumber}`;
    order.cjPodPayload = cjResult.rawPayload;
    order.cjTrackingInfo = cjDropshippingService.getTrackingInfo(cjResult.cjOrderId, cjResult.trackingNumber, order.orderNumber);
    
    order.productionStatus = 'cutting_sublimation';
    order.productionStatusLabel = 'En Confección & Sublimación POD (CJ Dropshipping)';
    order.adminNotes = `Orden enviada a planta CJ Dropshipping. ID CJ: ${cjResult.cjOrderId} | Guía: ${cjResult.trackingNumber} | Transporte: ${cjResult.carrier}`;

    res.json({
      success: true,
      order,
      cjResult,
      message: `¡Orden ${order.orderNumber} despachada con éxito a CJ Dropshipping! ID Asignado: ${cjResult.cjOrderId}`,
    });
  } catch (err: any) {
    order.cjFulfillmentStatus = 'cj_error';
    res.status(500).json({ success: false, message: `Fallo al despachar a CJ Dropshipping: ${err?.message}` });
  }
});

// CJ-5. GET /api/cj/orders/:id/tracking - Fetch live tracking details from CJ Dropshipping
app.get('/api/cj/orders/:id/tracking', (req, res) => {
  const { id } = req.params;
  const order = customOrders.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
  }

  const tracking = cjDropshippingService.getTrackingInfo(
    order.cjOrderId || 'CJPOD-SAMPLE-99',
    order.cjTrackingNumber,
    order.orderNumber
  );

  order.cjTrackingInfo = tracking;
  res.json({ success: true, tracking, orderNumber: order.orderNumber });
});

// CJ-6. POST /api/cj/webhook/order-update - Webhook receiver for CJ status notifications
app.post('/api/cj/webhook/order-update', (req, res) => {
  const { cjOrderId, status, trackingNumber, carrier, message } = req.body;

  const order = customOrders.find(o => o.cjOrderId === cjOrderId || o.orderNumber === req.body.orderNumber);
  if (order) {
    if (status) {
      if (status === 'SHIPPED') {
        order.productionStatus = 'dispatched';
        order.productionStatusLabel = 'En Ruta de Entrega (Courier Express CJ)';
        order.cjFulfillmentStatus = 'cj_shipped';
      } else if (status === 'DELIVERED') {
        order.productionStatus = 'delivered';
        order.productionStatusLabel = 'Entregado al Cliente Final';
        order.cjFulfillmentStatus = 'cj_delivered';
      }
    }
    if (trackingNumber) order.cjTrackingNumber = trackingNumber;
    if (carrier) order.cjCarrier = carrier;
    if (message) order.adminNotes = `Webhook CJ (${new Date().toLocaleTimeString()}): ${message}`;
  }

  res.json({ success: true, received: true, timestamp: new Date().toISOString() });
});

// 6. PATCH /api/orders/:id/status - Update production pipeline status (Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const order = customOrders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada' });
  }

  const labelsMap: Record<string, string> = {
    tech_pack_review: 'Recepción & Verificación de Tech Pack',
    cutting_sublimation: 'En Impresión y Sublimación Digital 4K',
    stitching_seals: 'Confección, Costura Flatlock & Termosellado',
    quality_control: 'Control de Calidad & Empaque de Lujo',
    dispatched: 'En Ruta de Entrega (Courier Express)',
    delivered: 'Entregado al Atleta / Club',
  };

  if (status && labelsMap[status]) {
    order.productionStatus = status;
    order.productionStatusLabel = labelsMap[status];
  }
  if (adminNotes !== undefined) {
    order.adminNotes = adminNotes;
  }

  res.json({ success: true, order, message: `Estado de la orden ${order.orderNumber} actualizado a ${order.productionStatusLabel}.` });
});

// 5. POST /api/customizer/ai-generate-concept - AI Athletic Designer using Gemini
app.post('/api/customizer/ai-generate-concept', async (req, res) => {
  const { teamName, sport, vibe, preferredColors, targetItem } = req.body;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Actúa como el Diseñador Jefe y Director Creativo de la prestigiosa marca de ropa deportiva FSGOD.
El cliente desea crear una equipación deportiva personalizada de alta gama para:
- Nombre del Equipo / Atleta: ${teamName || 'FSGOD Valkyries'}
- Deporte: ${sport || 'Fútbol / Running / Crossfit'}
- Vibra / Estilo deseado: ${vibe || 'Cyberpunk, agresivo, elegante, de alto rendimiento'}
- Colores preferidos: ${preferredColors || 'Negro mate, azul cian neón, detalles dorados'}
- Prenda base: ${targetItem || 'Camiseta Apex Pro-Dry'}

Genera una propuesta de diseño premium en formato JSON estructurado con:
{
  "teamName": "${teamName || 'FSGOD Valkyries'}",
  "motto": "Frase de guerra / lema motivacional potente en mayúsculas (ej. FORGED IN VICTORY)",
  "recommendedColors": {
    "primary": "#hexCode",
    "secondary": "#hexCode",
    "accent": "#hexCode"
  },
  "suggestedPattern": "carbon_hex" | "circuit_mesh" | "speed_gradient" | "camo_tech" | "diamond_grid" | "solid_matte",
  "typographyStyle": "Impact Athletic" | "Cyber Sans" | "Futuristic Mono" | "Bold Display",
  "conceptStory": "Breve narrativa de 2-3 frases inspirada en la fuerza y velocidad del equipo.",
  "badgeConcept": "Descripción del escudo o emblema frontal (ej. Escudo geométrico con alas de titanio y rayos de energía)."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({ success: true, concept: parsed });
    } catch (err: any) {
      console.warn('Gemini AI design concept error, falling back to preset:', err?.message);
    }
  }

  // High quality heuristic fallback
  const fallbackPresets: Record<string, any> = {
    soccer: {
      teamName: teamName || 'FSGOD Titanium FC',
      motto: 'FEAR NO EMPIRE • RULE THE PITCH',
      recommendedColors: { primary: '#0f172a', secondary: '#00f0ff', accent: '#f59e0b' },
      suggestedPattern: 'carbon_hex',
      typographyStyle: 'Impact Athletic',
      conceptStory: 'Inspirado en la armadura biomecánica moderna: cortes angulares y ventilación hiperbólica para dominar los 90 minutos con velocidad supersónica.',
      badgeConcept: 'Escudo heráldico facetado con dos alas de halcón y corona de grafeno.',
    },
    running: {
      teamName: teamName || 'FSGOD Cyber Runners',
      motto: 'BREAK THE SPEED OF THOUGHT',
      recommendedColors: { primary: '#09090b', secondary: '#38bdf8', accent: '#e11d48' },
      suggestedPattern: 'speed_gradient',
      typographyStyle: 'Cyber Sans',
      conceptStory: 'Diseñado para romper barreras aerodinámicas. Líneas de flujo cinético que reflejan la luz en cada zancada nocturna.',
      badgeConcept: 'Rayo doble en ángulo de 45 grados encapsulado en un hexágono de carbono.',
    },
    crossfit: {
      teamName: teamName || 'FSGOD Iron Vanguard',
      motto: 'UNBROKEN WILL • FORGED IN STEEL',
      recommendedColors: { primary: '#18181b', secondary: '#ea580c', accent: '#fbbf24' },
      suggestedPattern: 'diamond_grid',
      typographyStyle: 'Bold Display',
      conceptStory: 'Estructurado con tramas de diamante para resistir abrasión extrema, peso y fricción sin perder transpirabilidad.',
      badgeConcept: 'Monograma FSGOD entrelazado con una cabeza de león geométrica de acero templado.',
    },
  };

  const selectedFallback = fallbackPresets[sport] || fallbackPresets['soccer'];
  res.json({ success: true, concept: selectedFallback, isFallback: true });
});

// 6. POST /api/customizer/tech-pack - Generate official manufacturing specifications
app.post('/api/customizer/tech-pack', (req, res) => {
  const { design } = req.body;

  if (!design) {
    return res.status(400).json({ success: false, message: 'Se requiere la configuración de diseño para generar el Tech-Pack.' });
  }

  const techPack = {
    techPackId: `TP-FSGOD-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toISOString(),
    garment: {
      name: design.productName,
      category: design.productCategory,
      fabricBlend: design.fabricType === 'fs_dry_pro' ? '88% Polyester Micro-Mesh / 12% Spandex (160 GSM)' : '92% Poly-Interlock / 8% Elastane (220 GSM)',
      patternType: design.pattern,
      collarConstruction: design.collarStyle || 'Ergonomic V-Neck Flat Rib',
    },
    colorPalettePantone: [
      { role: 'Base Body', hex: design.baseColor, pantoneRef: 'FS-PANTONE-01' },
      { role: 'Secondary Panels', hex: design.secondaryColor, pantoneRef: 'FS-PANTONE-02' },
      { role: 'Accents & Trim', hex: design.accentColor, pantoneRef: 'FS-PANTONE-03' },
      { role: 'Collar Rib', hex: design.collarColor, pantoneRef: 'FS-PANTONE-04' },
      { role: 'Flatlock Stitching', hex: design.stitchingColor, pantoneRef: 'FS-PANTONE-05' },
    ],
    printPlacements: [
      {
        zone: 'Chest Center',
        type: 'Team Name / Primary Vector',
        text: design.frontText || 'FSGOD',
        dimensions: '28cm x 7cm',
        technique: 'Sublimación Digital Ultra-HD 300DPI',
      },
      {
        zone: 'Front Left Crest',
        type: 'Official Badge',
        emblem: design.frontLogoType,
        dimensions: '8cm x 8cm',
        technique: 'Escudo Termosellado 3D Siliconado',
      },
      {
        zone: 'Back Upper',
        type: 'Player Name',
        text: design.backPlayerName || 'FSGOD',
        fontFamily: design.fontFamily,
        dimensions: '30cm x 6cm',
        technique: 'Vinilo Térmico Mate Anti-Pelado',
      },
      {
        zone: 'Back Center',
        type: 'Dorsal Number',
        number: design.backPlayerNumber || '10',
        dimensions: '24cm x 18cm',
        technique: 'Sublimación Directa con Borde Reforzado',
      },
      {
        zone: 'Lower Back Hem',
        type: 'Team Slogan / Motto',
        text: design.backMotto || 'ENGINEERED FOR GODS',
        dimensions: '18cm x 2cm',
        technique: 'Estampado Reflectante 3M Micro-Silver',
      },
    ],
    qualityStandards: [
      'Resistencia al lavado: Grado 4-5 (ISO 105-C06)',
      'Solidez del color a la luz UV: Grado 5 (ISO 105-B02)',
      'Elasticidad y recuperación de forma: > 96% tras 50 ciclos',
      'Etiqueta interna estampada (Tagless) libre de picazón',
    ],
  };

  res.json({ success: true, techPack });
});

// ----------------- FSGOD MASTER CATALOG & AI ASSISTANT ENDPOINTS -----------------

// 7. GET /api/master-catalog - Fetch full 37+ Master Catalog with live margin calculations
app.get('/api/master-catalog', (req, res) => {
  const { search, category } = req.query;
  let results = FSGOD_MASTER_CATALOG;

  if (category && category !== 'all') {
    results = results.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    results = searchCatalog(search);
  }

  res.json({
    success: true,
    count: results.length,
    products: results,
    businessRule: 'Precio Final = Costo Base * 1.40 (+40% margen)',
  });
});

// 8. GET /api/master-catalog/:sku - Fetch single product by exact SKU
app.get('/api/master-catalog/:sku', (req, res) => {
  const product = findProductBySku(req.params.sku);
  if (!product) {
    return res.status(404).json({ success: false, message: `SKU '${req.params.sku}' no encontrado en el Catálogo Maestro FsGoD.` });
  }
  res.json({ success: true, product });
});

// 9. POST /api/fsgod-ai/chat - Official FsGoD AI Assistant & Experience Manager (Valeria FsGoD)
app.post('/api/fsgod-ai/chat', async (req, res) => {
  const { message, conversationHistory, currentSku } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Se requiere un mensaje para el asistente FsGoD.' });
  }

  // Pre-fetch related products for context injection
  const matchedProducts = searchCatalog(message);
  const activeProduct = currentSku ? findProductBySku(currentSku) : undefined;

  const catalogContextSummary = FSGOD_MASTER_CATALOG.map(p => 
    `• SKU: ${p.sku} | ${p.name} | Cat: ${p.categoryLabel} | Costo Base: $${p.baseCostCop.toLocaleString('es-CO')} COP | Venta Final (+40%): $${p.retailPriceCop.toLocaleString('es-CO')} COP | Ref. Mercado: $${p.competitorPriceCop.toLocaleString('es-CO')} COP | Ahorro: $${p.customerSavingsCop.toLocaleString('es-CO')} COP | Stock: ${p.stockQuantity} un (${p.stockLocation})`
  ).join('\n');

  const systemInstruction = `Eres la Asistente Oficial y Gerente de Experiencia de Cliente de "FsGoD", una prestigiosa y exclusiva marca de streetwear, moda urbana y réplicas deportivas de alto nivel.
Interactúas EXCLUSIVAMENTE en español colombiano con una voz femenina joven, cálida, alegre, enérgica y con un marcado y auténtico acento de Barranquilla ("mi amor", "al pelo", "la plena", "nojoda", "bacano", "puro piquete", "corazón", "rey/reina", "cuadro").
Equilibras una cordialidad caribeña arrolladora con una ejecución de negocios impecable y ultra precisa.

REGLAS DE NEGOCIO Y LÓGICA ESTRICTA DE FSGOD:
1. PRECIOS Y MÁRGENES MATEMÁTICOS OBLIGATORIOS:
   - Cada prenda tiene un Precio de Compra / Costo Base.
   - El margen estándar de FsGoD es exactamente un +40% ADICIONAL sobre el costo base (Precio Final de Venta = Costo Base * 1.40).
   - Dispones de precios de referencia de la competencia / internet en el catálogo para demostrar el gran valor y ahorro de FsGoD.
   - Si el cliente te pregunta por precios, desglose de costos o márgenes de ganancia, explica con total transparencia la fórmula del 40%.
2. INTEGRIDAD DEL CATÁLOGO MAESTRO (35+ SKUs VERIFICADOS):
   - Siempre referencia los SKUs exactos de FsGoD (ej. FSG-JER-02, FSG-JKT-01, FSG-HDY-01, FSG-TEE-01, FSG-BAG-01, FSG-SET-01, etc.).
   - NUNCA inventes precios, referencias o productos que no estén en la base de datos oficial.
3. LOGÍSTICA & DESPACHOS COLOMBIA:
   - Domicilios en Barranquilla: entrega el mismo día o 24h.
   - Envíos a Bogotá, Medellín, Cali y todo el país: 2 a 3 días hábiles vía Interrapidísimo / Servientrega.
   - Medios de pago oficiales: Nequi, Daviplata, Bancolombia Transferencia / QR, Zelle® Chase USA (a nombre de CLTV.DATA LLC, ID xxxxxx8471) y Pago Contraentrega Nacional.
   - Envíos GRATIS por compras superiores a $200.000 COP.
4. CIERRE Y PEDIDOS POR WHATSAPP:
   - Si el cliente desea comprar o separar prendas, ofrécele armar el pedido oficial y generar el resumen para enviarlo directamente a la línea oficial de WhatsApp FsGoD (+57 318 780 1140).

CATÁLOGO MAESTRO OFICIAL DE FSGOD DISPONIBLE:
${catalogContextSummary}

Responde siempre en primera persona como Valeria, Asesora de FsGoD, de forma muy estructurada, agradable, con emojis urbanos acordes y ofreciendo el siguiente paso de compra.`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Build conversation prompt
      let contentsPrompt = '';
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        contentsPrompt += 'Historial previo de la conversación:\n';
        for (const turn of conversationHistory.slice(-6)) {
          contentsPrompt += `${turn.sender === 'user' ? 'Cliente' : 'Valeria FsGoD'}: ${turn.text}\n`;
        }
        contentsPrompt += '\n';
      }
      contentsPrompt += `Cliente actual dice: "${message}"`;
      if (activeProduct) {
        contentsPrompt += `\n[Nota del sistema: El cliente está viendo actualmente el SKU ${activeProduct.sku} - ${activeProduct.name}]`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contentsPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || '¡Epale mi amor! Aquí estoy al pelo para colaborarte con cualquier prenda o precio del catálogo FsGoD.';

      return res.json({
        success: true,
        reply,
        matchedProducts: matchedProducts.slice(0, 3),
        activeProduct,
      });
    } catch (err: any) {
      console.warn('Gemini Assistant chat error, switching to Barranquilla smart fallback:', err?.message);
    }
  }

  // Smart Heuristic Fallback in authentic Barranquillera voice with full catalog knowledge
  const lower = message.toLowerCase();
  let fallbackReply = '';
  let related: typeof FSGOD_MASTER_CATALOG = [];

  // Check for SKU mentions
  const skuMatch = message.match(/FSG-[A-Z]{3}-\d{2}/i);
  if (skuMatch) {
    const found = findProductBySku(skuMatch[0]);
    if (found) {
      related = [found];
      fallbackReply = `¡Ay mi amor, excelente gusto! El SKU **${found.sku}** (${found.name}) está una belleza total, ¡puro piquete currambero! 🔥\n\n` +
        `• **Costo Base de Compra**: $${found.baseCostCop.toLocaleString('es-CO')} COP\n` +
        `• **Margen Oficial FsGoD**: +40% de ganancia reglamentaria\n` +
        `• **Precio Final Oficial de Venta**: **$${found.retailPriceCop.toLocaleString('es-CO')} COP**\n` +
        `• **Precio en el Mercado / Internet**: ~$${found.competitorPriceCop.toLocaleString('es-CO')} COP (¡Te estás ahorrando $${found.customerSavingsCop.toLocaleString('es-CO')} COP, la plena!)\n` +
        `• **Disponibilidad**: ${found.stockQuantity} unidades en ${found.stockLocation}.\n` +
        `• **Tallas**: ${found.sizes.join(', ')} | **Material**: ${found.fabricTech[0]}.\n\n` +
        `¿Te la separo ya mismo en tu talla o te armo el pedido directo para enviártelo por WhatsApp, corazón?`;
    }
  }

  if (!fallbackReply) {
    if (lower.includes('jersey') || lower.includes('junior') || lower.includes('futbol') || lower.includes('colombia') || lower.includes('nba')) {
      related = FSGOD_MASTER_CATALOG.filter(p => p.category === 'jerseys').slice(0, 3);
      fallbackReply = `¡Nojoda mi amor, qué elegancia! En jerseys tenemos puro nivel de campeonato. 🔥\n\n` +
        `Mira estos favoritos del momento:\n` +
        `1. **FSG-JER-02**: Jersey Retro Junior 1993 Pibe ($119.000 COP con el 40% aplicado sobre costo de $85.000).\n` +
        `2. **FSG-JER-01**: Jersey Apex Pro-Dry Curramba ($91.000 COP con 40% sobre costo de $65.000).\n` +
        `3. **FSG-JER-05**: Jersey Retro Selección Colombia 1990 ($119.000 COP).\n\n` +
        `Todos vienen con sublimación 4K y tela transpirable FS-Dry. ¿Cuál te medimos, mi rey?`;
    } else if (lower.includes('hoodie') || lower.includes('sudadera') || lower.includes('buzo')) {
      related = FSGOD_MASTER_CATALOG.filter(p => p.category === 'hoodies').slice(0, 3);
      fallbackReply = `¡Uff mi reina/mi rey! Los hoodies de FsGoD son puro gramaje pesado de 380 GSM en French Terry, ¡nada de telas flojas!\n\n` +
        `• **FSG-HDY-01**: Hoodie "Street Rebel Bear" Graffitero ($168.000 COP, costo base $120.000 + 40% margen).\n` +
        `• **FSG-HDY-02**: Hoodie "Brooklyn Raw" Acid Wash ($165.200 COP).\n` +
        `• **FSG-HDY-03**: Hoodie "Neon Blue Flame Rod" ($154.000 COP).\n\n` +
        `Están al pelo y con horma oversized que se ve espectacular. ¿Te gustaría ver las fotos o agregarlo a tu carrito?`;
    } else if (lower.includes('margen') || lower.includes('40') || lower.includes('precio') || lower.includes('costo') || lower.includes('ganancia')) {
      fallbackReply = `¡Claro que sí, mi amor! En FsGoD somos 100% transparentes con la matemática del negocio:\n\n` +
        `📐 **Fórmula Oficial de Precios**: \n` +
        `**Precio Final de Venta = Precio de Compra Base * 1.40 (+40% de margen)**\n\n` +
        `Por ejemplo:\n` +
        `• Camiseta 19868 (FSG-TEE-01): Costo $60.000 COP ➔ Venta Final: **$84.000 COP** (Ganancia neta: $24.000 COP).\n` +
        `• Jersey Junior 1993 (FSG-JER-02): Costo $85.000 COP ➔ Venta Final: **$119.000 COP** (Ganancia neta: $34.000 COP).\n` +
        `• Set 3559 Techwear (FSG-SET-01): Costo $170.000 COP ➔ Venta Final: **$238.000 COP** (Ganancia neta: $68.000 COP).\n\n` +
        `¡Así garantizamos la máxima calidad de confección con precios más económicos que las tiendas de internet! ¿Qué SKU quieres cotizar?`;
    } else if (lower.includes('envio') || lower.includes('domicilio') || lower.includes('barranquilla') || lower.includes('bogota') || lower.includes('pago')) {
      fallbackReply = `¡Todo está al pelo mi amor! Hacemos despachos a toda Colombia con los mejores tiempos:\n\n` +
        `📦 **Barranquilla & Soledad**: Domicilio express el mismo día ($8.000 COP).\n` +
        `🚚 **Bogotá, Medellín, Cali & Nacional**: 2-3 días hábiles ($14.000 - $15.000 COP).\n` +
        `✨ **¡Envío GRATIS por compras superiores a $200.000 COP!**\n\n` +
        `💳 **Medios de Pago**: Nequi, Daviplata, Bancolombia (QR/Transferencia) y Pago Contraentrega Nacional. ¿Para qué ciudad va tu pedido, corazón?`;
    } else {
      fallbackReply = `¡Epale mi amor! ¡Bienvenido a FsGoD! Soy Valeria, tu Asesora y Gerente de Experiencia directa desde Curramba la Bella. 🌴🔥\n\n` +
        `Aquí todo lo tenemos al pelo:\n` +
        `• **Catálogo Maestro**: Más de 35 referencias exclusivas en Jerseys, Hoodies 380 GSM, Chaquetas Bomber, Camisetas Boxy 90s, Bolsos Tácticos y Sets Urbanos.\n` +
        `• **Precios Transparentes**: Regla del +40% de margen sobre costo base (¡mucho más económico que en centros comerciales!).\n` +
        `• **Despachos Inmediatos**: Desde bodega Barranquilla y Bogotá para todo el país.\n\n` +
        `Dime qué prenda andas buscando o qué SKU te cotizo ya mismito, mi rey/reina.`;
    }
  }

  res.json({
    success: true,
    reply: fallbackReply,
    matchedProducts: related.length > 0 ? related : matchedProducts.slice(0, 3),
    activeProduct,
    isFallback: true,
  });
});


// ----------------- VITE MIDDLEWARE & STATIC SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FSGOD Sportswear & Custom Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
