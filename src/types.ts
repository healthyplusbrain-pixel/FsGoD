export type ProductCategory = 'jerseys' | 'hoodies' | 'shorts' | 'tracksuits' | 'jackets' | 'compression' | 'accessories';

export type SportCategory = 'all' | 'soccer' | 'running' | 'crossfit' | 'basketball' | 'tennis_padel' | 'training';

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  sport: SportCategory;
  basePrice: number;
  featuredImage: string;
  galleryImages: string[];
  description: string;
  fabricTech: string[];
  availableColors: { name: string; hex: string; secondaryHex: string }[];
  availableSizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL')[];
  customizableZones: {
    front: boolean;
    back: boolean;
    leftSleeve: boolean;
    rightSleeve: boolean;
    collar: boolean;
    sidePanels: boolean;
  };
  isNewRelease?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewsCount: number;

  // CJ Dropshipping POD & Oversized Sportswear Specifications
  cjProductId?: string;
  cjVariantSku?: string;
  cjBaseCost?: number;
  isOversizedFit?: boolean;
  isCjFulfilled?: boolean;
  cjStock?: number;
  cjWeightGrams?: number;
  cjEstimatedShippingDays?: number;
  cjPodPrintZones?: ('front_chest' | 'back_full' | 'left_sleeve' | 'right_sleeve' | 'all_over_sublimation')[];

  // Pricing Architecture, Reference Code & Social Interactions
  referenceCode?: string;
  wholesaleCost?: number;
  suggestedRetailPrice?: number;
  likesCount?: number;
}

export interface ReferralStats {
  userReferralCode: string;
  totalShares: number;
  totalClicks: number;
  confirmedSalesCount: number;
  pendingReferralsCount: number;
  unlockedCoupons: UnlockedCoupon[];
}

export interface UnlockedCoupon {
  code: string;
  discountPercentage: number;
  isUsed: boolean;
  unlockedAt: string;
  description: string;
  sourceReferralId?: string;
}

export interface CustomDesignConfig {
  productId: string;
  productName: string;
  productCategory: ProductCategory;
  viewAngle: 'front' | 'back' | 'side';
  
  // Colors (Strict 60-30-10 Palette Harmony: Base 60%, Navy 30%, Gold 10%)
  baseColor: string;
  secondaryColor: string;
  accentColor: string;
  collarColor: string;
  stitchingColor: string;
  
  // Fabric texture & pattern
  pattern: 'solid_matte' | 'carbon_hex' | 'circuit_mesh' | 'speed_gradient' | 'camo_tech' | 'diamond_grid' | 'trinity_radiance' | 'football_mesh_heavy' | 'baseball_pinstripe';
  fabricType: 'fs_dry_pro' | 'aerovent_mesh' | 'thermo_shield' | 'carbon_flex' | 'heritage_heavy_mesh';
  collarStyle: 'crew' | 'v_neck' | 'athletic_polo' | 'hybrid_stand' | 'striped_varsity_v' | 'baseball_placket';
  
  // Front personalization & Holy Trinity Emblems
  frontText: string;
  frontNumber: string;
  frontLogoType: 
    | 'holy_trinity_crest' 
    | 'heraldic_laurel_crest'
    | 'roman_numeral_patch'
    | 'trinity_cross' 
    | 'spirit_flame' 
    | 'fsgod_gold_crest' 
    | 'fsgod_apex' 
    | 'titanium_wing' 
    | 'neon_bolt' 
    | 'shield_crest' 
    | 'custom_text' 
    | 'none';
  frontLogoUrl?: string;
  sponsorText: string;
  holyTrinityVerse?: string;
  isArchedText?: boolean;
  isVarsityBeveledNumber?: boolean;
  
  // Custom Graphic Artworks & Prints
  graphicArtwork?: 'none' | 'blue_flame_car' | 'tokyo_kanji_crest' | 'street_cartoon_crew' | 'streetwear_retro_hoodie_edition' | '90s_graffiti_king' | 'street_flame_dragon' | 'chrome_eagle_heritage' | string;
  graphicArtworkUrl?: string;
  graphicArtworkPlacement?: 'front' | 'back';
  
  // User Uploaded Reference Image & 90s Streetwear Customizations
  userUploadedImage?: string;
  userUploadedImageName?: string;
  userUploadedImagePlacement?: 'front' | 'back' | 'sleeve';
  userUploadedImageScale?: number; // 0.5 to 2.0
  userUploadedImageRotation?: number; // degrees
  userUploadedImageBlend?: 'normal' | 'spray_stencil' | 'acid_wash' | 'vintage_screenprint';
  
  // 90s Hip-Hop & Graffiti Style Overlays
  graffitiStyle?: 'none' | 'wildstyle_tag' | 'bubble_throwup' | 'stencil_spray' | 'chrome_3d' | 'brooklyn_brick' | 'acid_wash_distress';
  hasDistressEffect?: boolean;
  hasChainOverlay?: boolean;
  
  // Back personalization
  backPlayerName: string;
  backPlayerNumber: string;
  backMotto: string;
  
  // Sleeve details
  leftSleeveText: string;
  rightSleeveBadge: 'trinity_badge' | 'fsgod_flag' | 'pro_division' | 'none';
  
  // Typography (including 90s Hip-Hop & Graffiti Styles)
  fontFamily: 
    | 'Impact Athletic' 
    | 'Cyber Sans' 
    | 'Futuristic Mono' 
    | 'Classic Serif' 
    | 'Bold Display'
    | '90s Graffiti Tag'
    | 'East Coast Heavy'
    | 'West Coast Gothic'
    | 'BoomBap College'
    | 'Cyber Chrome';
  textColor: string;
  textOutlineColor: string;
  hasTextOutline: boolean;
  
  // Sizing & Roster
  selectedSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
  quantity: number;
  teamRoster?: TeamPlayerRoster[];
  
  // Production
  finishType: 'sublimation_4k' | 'heat_transfer_vinyl' | 'embroidered_patch' | 'hybrid_metallic';
  productionTier: 'standard' | 'express_72h';
  customNotes?: string;
}

export interface TeamPlayerRoster {
  id: string;
  name: string;
  number: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
  captain?: boolean;
  role?: string;
}

export interface BankTransferReceipt {
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

export type CjFulfillmentStatus = 
  | 'not_dispatched' 
  | 'pending_dispatch' 
  | 'dispatched_to_cj' 
  | 'cj_in_production' 
  | 'cj_printed' 
  | 'cj_shipped' 
  | 'cj_delivered' 
  | 'cj_error';

export interface CjTrackingMilestone {
  date: string;
  status: string;
  description: string;
  location?: string;
}

export interface CjTrackingInfo {
  cjOrderId: string;
  trackingNumber: string;
  carrier: string;
  carrierCode: string;
  trackingUrl: string;
  shippingStatus: string;
  lastUpdated: string;
  estimatedDeliveryDate?: string;
  milestones: CjTrackingMilestone[];
}

export interface CjProductSyncItem {
  cjPid: string;
  productName: string;
  categoryName: string;
  suggestedRetailPrice: number;
  baseCost: number;
  weightGrams: number;
  sku: string;
  isOversized: boolean;
  fabricGsm: number;
  printAreaSpecs: string[];
  stockQuantity: number;
  variantsCount: number;
  lastSyncedAt: string;
  imageUrl: string;
}

export interface CustomOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city: string;
  country: string;
  postalCode?: string;
  items: {
    productId: string;
    productName: string;
    design: CustomDesignConfig;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  discountApplied: number;
  productionStatus: 'tech_pack_review' | 'cutting_sublimation' | 'stitching_seals' | 'quality_control' | 'dispatched' | 'delivered';
  productionStatusLabel: string;
  estimatedDelivery: string;
  createdAt: string;
  paymentStatus: 'paid' | 'authorized' | 'pending' | 'receipt_uploaded' | 'receipt_rejected';
  paymentMethod: string;
  paymentReceipt?: BankTransferReceipt;
  techPackUrl?: string;
  adminNotes?: string;

  // CJ Dropshipping POD Automated Fulfillment Fields
  cjOrderId?: string;
  cjOrderNumber?: string;
  cjFulfillmentStatus?: CjFulfillmentStatus;
  cjDispatchedAt?: string;
  cjTrackingNumber?: string;
  cjCarrier?: string;
  cjTrackingUrl?: string;
  cjPodPayload?: {
    orderNumber: string;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    products: Array<{
      vid: string;
      sku: string;
      quantity: number;
      size: string;
      customPrintAreas: {
        frontArtwork?: string;
        backArtwork?: string;
        theme: string;
        emblem: string;
      };
    }>;
    dispatchTimestamp: string;
  };
  cjTrackingInfo?: CjTrackingInfo;
}

export interface AiDesignRecommendation {
  teamName: string;
  motto: string;
  recommendedColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  suggestedPattern: string;
  typographyStyle: string;
  conceptStory: string;
  badgeConcept: string;
}
