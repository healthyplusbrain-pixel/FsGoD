import React from 'react';
import { CustomDesignConfig } from '../types';
import { Shield, Zap, Award, Flame, Crown } from 'lucide-react';
import { ASSET_IMAGES } from '../assets/images';

interface GarmentVisualizerProps {
  design: CustomDesignConfig;
  className?: string;
  showGrid?: boolean;
}

export const GarmentVisualizer: React.FC<GarmentVisualizerProps> = ({
  design,
  className = '',
  showGrid = false,
}) => {
  const {
    productId,
    productCategory,
    viewAngle,
    baseColor,
    secondaryColor,
    accentColor,
    collarColor,
    stitchingColor,
    pattern,
    collarStyle,
    frontText,
    frontNumber,
    frontLogoType,
    sponsorText,
    backPlayerName,
    backPlayerNumber,
    backMotto,
    leftSleeveText,
    fontFamily,
    textColor,
    textOutlineColor,
    hasTextOutline,
    graphicArtwork,
    graphicArtworkUrl,
    graphicArtworkPlacement,
  } = design;

  // Resolve artwork image URL
  const resolveArtwork = () => {
    if (graphicArtworkUrl) return graphicArtworkUrl;
    if (graphicArtwork === 'football_varsity_heritage') return ASSET_IMAGES.footballVarsityJersey;
    if (graphicArtwork === 'baseball_raglan_trinity') return ASSET_IMAGES.baseballRaglanJersey;
    if (graphicArtwork === 'blue_flame_car') return ASSET_IMAGES.hoodieBlueFlameCar;
    if (graphicArtwork === 'tokyo_kanji_crest') return ASSET_IMAGES.hoodieTokyoNavyBack;
    if (graphicArtwork === 'street_cartoon_crew') return ASSET_IMAGES.streetCartoonCrewArt;
    if (graphicArtwork === 'streetwear_retro_hoodie_edition') return ASSET_IMAGES.streetwearRetroHoodie;
    
    // Auto-detect based on product id
    if (productId === 'prod_jersey_football_heritage') return ASSET_IMAGES.footballVarsityJersey;
    if (productId === 'prod_jersey_baseball_raglan') return ASSET_IMAGES.baseballRaglanJersey;
    if (productId === 'prod_hoodie_flame_car') return ASSET_IMAGES.hoodieBlueFlameCar;
    if (productId === 'prod_hoodie_tokyo_navy') return ASSET_IMAGES.hoodieTokyoNavyBack;
    if (productId === 'prod_hoodie_retro_street') return ASSET_IMAGES.streetCartoonCrewArt;
    return null;
  };

  const activeArtworkUrl = resolveArtwork();
  const shouldShowArtworkOnCurrentAngle = () => {
    if (!activeArtworkUrl) return false;
    if (graphicArtworkPlacement === 'back' && viewAngle === 'back') return true;
    if (graphicArtworkPlacement === 'front' && viewAngle === 'front') return true;
    if (productId === 'prod_hoodie_tokyo_navy') return viewAngle === 'back' || viewAngle === 'front';
    return viewAngle === 'front' || viewAngle === 'back';
  };

  // Font map for inline SVG styling
  const fontClassMap: Record<string, string> = {
    'Impact Athletic': 'Impact, "Arial Black", sans-serif',
    'Cyber Sans': '"Segoe UI", "Roboto", system-ui, sans-serif',
    'Futuristic Mono': '"Courier New", Courier, monospace',
    'Classic Serif': 'Georgia, "Times New Roman", serif',
    'Bold Display': 'system-ui, -apple-system, "Segoe UI", sans-serif',
    '90s Graffiti Tag': '"Arial Black", "Impact", sans-serif',
    'East Coast Heavy': 'Impact, "Arial Black", sans-serif',
    'West Coast Gothic': 'Georgia, "Times New Roman", serif',
    'BoomBap College': 'Impact, "Arial Black", sans-serif',
    'Cyber Chrome': '"Segoe UI", system-ui, sans-serif',
  };

  const currentFontFamily = fontClassMap[fontFamily] || 'Impact, sans-serif';

  // User uploaded reference image props
  const {
    userUploadedImage,
    userUploadedImagePlacement = 'front',
    userUploadedImageScale = 1.0,
    userUploadedImageRotation = 0,
    userUploadedImageBlend = 'normal',
    graffitiStyle = 'none',
    hasDistressEffect = false,
    hasChainOverlay = false,
  } = design;

  return (
    <div className={`relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      
      {/* Dynamic Background Grid & Tech HUD elements */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      )}

      {/* Lighting highlight overlay */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Canvas for High-Def Garment Rendering */}
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full p-4 drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pattern 1: Carbon Hexagon Grid */}
          <pattern id="pattern-carbon-hex" width="24" height="41.56" patternUnits="userSpaceOnUse">
            <path
              d="M 12 0 L 24 6.92 L 24 20.78 L 12 27.71 L 0 20.78 L 0 6.92 Z M 0 27.71 L 12 34.64 L 12 41.56 L 0 34.64 Z M 24 27.71 L 24 34.64 L 12 41.56 Z"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
          </pattern>

          {/* Pattern 2: Circuit Mesh */}
          <pattern id="pattern-circuit" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 0 15 L 15 15 L 15 0 M 15 15 L 30 15 M 15 15 L 15 30"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.9"
              strokeOpacity="0.3"
            />
            <circle cx="15" cy="15" r="2.5" fill={secondaryColor} fillOpacity="0.4" />
          </pattern>

          {/* Pattern 3: Speed Gradient Streaks */}
          <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.9" />
          </linearGradient>

          {/* Pattern 4: Diamond Grid */}
          <pattern id="pattern-diamond" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 20 10 L 10 20 L 0 10 Z"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </pattern>

          {/* Pattern 5: Trinity Radiance (Holy Trinity 3-in-1 Divine Rays) */}
          <pattern id="pattern-trinity-radiance" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="12" fill="none" stroke={accentColor} strokeWidth="0.75" strokeOpacity="0.3" />
            <polygon points="20,8 30,26 10,26" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4" />
            <circle cx="20" cy="8" r="1.5" fill="#f59e0b" fillOpacity="0.6" />
            <circle cx="30" cy="26" r="1.5" fill="#f59e0b" fillOpacity="0.6" />
            <circle cx="10" cy="26" r="1.5" fill="#f59e0b" fillOpacity="0.6" />
          </pattern>

          {/* Pattern 6: Football Heavy Mesh (Authentic pinhole athletic eyelet) */}
          <pattern id="pattern-football-mesh" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#000000" fillOpacity="0.35" />
            <circle cx="6" cy="6" r="1.1" fill="#000000" fillOpacity="0.35" />
            <circle cx="2" cy="2" r="0.6" fill="#ffffff" fillOpacity="0.12" />
            <circle cx="6" cy="6" r="0.6" fill="#ffffff" fillOpacity="0.12" />
          </pattern>

          {/* Pattern 7: Baseball Pinstripe */}
          <pattern id="pattern-baseball-pinstripe" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="10" y1="0" x2="10" y2="20" stroke={secondaryColor} strokeWidth="1.2" strokeOpacity="0.4" />
          </pattern>

          {/* Arched Text Arc Paths */}
          <path id="front-arch-path" d="M 210 320 Q 300 275 390 320" fill="none" />
          <path id="back-arch-path" d="M 190 250 Q 300 200 410 250" fill="none" />

          {/* Realistic Fabric Lighting Gradient */}
          <linearGradient id="garment-lighting" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* Drop shadow filter for badges and numbers */}
          <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>

          {/* Varsity Bevel 3D Shadow for Numbers */}
          <filter id="varsity-bevel" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#000000" floodOpacity="0.9" />
          </filter>

          {/* Graffiti Spray & Distress Filter */}
          <filter id="graffiti-distress" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* 3D Chrome Shine Gradient */}
          <linearGradient id="chrome-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* CASE 1: JERSEYS / POLOS / TOPS                                */}
        {/* ------------------------------------------------------------- */}
        {(productCategory === 'jerseys' || productCategory === 'tracksuits') && (
          <g id="jersey-garment-group">
            {/* VIEW ANGLE: FRONT */}
            {viewAngle === 'front' && (
              <>
                {/* Left Sleeve */}
                <path
                  d="M 175 140 L 70 240 L 115 285 L 205 210 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />
                {/* Right Sleeve */}
                <path
                  d="M 425 140 L 530 240 L 485 285 L 395 210 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Left Sleeve Cuff Trim */}
                <path
                  d="M 70 240 L 80 250 L 125 295 L 115 285 Z"
                  fill={accentColor}
                />
                {/* Right Sleeve Cuff Trim */}
                <path
                  d="M 530 240 L 520 250 L 475 295 L 485 285 Z"
                  fill={accentColor}
                />

                {/* Main Torso Body */}
                <path
                  d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                  fill={pattern === 'speed_gradient' ? 'url(#speed-gradient)' : baseColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Pattern Overlay on Torso */}
                {pattern === 'carbon_hex' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-carbon-hex)"
                  />
                )}
                {pattern === 'circuit_mesh' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-circuit)"
                  />
                )}
                {pattern === 'diamond_grid' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-diamond)"
                  />
                )}
                {pattern === 'trinity_radiance' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-trinity-radiance)"
                  />
                )}
                {pattern === 'football_mesh_heavy' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-football-mesh)"
                  />
                )}
                {pattern === 'baseball_pinstripe' && (
                  <path
                    d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-baseball-pinstripe)"
                  />
                )}

                {/* Side Ergonomic Vent Panels */}
                <path
                  d="M 180 220 L 205 230 L 195 490 L 190 490 Z"
                  fill={secondaryColor}
                  opacity="0.85"
                />
                <path
                  d="M 420 220 L 395 230 L 405 490 L 410 490 Z"
                  fill={secondaryColor}
                  opacity="0.85"
                />

                {/* Side Accent Racing Stripe */}
                <path
                  d="M 202 230 L 206 230 L 199 490 L 195 490 Z"
                  fill={accentColor}
                />
                <path
                  d="M 398 230 L 394 230 L 401 490 L 405 490 Z"
                  fill={accentColor}
                />

                {/* Baseball Button Placket Center Seam & White Buttons */}
                {collarStyle === 'baseball_placket' && (
                  <g id="baseball-button-placket">
                    {/* Center Placket Strip */}
                    <rect x="294" y="160" width="12" height="330" fill={secondaryColor} stroke={accentColor} strokeWidth="1" />
                    {/* Buttons */}
                    {[185, 235, 285, 335, 385, 435, 475].map((btnY, bIdx) => (
                      <g key={bIdx} transform={`translate(300, ${btnY})`}>
                        <circle cx="0" cy="0" r="4.5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
                        <circle cx="-1.5" cy="-1.5" r="0.8" fill="#334155" />
                        <circle cx="1.5" cy="-1.5" r="0.8" fill="#334155" />
                        <circle cx="-1.5" cy="1.5" r="0.8" fill="#334155" />
                        <circle cx="1.5" cy="1.5" r="0.8" fill="#334155" />
                      </g>
                    ))}
                  </g>
                )}

                {/* Torso Fabric Lighting Shader */}
                <path
                  d="M 205 140 C 235 155 365 155 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                  fill="url(#garment-lighting)"
                  pointerEvents="none"
                />

                {/* Collar Rib Styling */}
                {collarStyle === 'striped_varsity_v' ? (
                  <g id="striped-varsity-v-rib">
                    {/* Outer Gold Band */}
                    <path
                      d="M 225 132 L 300 205 L 375 132 C 340 148 260 148 225 132 Z"
                      fill={accentColor}
                    />
                    {/* Center White Stripe */}
                    <path
                      d="M 230 135 L 300 198 L 370 135 C 340 145 260 145 230 135 Z"
                      fill="#ffffff"
                    />
                    {/* Inner Black/Secondary Stripe */}
                    <path
                      d="M 236 138 L 300 190 L 364 138 C 340 143 260 143 236 138 Z"
                      fill={baseColor}
                      stroke={accentColor}
                      strokeWidth="1"
                    />
                  </g>
                ) : collarStyle === 'baseball_placket' ? (
                  <path
                    d="M 230 135 C 265 160 335 160 370 135 C 340 145 260 145 230 135 Z"
                    fill={collarColor}
                    stroke={accentColor}
                    strokeWidth="2"
                  />
                ) : collarStyle === 'v_neck' ? (
                  <path
                    d="M 230 135 L 300 200 L 370 135 C 340 145 260 145 230 135 Z"
                    fill={collarColor}
                    stroke={accentColor}
                    strokeWidth="1.5"
                  />
                ) : (
                  <path
                    d="M 230 135 C 265 175 335 175 370 135 C 340 148 260 148 230 135 Z"
                    fill={collarColor}
                    stroke={accentColor}
                    strokeWidth="1.5"
                  />
                )}

                {/* Striped Sleeve Cuffs for Varsity & Baseball */}
                {(collarStyle === 'striped_varsity_v' || collarStyle === 'baseball_placket') && (
                  <g id="striped-sleeve-cuffs">
                    {/* Left Cuff Striped */}
                    <path d="M 70 240 L 76 246 L 121 291 L 115 285 Z" fill={accentColor} />
                    <path d="M 76 246 L 81 251 L 126 296 L 121 291 Z" fill="#ffffff" />
                    <path d="M 81 251 L 86 256 L 131 301 L 126 296 Z" fill={baseColor} />

                    {/* Right Cuff Striped */}
                    <path d="M 530 240 L 524 246 L 479 291 L 485 285 Z" fill={accentColor} />
                    <path d="M 524 246 L 519 251 L 474 296 L 479 291 Z" fill="#ffffff" />
                    <path d="M 519 251 L 514 256 L 469 301 L 474 296 Z" fill={baseColor} />
                  </g>
                )}

                {/* Collar Inner Tagline */}
                <rect x="275" y="152" width="50" height="14" rx="3" fill="#020617" opacity="0.8" />
                <text x="300" y="162" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  FsGoD ELITE
                </text>

                {/* Left Chest Official Crest / Badge */}
                <g transform="translate(240, 230)" filter="url(#badge-shadow)">
                  {frontLogoType === 'heraldic_laurel_crest' && (
                    <g>
                      {/* Outer Ring */}
                      <circle cx="0" cy="0" r="25" fill="#0a0e17" stroke="#f59e0b" strokeWidth="2.5" />
                      <circle cx="0" cy="0" r="21" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                      {/* Laurel Wreath */}
                      <path d="M -16 6 C -18 -4 -12 -14 0 -17 C 12 -14 18 -4 16 6" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      {/* 3 Stars for Holy Trinity */}
                      <circle cx="-6" cy="-10" r="1.2" fill="#fbbf24" />
                      <circle cx="0" cy="-13" r="1.6" fill="#fbbf24" />
                      <circle cx="6" cy="-10" r="1.2" fill="#fbbf24" />
                      {/* Center Monogram */}
                      <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="Impact, sans-serif">
                        FS
                      </text>
                      <text x="0" y="14" textAnchor="middle" fill="#f59e0b" fontSize="5.5" fontWeight="bold" fontFamily="monospace">CHAMPIONS</text>
                    </g>
                  )}
                  {frontLogoType === 'roman_numeral_patch' && (
                    <g>
                      <rect x="-20" y="-14" width="40" height="28" rx="4" fill="#0a0e17" stroke="#f59e0b" strokeWidth="2" />
                      <text x="0" y="5" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="900" fontFamily="serif" letterSpacing="1">
                        XXI
                      </text>
                      <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold" fontFamily="monospace">FsGoD</text>
                    </g>
                  )}
                  {frontLogoType === 'holy_trinity_crest' && (
                    <g>
                      <circle cx="0" cy="0" r="23" fill="#0a192f" stroke="#f59e0b" strokeWidth="2.5" />
                      {/* 3 Interlocking Trinity Rings */}
                      <circle cx="0" cy="-6" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.6" />
                      <circle cx="-6" cy="5" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.6" />
                      <circle cx="6" cy="5" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.6" />
                      {/* Center Divine Cross */}
                      <path d="M 0 -10 L 0 8 M -5 -4 L 5 -4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}
                  {frontLogoType === 'trinity_cross' && (
                    <g>
                      <path d="M -18 -18 L 18 -18 L 18 6 C 18 16 0 24 0 24 C 0 24 -18 16 -18 6 Z" fill="#0a0e17" stroke="#f59e0b" strokeWidth="2" />
                      <path d="M 0 -12 L 0 12 M -7 -4 L 7 -4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                      <text x="0" y="19" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="monospace">3-IN-1</text>
                    </g>
                  )}
                  {frontLogoType === 'spirit_flame' && (
                    <g>
                      <circle cx="0" cy="0" r="22" fill="#0a192f" stroke="#f59e0b" strokeWidth="2" />
                      {/* Holy Spirit Flame */}
                      <path d="M 0 -16 C 6 -10 10 -4 10 2 C 10 9 5 15 0 15 C -5 15 -10 9 -10 2 C -10 -4 -6 -10 0 -16 Z" fill="#f59e0b" />
                      <path d="M 0 -10 C 3 -6 5 -2 5 3 C 5 7 2 11 0 11 C -2 11 -5 7 -5 3 C -5 -2 -3 -6 0 -10 Z" fill="#fef08a" />
                      <text x="0" y="20" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">ESPÍRITU</text>
                    </g>
                  )}
                  {frontLogoType === 'fsgod_gold_crest' && (
                    <g>
                      <polygon points="0,-22 19,-6 15,18 0,24 -15,18 -19,-6" fill="#0a0e17" stroke="#f59e0b" strokeWidth="2" />
                      {/* 3 Stars for Trinity */}
                      <circle cx="-8" cy="-12" r="1.5" fill="#f59e0b" />
                      <circle cx="0" cy="-15" r="2" fill="#f59e0b" />
                      <circle cx="8" cy="-12" r="1.5" fill="#f59e0b" />
                      <text x="0" y="6" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="900" fontFamily={currentFontFamily}>
                        FS
                      </text>
                      <text x="0" y="15" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="monospace">GOD</text>
                    </g>
                  )}
                  {frontLogoType === 'fsgod_apex' && (
                    <g>
                      <circle cx="0" cy="0" r="22" fill="#0f172a" stroke={accentColor} strokeWidth="2" />
                      <text x="0" y="6" textAnchor="middle" fill={accentColor} fontSize="14" fontWeight="900" fontFamily={currentFontFamily}>
                        FS
                      </text>
                    </g>
                  )}
                  {frontLogoType === 'titanium_wing' && (
                    <g>
                      <polygon points="0,-22 18,-6 14,18 0,24 -14,18 -18,-6" fill={accentColor} stroke="#ffffff" strokeWidth="1.5" />
                      <text x="0" y="5" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900">
                        GOD
                      </text>
                    </g>
                  )}
                  {frontLogoType === 'neon_bolt' && (
                    <g>
                      <circle cx="0" cy="0" r="20" fill={secondaryColor} stroke="#ffffff" strokeWidth="2" />
                      <polygon points="-4,-14 6,-2 0,0 4,14 -6,2 0,0" fill="#facc15" />
                    </g>
                  )}
                  {frontLogoType === 'shield_crest' && (
                    <g>
                      <path d="M -18 -18 L 18 -18 L 18 6 C 18 16 0 24 0 24 C 0 24 -18 16 -18 6 Z" fill="#09090b" stroke={accentColor} strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        PRO
                      </text>
                    </g>
                  )}
                </g>

                {/* Right Chest FsGoD Technical Brand Mark */}
                <g transform="translate(360, 230)">
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="13"
                    fontWeight="900"
                    fontFamily="monospace"
                    letterSpacing="1.5"
                  >
                    FsGoD
                  </text>
                  <line x1="-18" y1="10" x2="18" y2="10" stroke={accentColor} strokeWidth="2" />
                </g>

                {/* User Uploaded Custom Image Overlay */}
                {userUploadedImage && (userUploadedImagePlacement === 'front' || !userUploadedImagePlacement) && (
                  <g
                    transform={`translate(300, 310) rotate(${userUploadedImageRotation}) scale(${userUploadedImageScale})`}
                    filter={userUploadedImageBlend === 'spray_stencil' ? 'url(#graffiti-distress)' : 'url(#badge-shadow)'}
                  >
                    <clipPath id="custom-user-img-clip-jersey">
                      <rect x="-70" y="-70" width="140" height="140" rx="10" />
                    </clipPath>
                    <image
                      href={userUploadedImage}
                      x="-70"
                      y="-70"
                      width="140"
                      height="140"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#custom-user-img-clip-jersey)"
                      opacity={userUploadedImageBlend === 'acid_wash' ? 0.75 : 1}
                    />
                  </g>
                )}

                {/* 90s Hip-Hop & Graffiti Style Overlays */}
                {graffitiStyle === 'wildstyle_tag' && (
                  <g transform="translate(300, 290)">
                    <text x="0" y="0" textAnchor="middle" fill="#ff5500" fontSize="32" fontWeight="900" fontFamily="Impact, sans-serif" letterSpacing="4" filter="url(#graffiti-distress)">
                      WILD-TAG 90s
                    </text>
                  </g>
                )}
                {graffitiStyle === 'bubble_throwup' && (
                  <g transform="translate(300, 295)">
                    <text x="0" y="0" textAnchor="middle" fill="#00f0ff" stroke="#ffffff" strokeWidth="2" fontSize="34" fontWeight="900" fontFamily="'Arial Black', sans-serif" letterSpacing="3">
                      FSG KING
                    </text>
                  </g>
                )}
                {graffitiStyle === 'chrome_3d' && (
                  <g transform="translate(300, 295)">
                    <text x="0" y="0" textAnchor="middle" fill="url(#chrome-shine)" stroke="#09090b" strokeWidth="2.5" fontSize="30" fontWeight="900" fontFamily="Impact, sans-serif" letterSpacing="3">
                      CHROME XXI
                    </text>
                  </g>
                )}
                {hasChainOverlay && (
                  <g transform="translate(300, 190)" opacity="0.85">
                    <path d="M -90 -10 Q 0 80 90 -10" fill="none" stroke="url(#chrome-shine)" strokeWidth="6" strokeDasharray="8,4" />
                    <circle cx="0" cy="55" r="14" fill="url(#chrome-shine)" stroke="#f59e0b" strokeWidth="2" />
                    <text x="0" y="59" textAnchor="middle" fill="#09090b" fontSize="8" fontWeight="900">FSG</text>
                  </g>
                )}

                {/* Center Chest Team / Brand Name (Arched or Classic) */}
                {frontText && (
                  <g id="front-chest-text-group">
                    {/* Arched Collegiate Text Option */}
                    <text
                      x="300"
                      y="310"
                      textAnchor="middle"
                      fill={textColor}
                      stroke={hasTextOutline ? textOutlineColor : 'none'}
                      strokeWidth={hasTextOutline ? '3' : '0'}
                      fontSize={collarStyle === 'baseball_placket' ? '28' : '26'}
                      fontWeight="900"
                      fontFamily={currentFontFamily}
                      letterSpacing="2"
                      filter="url(#badge-shadow)"
                    >
                      {frontText}
                    </text>
                  </g>
                )}

                {/* Front Dorsal / Squad Number (2-Tone Varsity Beveled Depth) */}
                {frontNumber && (
                  <g id="front-number-group">
                    {/* 3D Gold/Accent Drop Bevel Shadow (like the reference #61) */}
                    <text
                      x="303"
                      y="375"
                      textAnchor="middle"
                      fill={accentColor}
                      fontSize="54"
                      fontWeight="900"
                      fontFamily="Impact, 'Arial Black', sans-serif"
                      filter="url(#varsity-bevel)"
                    >
                      {frontNumber}
                    </text>
                    {/* Crisp Front Face */}
                    <text
                      x="300"
                      y="372"
                      textAnchor="middle"
                      fill={textColor}
                      stroke={accentColor}
                      strokeWidth="1.5"
                      fontSize="54"
                      fontWeight="900"
                      fontFamily="Impact, 'Arial Black', sans-serif"
                    >
                      {frontNumber}
                    </text>
                  </g>
                )}

                {/* Sponsor / Custom Center Logo */}
                {sponsorText && (
                  <g transform="translate(300, 420)">
                    <rect x="-80" y="-14" width="160" height="28" rx="6" fill="#0f172a" stroke={accentColor} strokeWidth="1.5" opacity="0.9" />
                    <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">
                      {sponsorText}
                    </text>
                  </g>
                )}

                {/* Lower Right Authentic FsGoD Woven Jock Tag (As on real jerseys) */}
                <g transform="translate(345, 440)" filter="url(#badge-shadow)">
                  {/* Outer Woven Patch */}
                  <rect x="0" y="0" width="54" height="42" rx="3" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
                  <rect x="2" y="2" width="50" height="38" rx="2" fill="none" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
                  {/* Top Bar */}
                  <rect x="2" y="2" width="50" height="12" fill="#f59e0b" />
                  <text x="27" y="11" textAnchor="middle" fill="#09090b" fontSize="7" fontWeight="900" fontFamily="monospace">
                    FsGoD HERITAGE
                  </text>
                  {/* Trinity & Specs */}
                  <text x="27" y="22" textAnchor="middle" fill="#f8fafc" fontSize="6" fontWeight="bold" fontFamily="monospace">
                    ATHLETIC APPAREL
                  </text>
                  {/* Sizing box */}
                  <rect x="6" y="26" width="18" height="11" rx="1.5" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.8" />
                  <text x="15" y="35" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    {design.selectedSize || 'XL'}
                  </text>
                  <text x="38" y="33" textAnchor="middle" fill="#94a3b8" fontSize="5" fontWeight="bold" fontFamily="monospace">
                    SPEC 2026
                  </text>
                </g>

                {/* Lower Left Technical Sublimation Tag */}
                <g transform="translate(205, 455)">
                  <rect x="0" y="0" width="34" height="18" rx="3" fill="#000000" stroke="#00f0ff" strokeWidth="1" />
                  <text x="17" y="9" textAnchor="middle" fill="#00f0ff" fontSize="5.5" fontWeight="bold">
                    FS-DRY
                  </text>
                  <text x="17" y="15" textAnchor="middle" fill="#f59e0b" fontSize="5" fontWeight="bold">
                    4K PRO
                  </text>
                </g>
              </>
            )}

            {/* VIEW ANGLE: BACK */}
            {viewAngle === 'back' && (
              <>
                {/* Left Sleeve (Mirror) */}
                <path
                  d="M 175 140 L 70 240 L 115 285 L 205 210 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />
                {/* Right Sleeve (Mirror) */}
                <path
                  d="M 425 140 L 530 240 L 485 285 L 395 210 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Striped Sleeve Cuffs for Varsity & Baseball */}
                {(collarStyle === 'striped_varsity_v' || collarStyle === 'baseball_placket') && (
                  <g id="back-striped-sleeve-cuffs">
                    <path d="M 70 240 L 76 246 L 121 291 L 115 285 Z" fill={accentColor} />
                    <path d="M 76 246 L 81 251 L 126 296 L 121 291 Z" fill="#ffffff" />
                    <path d="M 81 251 L 86 256 L 131 301 L 126 296 Z" fill={baseColor} />

                    <path d="M 530 240 L 524 246 L 479 291 L 485 285 Z" fill={accentColor} />
                    <path d="M 524 246 L 519 251 L 474 296 L 479 291 Z" fill="#ffffff" />
                    <path d="M 519 251 L 514 256 L 469 301 L 474 296 Z" fill={baseColor} />
                  </g>
                )}

                {/* Main Torso Back Body */}
                <path
                  d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                  fill={pattern === 'speed_gradient' ? 'url(#speed-gradient)' : baseColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Pattern Overlay on Back */}
                {pattern === 'carbon_hex' && (
                  <path
                    d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-carbon-hex)"
                  />
                )}
                {pattern === 'circuit_mesh' && (
                  <path
                    d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-circuit)"
                  />
                )}
                {pattern === 'diamond_grid' && (
                  <path
                    d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-diamond)"
                  />
                )}
                {pattern === 'football_mesh_heavy' && (
                  <path
                    d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-football-mesh)"
                  />
                )}
                {pattern === 'baseball_pinstripe' && (
                  <path
                    d="M 205 140 C 235 145 365 145 395 140 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
                    fill="url(#pattern-baseball-pinstripe)"
                  />
                )}

                {/* Back Collar Rib */}
                {collarStyle === 'striped_varsity_v' ? (
                  <g id="back-striped-varsity-rib">
                    <path
                      d="M 225 132 C 265 148 335 148 375 132 C 340 142 260 142 225 132 Z"
                      fill={accentColor}
                    />
                    <path
                      d="M 230 135 C 265 146 335 146 370 135 C 340 140 260 140 230 135 Z"
                      fill="#ffffff"
                    />
                  </g>
                ) : (
                  <path
                    d="M 230 135 C 265 148 335 148 370 135 C 340 142 260 142 230 135 Z"
                    fill={collarColor}
                    stroke={accentColor}
                    strokeWidth="1.5"
                  />
                )}

                {/* Upper Back Holy Trinity Micro Badge */}
                <g transform="translate(300, 185)" filter="url(#badge-shadow)">
                  <polygon points="0,-12 12,0 0,12 -12,0" fill="#0a0e17" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="0" cy="-4" r="2.5" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
                  <circle cx="-3" cy="2" r="2.5" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
                  <circle cx="3" cy="2" r="2.5" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
                </g>

                {/* Back Player Name / Arched Collegiate Nameplate */}
                <text
                  x="300"
                  y="235"
                  textAnchor="middle"
                  fill={textColor}
                  stroke={hasTextOutline ? textOutlineColor : 'none'}
                  strokeWidth={hasTextOutline ? '3' : '0'}
                  fontSize="28"
                  fontWeight="900"
                  fontFamily={currentFontFamily}
                  letterSpacing="3"
                  filter="url(#badge-shadow)"
                >
                  {backPlayerName || 'FsGoD'}
                </text>

                {/* User Uploaded Custom Image Overlay on Back */}
                {userUploadedImage && userUploadedImagePlacement === 'back' && (
                  <g
                    transform={`translate(300, 340) rotate(${userUploadedImageRotation}) scale(${userUploadedImageScale})`}
                    filter={userUploadedImageBlend === 'spray_stencil' ? 'url(#graffiti-distress)' : 'url(#badge-shadow)'}
                  >
                    <clipPath id="custom-user-img-clip-jersey-back">
                      <rect x="-80" y="-80" width="160" height="160" rx="12" />
                    </clipPath>
                    <image
                      href={userUploadedImage}
                      x="-80"
                      y="-80"
                      width="160"
                      height="160"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#custom-user-img-clip-jersey-back)"
                      opacity={userUploadedImageBlend === 'acid_wash' ? 0.75 : 1}
                    />
                  </g>
                )}

                {/* Large 2-Tone Varsity Beveled Back Dorsal Number (like #61) */}
                <g id="back-large-dorsal-number">
                  {/* Bevel 3D Shadow */}
                  <text
                    x="305"
                    y="368"
                    textAnchor="middle"
                    fill={accentColor}
                    fontSize="115"
                    fontWeight="900"
                    fontFamily="Impact, 'Arial Black', sans-serif"
                    filter="url(#varsity-bevel)"
                  >
                    {backPlayerNumber || '61'}
                  </text>
                  {/* Crisp Front Face with Outline */}
                  <text
                    x="300"
                    y="362"
                    textAnchor="middle"
                    fill={textColor}
                    stroke={accentColor}
                    strokeWidth="3"
                    fontSize="115"
                    fontWeight="900"
                    fontFamily="Impact, 'Arial Black', sans-serif"
                  >
                    {backPlayerNumber || '61'}
                  </text>
                </g>

                {/* Lower Back Holy Trinity Bible Verse / Motto */}
                {(backMotto || design.holyTrinityVerse) && (
                  <g transform="translate(300, 445)">
                    <rect x="-120" y="-12" width="240" height="24" rx="4" fill="#09090b" stroke="#f59e0b" strokeWidth="1" opacity="0.9" />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      letterSpacing="1.5"
                    >
                      {backMotto || design.holyTrinityVerse || 'FILIPENSES 4:13'}
                    </text>
                  </g>
                )}
              </>
            )}

            {/* VIEW ANGLE: SIDE */}
            {viewAngle === 'side' && (
              <>
                {/* Side Torso Profile */}
                <path
                  d="M 230 140 C 260 145 340 145 370 140 L 390 220 L 380 490 C 340 500 260 500 220 490 L 210 220 Z"
                  fill={baseColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Side Sleeve Arc */}
                <path
                  d="M 250 140 C 350 150 370 280 340 330 L 280 300 C 300 260 300 180 250 140 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2"
                />

                {/* Sleeve Custom Text / Logo */}
                {leftSleeveText && (
                  <text
                    x="305"
                    y="240"
                    transform="rotate(65, 305, 240)"
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily={currentFontFamily}
                  >
                    {leftSleeveText}
                  </text>
                )}

                {/* Side Vent Stripe */}
                <path
                  d="M 290 220 L 310 220 L 305 490 L 295 490 Z"
                  fill={accentColor}
                />
              </>
            )}
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CASE 2: HOODIES                                              */}
        {/* ------------------------------------------------------------- */}
        {productCategory === 'hoodies' && (
          <g id="hoodie-garment-group">
            {/* VIEW ANGLE: FRONT OR SIDE */}
            {viewAngle !== 'back' && (
              <>
                {/* Hood outline */}
                <path
                  d="M 210 160 C 210 60 390 60 390 160 C 360 175 240 175 210 160 Z"
                  fill={collarColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />
                {/* Hood inner shadow */}
                <path
                  d="M 240 150 C 250 90 350 90 360 150 Z"
                  fill="#09090b"
                  opacity="0.75"
                />

                {/* Left Sleeve */}
                <path
                  d="M 185 160 L 60 270 L 105 320 L 205 230 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />
                {/* Right Sleeve */}
                <path
                  d="M 415 160 L 540 270 L 495 320 L 395 230 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Main Torso Hoodie Body */}
                <path
                  d="M 205 160 C 235 170 365 170 395 160 L 420 230 L 415 495 C 370 505 230 505 185 495 L 180 230 Z"
                  fill={baseColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Kangaroo Pouch Pocket */}
                <path
                  d="M 230 380 L 370 380 L 390 470 L 210 470 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2"
                />
                <line x1="230" y1="380" x2="210" y2="470" stroke={accentColor} strokeWidth="2" />
                <line x1="370" y1="380" x2="390" y2="470" stroke={accentColor} strokeWidth="2" />

                {/* Drawstrings */}
                <path d="M 265 175 Q 260 220 270 260" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="270" cy="262" r="3.5" fill={accentColor} />

                <path d="M 335 175 Q 340 220 330 260" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="330" cy="262" r="3.5" fill={accentColor} />

                {/* 90s Graffiti Overlays on Hoodie Front */}
                {graffitiStyle === 'wildstyle_tag' && (
                  <g transform="translate(300, 275) rotate(-4)" filter="url(#badge-shadow)">
                    <rect x="-85" y="-35" width="170" height="70" rx="8" fill="#121316" fillOpacity="0.4" />
                    <text x="0" y="8" textAnchor="middle" fill="#ff5500" stroke="#ffffff" strokeWidth="1.5" fontSize="26" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" letterSpacing="3">
                      FsGoD 90s
                    </text>
                    <text x="0" y="24" textAnchor="middle" fill="#00f0ff" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="2">
                      ✦ WILDSTYLE TAG ✦
                    </text>
                  </g>
                )}

                {graffitiStyle === 'bubble_throwup' && (
                  <g transform="translate(300, 275)" filter="url(#badge-shadow)">
                    <ellipse cx="0" cy="0" rx="90" ry="38" fill="#09090b" fillOpacity="0.5" />
                    <text x="0" y="10" textAnchor="middle" fill="#00f0ff" stroke="#ffffff" strokeWidth="4" fontSize="28" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
                      FsGoD
                    </text>
                  </g>
                )}

                {graffitiStyle === 'chrome_3d' && (
                  <g transform="translate(300, 275)" filter="url(#chrome-shine)">
                    <rect x="-90" y="-32" width="180" height="64" rx="12" fill="#09090b" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="0" y="10" textAnchor="middle" fill="#ffffff" stroke="#38bdf8" strokeWidth="1" fontSize="26" fontWeight="900" fontFamily="monospace" letterSpacing="4">
                      FsGoD 3D
                    </text>
                  </g>
                )}

                {/* Heavy Streetwear Gold Chain Overlay */}
                {hasChainOverlay && (
                  <g id="streetwear-heavy-gold-chain-hoodie" filter="url(#badge-shadow)">
                    <path
                      d="M 235 175 C 245 285 355 285 365 175"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="9"
                      strokeDasharray="8,6"
                      strokeLinecap="round"
                    />
                    <circle cx="300" cy="255" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text x="300" y="260" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="900">FS</text>
                  </g>
                )}

                {/* User Uploaded Custom Image Overlay on Hoodie Front */}
                {userUploadedImage && userUploadedImagePlacement === 'front' && (
                  <g
                    transform={`translate(300, 275) rotate(${userUploadedImageRotation}) scale(${userUploadedImageScale})`}
                    filter={userUploadedImageBlend === 'spray_stencil' ? 'url(#graffiti-distress)' : 'url(#badge-shadow)'}
                  >
                    <clipPath id="custom-user-img-clip-hoodie-front">
                      <rect x="-80" y="-80" width="160" height="160" rx="12" />
                    </clipPath>
                    <image
                      href={userUploadedImage}
                      x="-80"
                      y="-80"
                      width="160"
                      height="160"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#custom-user-img-clip-hoodie-front)"
                      opacity={userUploadedImageBlend === 'acid_wash' ? 0.75 : 1}
                    />
                  </g>
                )}

                {/* Front Artwork Graphic Print */}
                {activeArtworkUrl && shouldShowArtworkOnCurrentAngle() && (
                  <g transform="translate(300, 275)" filter="url(#badge-shadow)">
                    <clipPath id="hoodie-front-art-clip">
                      <rect x="-85" y="-85" width="170" height="170" rx="14" />
                    </clipPath>
                    <rect x="-86" y="-86" width="172" height="172" rx="15" fill="#000000" fillOpacity="0.3" stroke={accentColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                    <image
                      href={activeArtworkUrl}
                      x="-85"
                      y="-85"
                      width="170"
                      height="170"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#hoodie-front-art-clip)"
                    />
                  </g>
                )}

                {/* Chest Text Brand / Model */}
                <text
                  x="300"
                  y={activeArtworkUrl ? 370 : 280}
                  textAnchor="middle"
                  fill={textColor}
                  stroke={hasTextOutline ? textOutlineColor : 'none'}
                  strokeWidth={hasTextOutline ? '3' : '0'}
                  fontSize={activeArtworkUrl ? '16' : '24'}
                  fontWeight="900"
                  fontFamily={currentFontFamily}
                  letterSpacing="1.5"
                >
                  {frontText || 'FsGoD'}
                </text>

                {/* Pocket Micro Badge */}
                <text
                  x="300"
                  y="440"
                  textAnchor="middle"
                  fill={accentColor}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="2"
                >
                  {sponsorText || 'STREETWEAR HERITAGE 2026'}
                </text>
              </>
            )}

            {/* VIEW ANGLE: BACK */}
            {viewAngle === 'back' && (
              <>
                {/* Hood Fold on Back */}
                <path
                  d="M 210 150 C 210 210 390 210 390 150 C 360 135 240 135 210 150 Z"
                  fill={collarColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Left Sleeve (Mirror) */}
                <path
                  d="M 185 160 L 60 270 L 105 320 L 205 230 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />
                {/* Right Sleeve (Mirror) */}
                <path
                  d="M 415 160 L 540 270 L 495 320 L 395 230 Z"
                  fill={secondaryColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Main Torso Hoodie Body */}
                <path
                  d="M 205 160 C 235 170 365 170 395 160 L 420 230 L 415 495 C 370 505 230 505 185 495 L 180 230 Z"
                  fill={baseColor}
                  stroke={stitchingColor}
                  strokeWidth="2.5"
                />

                {/* Back Artwork Graphic Print */}
                {activeArtworkUrl && (
                  <g transform="translate(300, 310)" filter="url(#badge-shadow)">
                    <clipPath id="hoodie-back-art-clip">
                      <rect x="-95" y="-95" width="190" height="190" rx="16" />
                    </clipPath>
                    <rect x="-96" y="-96" width="192" height="192" rx="17" fill="#000000" fillOpacity="0.4" stroke={accentColor} strokeWidth="1.5" opacity="0.6" />
                    <image
                      href={activeArtworkUrl}
                      x="-95"
                      y="-95"
                      width="190"
                      height="190"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#hoodie-back-art-clip)"
                    />
                  </g>
                )}

                {/* Upper Back Title / Player Name */}
                <text
                  x="300"
                  y="200"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="22"
                  fontWeight="900"
                  fontFamily={currentFontFamily}
                  letterSpacing="2"
                >
                  {backPlayerName || 'FsGoD STREETWEAR'}
                </text>

                {/* Back Motto */}
                <text
                  x="300"
                  y={activeArtworkUrl ? 440 : 340}
                  textAnchor="middle"
                  fill={accentColor}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="2"
                >
                  {backMotto || 'EST. 2026 // HERITAGE'}
                </text>
              </>
            )}
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CASE 3: SHORTS / COMPRESSION                                 */}
        {/* ------------------------------------------------------------- */}
        {(productCategory === 'shorts' || productCategory === 'compression') && (
          <g id="shorts-garment-group">
            {/* Waistband */}
            <rect
              x="190"
              y="180"
              width="220"
              height="35"
              rx="6"
              fill={collarColor}
              stroke={stitchingColor}
              strokeWidth="2"
            />
            <text x="300" y="202" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="bold" fontFamily="monospace">
              FsGoD CARBONFLEX
            </text>

            {/* Left Leg */}
            <path
              d="M 190 215 L 290 230 L 280 460 L 160 440 Z"
              fill={baseColor}
              stroke={stitchingColor}
              strokeWidth="2.5"
            />
            {/* Right Leg */}
            <path
              d="M 410 215 L 310 230 L 320 460 L 440 440 Z"
              fill={baseColor}
              stroke={stitchingColor}
              strokeWidth="2.5"
            />

            {/* Crotch Gusset */}
            <polygon points="290,230 310,230 300,280" fill={secondaryColor} />

            {/* Inner Compression Layer Peeking at Bottom */}
            <rect x="165" y="440" width="110" height="25" rx="3" fill={secondaryColor} stroke={accentColor} strokeWidth="1.5" />
            <rect x="325" y="440" width="110" height="25" rx="3" fill={secondaryColor} stroke={accentColor} strokeWidth="1.5" />

            {/* Left Leg Graphic / Number */}
            <text
              x="215"
              y="400"
              textAnchor="middle"
              fill={textColor}
              fontSize="34"
              fontWeight="900"
              fontFamily={currentFontFamily}
            >
              {frontNumber || '07'}
            </text>

            {/* Right Leg FsGoD Crest */}
            <g transform="translate(390, 390)">
              <circle cx="0" cy="0" r="16" fill={accentColor} />
              <text x="0" y="4" textAnchor="middle" fill="#09090b" fontSize="10" fontWeight="900">
                FS
              </text>
            </g>
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CASE 4: JACKETS / WINDBREAKERS                               */}
        {/* ------------------------------------------------------------- */}
        {productCategory === 'jackets' && (
          <g id="jacket-garment-group">
            {/* Stand collar */}
            <path
              d="M 230 130 C 265 140 335 140 370 130 L 365 160 C 335 170 265 170 235 160 Z"
              fill={collarColor}
              stroke={accentColor}
              strokeWidth="2"
            />

            {/* Sleeves */}
            <path
              d="M 180 150 L 70 250 L 110 300 L 205 210 Z"
              fill={secondaryColor}
              stroke={stitchingColor}
              strokeWidth="2.5"
            />
            <path
              d="M 420 150 L 530 250 L 490 300 L 395 210 Z"
              fill={secondaryColor}
              stroke={stitchingColor}
              strokeWidth="2.5"
            />

            {/* Torso */}
            <path
              d="M 205 150 C 235 160 365 160 395 150 L 420 220 L 410 490 C 370 500 230 500 190 490 L 180 220 Z"
              fill={baseColor}
              stroke={stitchingColor}
              strokeWidth="2.5"
            />

            {/* Center Front Waterproof Zipper */}
            <line x1="300" y1="160" x2="300" y2="495" stroke={accentColor} strokeWidth="4" />
            <polygon points="296,220 304,220 302,235 298,235" fill="#f8fafc" />

            {/* Chest Graphics */}
            <text
              x="250"
              y="250"
              textAnchor="middle"
              fill={textColor}
              fontSize="16"
              fontWeight="900"
              fontFamily={currentFontFamily}
            >
              {frontText || 'FsGoD'}
            </text>

            <text
              x="350"
              y="250"
              textAnchor="middle"
              fill={accentColor}
              fontSize="14"
              fontWeight="900"
              fontFamily="monospace"
            >
              STORM-PRO
            </text>
          </g>
        )}
      </svg>

      {/* Floating View Angle Pill Badge */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center space-x-2 text-[11px] font-mono text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold uppercase tracking-wider text-amber-400">
          Vista: {viewAngle === 'front' ? 'Frente (Front)' : viewAngle === 'back' ? 'Dorsal (Back)' : 'Perfil (Side)'}
        </span>
      </div>

      {/* Fabric Tech Label Pill */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center space-x-2 text-[11px] font-mono text-slate-300 shadow-lg">
        <span className="text-cyan-400 font-bold">4K SUB-PRO</span>
      </div>

    </div>
  );
};
