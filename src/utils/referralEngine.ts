import { ReferralStats, UnlockedCoupon, ProductItem } from '../types';

const STORAGE_KEYS = {
  USER_REF_CODE: 'fsgod_user_referral_code',
  LIKED_PRODUCTS: 'fsgod_liked_products',
  PRODUCT_LIKES_MAP: 'fsgod_product_likes_map',
  REFERRAL_STATS: 'fsgod_referral_stats',
  INCOMING_REFERRER: 'fsgod_incoming_referrer',
  UNLOCKED_COUPONS: 'fsgod_unlocked_coupons',
};

// Generate an elegant, memorable personal referral code (e.g. FSG-FE-7482)
export function getUserReferralCode(): string {
  if (typeof window === 'undefined') return 'FSG-FE-777';
  
  let code = localStorage.getItem(STORAGE_KEYS.USER_REF_CODE);
  if (!code) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    code = `FSG-FE-${randomDigits}`;
    localStorage.setItem(STORAGE_KEYS.USER_REF_CODE, code);
  }
  return code;
}

// Check for incoming referral code in URL (?ref=CODE&item=PROD_ID)
export function detectIncomingReferral(): { referrerCode: string | null; referredItemId: string | null; isNewReferral: boolean } {
  if (typeof window === 'undefined') return { referrerCode: null, referredItemId: null, isNewReferral: false };

  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref');
  const itemFromUrl = urlParams.get('item');

  if (refFromUrl) {
    const existing = localStorage.getItem(STORAGE_KEYS.INCOMING_REFERRER);
    const isNew = existing !== refFromUrl;
    localStorage.setItem(STORAGE_KEYS.INCOMING_REFERRER, refFromUrl);
    
    // Increment clicks locally for demonstration
    recordReferralClick(refFromUrl);

    return {
      referrerCode: refFromUrl,
      referredItemId: itemFromUrl,
      isNewReferral: isNew,
    };
  }

  const savedRef = localStorage.getItem(STORAGE_KEYS.INCOMING_REFERRER);
  return {
    referrerCode: savedRef,
    referredItemId: null,
    isNewReferral: false,
  };
}

// Get Liked Product IDs set
export function getLikedProductIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LIKED_PRODUCTS);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (e) {
    return new Set();
  }
}

// Toggle Like on a Product
export function toggleProductLike(productId: string, initialBaseLikes = 100): { isLiked: boolean; newCount: number } {
  if (typeof window === 'undefined') return { isLiked: false, newCount: initialBaseLikes };

  const likedSet = getLikedProductIds();
  const isCurrentlyLiked = likedSet.has(productId);
  const likesMap = getLikesCountMap();

  let currentCount = likesMap[productId] ?? initialBaseLikes;

  if (isCurrentlyLiked) {
    likedSet.delete(productId);
    currentCount = Math.max(0, currentCount - 1);
  } else {
    likedSet.add(productId);
    currentCount += 1;
  }

  // Persist
  localStorage.setItem(STORAGE_KEYS.LIKED_PRODUCTS, JSON.stringify(Array.from(likedSet)));
  likesMap[productId] = currentCount;
  localStorage.setItem(STORAGE_KEYS.PRODUCT_LIKES_MAP, JSON.stringify(likesMap));

  // Sync with optional backend
  try {
    fetch(`/api/products/${productId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: !isCurrentlyLiked }),
    }).catch(() => {});
  } catch (e) {}

  return {
    isLiked: !isCurrentlyLiked,
    newCount: currentCount,
  };
}

// Get Likes Count for a specific product
export function getProductLikesCount(productId: string, fallbackCount = 50): number {
  if (typeof window === 'undefined') return fallbackCount;
  const likesMap = getLikesCountMap();
  if (likesMap[productId] !== undefined) {
    return likesMap[productId];
  }
  return fallbackCount;
}

function getLikesCountMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCT_LIKES_MAP);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Generate unique referral link
export function buildReferralLink(productId?: string): string {
  const code = getUserReferralCode();
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://fsgod.com';
  
  if (productId) {
    return `${origin}/?ref=${encodeURIComponent(code)}&item=${encodeURIComponent(productId)}`;
  }
  return `${origin}/?ref=${encodeURIComponent(code)}`;
}

// Execute Share with Web Share API or Clipboard Fallback
export async function executeShare(params: {
  product?: ProductItem;
  customTitle?: string;
  customText?: string;
}): Promise<{ success: boolean; method: 'web_share' | 'clipboard'; message: string; shareUrl: string }> {
  const code = getUserReferralCode();
  const shareUrl = buildReferralLink(params.product?.id);
  
  const title = params.customTitle || (params.product 
    ? `FsGoD • ${params.product.name} (Fe en Movimiento)`
    : 'FsGoD Sportswear & Custom Apparel • Ropa Deportiva de Alto Rendimiento');
  
  const text = params.customText || (params.product
    ? `Mira esta prenda "${params.product.name}" de FsGoD. ¡Usa mi enlace de referido para obtener 5% de descuento en tu compra personalizada!`
    : `Descubre la armadura de fe FsGoD. ¡Usa mi enlace para 5% OFF en tu primera prenda personalizada!`);

  // Record share event in stats
  recordShareEvent(params.product?.id);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'web_share',
        message: '¡Compartido con éxito en tus redes!',
        shareUrl,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          method: 'web_share',
          message: 'Compartir cancelado',
          shareUrl,
        };
      }
      // Fallback to clipboard if share failed
    }
  }

  // Fallback to Clipboard Copy
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      return {
        success: true,
        method: 'clipboard',
        message: '¡Enlace de referido copiado al portapapeles! 🎉 Compártelo y gana 5% de descuento.',
        shareUrl,
      };
    }
  } catch (e) {
    console.error('Clipboard write failed:', e);
  }

  return {
    success: true,
    method: 'clipboard',
    message: `Copia tu enlace: ${shareUrl}`,
    shareUrl,
  };
}

// Record Share Action
function recordShareEvent(productId?: string) {
  const stats = getReferralStats();
  stats.totalShares += 1;
  saveReferralStats(stats);
}

// Record Referral Click
function recordReferralClick(referrerCode: string) {
  const stats = getReferralStats();
  if (stats.userReferralCode === referrerCode) {
    stats.totalClicks += 1;
    saveReferralStats(stats);
  }
}

// Get Referral Statistics
export function getReferralStats(): ReferralStats {
  const userCode = getUserReferralCode();
  const defaultStats: ReferralStats = {
    userReferralCode: userCode,
    totalShares: 3,
    totalClicks: 8,
    confirmedSalesCount: 1,
    pendingReferralsCount: 2,
    unlockedCoupons: [
      {
        code: 'FE5-REFERRAL-WELCOME',
        discountPercentage: 5,
        isUsed: false,
        unlockedAt: new Date(Date.now() - 86400000).toISOString(),
        description: 'Bono de 5% de descuento por programa de embajador FsGoD.',
      },
    ],
  };

  if (typeof window === 'undefined') return defaultStats;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_STATS);
    if (!raw) {
      saveReferralStats(defaultStats);
      return defaultStats;
    }
    const parsed = JSON.parse(raw);
    parsed.userReferralCode = userCode;
    return parsed;
  } catch (e) {
    return defaultStats;
  }
}

export function saveReferralStats(stats: ReferralStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REFERRAL_STATS, JSON.stringify(stats));
}

// Trigger Unlocking of a new 5% Discount Coupon when a sale is confirmed
export function unlockConfirmedSaleDiscount(referrerCode?: string): UnlockedCoupon {
  const stats = getReferralStats();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newCoupon: UnlockedCoupon = {
    code: `FE5-VIRAL-${randomSuffix}`,
    discountPercentage: 5,
    isUsed: false,
    unlockedAt: new Date().toISOString(),
    description: '¡5% de descuento ganado por confirmación de venta de tu referido!',
  };

  stats.confirmedSalesCount += 1;
  stats.unlockedCoupons.unshift(newCoupon);
  saveReferralStats(stats);

  return newCoupon;
}

// Validate Coupon (Supports dynamic referral coupons and standard promotional codes)
export function validateCouponCode(codeToTest: string): {
  isValid: boolean;
  discountPercentage: number;
  message: string;
  couponCode: string;
} {
  const cleanCode = codeToTest.trim().toUpperCase();

  if (!cleanCode) {
    return { isValid: false, discountPercentage: 0, message: 'Ingresa un código de cupón válido.', couponCode: '' };
  }

  // Check user's unlocked referral coupons
  const stats = getReferralStats();
  const matchedUnlocked = stats.unlockedCoupons.find(c => c.code.toUpperCase() === cleanCode && !c.isUsed);
  if (matchedUnlocked) {
    return {
      isValid: true,
      discountPercentage: matchedUnlocked.discountPercentage,
      message: `¡Cupón de referido ${cleanCode} aplicado con éxito! (-${matchedUnlocked.discountPercentage}%)`,
      couponCode: cleanCode,
    };
  }

  // Standard viral discount codes
  if (cleanCode.startsWith('FE5-') || cleanCode === 'FE5' || cleanCode === 'TRINIDAD-5' || cleanCode === 'FSG5' || cleanCode === 'REFERIDO5') {
    return {
      isValid: true,
      discountPercentage: 5,
      message: `¡Descuento de referido ${cleanCode} aplicado! (-5% en tu pedido)`,
      couponCode: cleanCode,
    };
  }

  if (cleanCode === 'FSG10' || cleanCode === 'TRINIDAD-10') {
    return {
      isValid: true,
      discountPercentage: 10,
      message: '¡Cupón VIP aplicado! (-10% en tu pedido)',
      couponCode: cleanCode,
    };
  }

  return {
    isValid: false,
    discountPercentage: 0,
    message: 'El código ingresado no es válido o ha expirado.',
    couponCode: '',
  };
}
