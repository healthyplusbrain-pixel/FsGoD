export interface StreetPalette {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  nameEs: string;
  primary60: string;      // Main background (60%) e.g. #18181B
  bodyBg: string;         // Root page background e.g. #0E0E11
  cardBg: string;         // Surface cards e.g. #202025
  headerBg: string;       // Header background
  secondary30: string;    // Frame & highlight (30%) e.g. #FF5722
  secondary30Light: string;
  accent10: string;       // Action CTA buttons (10%) e.g. #00F0FF
  accent10Dark: string;
  textColor: string;
  subtextColor: string;
  borderHex: string;
  glowColor: string;
  gradientHero: string;
  accentTextClass: string;
}

export const STREET_PALETTES: StreetPalette[] = [
  {
    id: 'industrial_orange',
    name: 'Industrial Concrete & Safety Orange (Oficial 60-30-10)',
    shortName: 'Safety Orange',
    tag: 'OFICIAL 60-30-10',
    nameEs: 'Concreto & Naranja Seguridad',
    primary60: '#18181B',
    bodyBg: '#0E0E11',
    cardBg: '#1F1F24',
    headerBg: '#131316',
    secondary30: '#FF5722',
    secondary30Light: '#FF7043',
    accent10: '#00F0FF',
    accent10Dark: '#0284C7',
    textColor: '#FFFFFF',
    subtextColor: '#A1A1AA',
    borderHex: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.25)',
    gradientHero: 'radial-gradient(ellipse at 50% -10%, rgba(255, 87, 34, 0.25), transparent 70%), radial-gradient(ellipse at 80% 50%, rgba(0, 240, 255, 0.08), transparent 60%)',
    accentTextClass: 'text-cyan-400',
  },
  {
    id: 'tokyo_cyan',
    name: 'Midnight Tokyo & Cyber Gold',
    shortName: 'Cyber Tokyo',
    tag: 'CYBER NIGHT',
    nameEs: 'Azul Tokio & Oro Neón',
    primary60: '#0A192F',
    bodyBg: '#030B17',
    cardBg: '#0F213E',
    headerBg: '#061224',
    secondary30: '#00F0FF',
    secondary30Light: '#38BDF8',
    accent10: '#F59E0B',
    accent10Dark: '#D97706',
    textColor: '#FFFFFF',
    subtextColor: '#94A3B8',
    borderHex: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.25)',
    gradientHero: 'radial-gradient(ellipse at 50% -10%, rgba(0, 240, 255, 0.24), transparent 70%), radial-gradient(ellipse at 80% 50%, rgba(245, 158, 11, 0.12), transparent 60%)',
    accentTextClass: 'text-amber-400',
  },
  {
    id: 'hazard_yellow',
    name: 'Warning Hazard & Stealth Asphalt',
    shortName: 'Hazard Gold',
    tag: 'URBAN CAUTION',
    nameEs: 'Amarillo Hazard & Asfalto',
    primary60: '#18181B',
    bodyBg: '#0C0C0E',
    cardBg: '#212126',
    headerBg: '#131316',
    secondary30: '#FACC15',
    secondary30Light: '#FDE047',
    accent10: '#84CC16',
    accent10Dark: '#65A30D',
    textColor: '#FFFFFF',
    subtextColor: '#A1A1AA',
    borderHex: '#FACC15',
    glowColor: 'rgba(250, 204, 21, 0.22)',
    gradientHero: 'radial-gradient(ellipse at 50% -10%, rgba(250, 204, 21, 0.22), transparent 70%), radial-gradient(ellipse at 80% 50%, rgba(132, 204, 22, 0.10), transparent 60%)',
    accentTextClass: 'text-lime-400',
  },
  {
    id: 'stealth_crimson',
    name: 'Stealth Crimson & Pitch Black',
    shortName: 'Stealth Crimson',
    tag: 'RACING BLOOD',
    nameEs: 'Rojo Carmesí & Grafito',
    primary60: '#141417',
    bodyBg: '#09090C',
    cardBg: '#1C1C22',
    headerBg: '#0F0F12',
    secondary30: '#EF4444',
    secondary30Light: '#F87171',
    accent10: '#EAB308',
    accent10Dark: '#CA8A04',
    textColor: '#FFFFFF',
    subtextColor: '#A1A1AA',
    borderHex: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    gradientHero: 'radial-gradient(ellipse at 50% -10%, rgba(239, 68, 68, 0.24), transparent 70%), radial-gradient(ellipse at 80% 50%, rgba(234, 179, 8, 0.10), transparent 60%)',
    accentTextClass: 'text-amber-300',
  },
  {
    id: 'deep_emerald',
    name: 'Cyber Emerald & Ultra Gold',
    shortName: 'Cyber Emerald',
    tag: 'BIO MATRIX',
    nameEs: 'Esmeralda & Oro Imperial',
    primary60: '#061C14',
    bodyBg: '#020D09',
    cardBg: '#0B261C',
    headerBg: '#03140D',
    secondary30: '#10B981',
    secondary30Light: '#34D399',
    accent10: '#FBBF24',
    accent10Dark: '#D97706',
    textColor: '#FFFFFF',
    subtextColor: '#94A3B8',
    borderHex: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    gradientHero: 'radial-gradient(ellipse at 50% -10%, rgba(16, 185, 129, 0.22), transparent 70%), radial-gradient(ellipse at 80% 50%, rgba(251, 191, 36, 0.10), transparent 60%)',
    accentTextClass: 'text-amber-400',
  },
];
