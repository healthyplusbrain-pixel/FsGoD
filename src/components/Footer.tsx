import React from 'react';
import { ShieldCheck, Truck, Sparkles, Award, Flame, Mail, Phone, MapPin, Building2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'catalog' | 'customizer' | 'team_kits' | 'tracker' | 'admin') => void;
  onOpenReferral?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReferral }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#07090e] text-slate-400 mt-20">
      
      {/* 4 Pillars Highlight Section */}
      <div className="border-b border-slate-800/60 bg-[#0a192f]/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase font-mono">Sublimación Digital 4K POD</h4>
              <p className="text-slate-400 mt-0.5">Tintas ecológicas de alta fijación con versículos y sellos trinitarios indelebles.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase font-mono">Fulfillment CJ Dropshipping</h4>
              <p className="text-slate-400 mt-0.5">Conexión directa con plantas de confección y despachos con guía internacional en vivo.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase font-mono">Transferencia Bancaria Directa</h4>
              <p className="text-slate-400 mt-0.5">Pago seguro a cuentas oficiales de la marca con validación manual y soporte inmediato.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase font-mono">Corte Oversized Heavyweight</h4>
              <p className="text-slate-400 mt-0.5">Algodones y tejidos técnicos de 240 a 420 GSM diseñados para resistir toda batalla.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5722] to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                FsG
              </div>
              <span className="text-lg font-black text-white tracking-widest">
                Fs<span className="text-[#FF5722]">GoD</span>
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-white">FsGoD</strong> • Indumentaria deportiva y streetwear de alto rendimiento. Honrando a la Santísima Trinidad con <span className="text-[#FF5722] font-bold">Dios por Delante</span> en cada fibra.
            </p>
            <p className="font-mono text-[10px] text-slate-500">
              © {new Date().getFullYear()} FsGoD Sportswear & Custom Studio. Todos los derechos reservados.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#FF5722] uppercase font-mono text-[11px] tracking-wider">
              Navegación Rápida
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-[#FF5722] transition-colors">
                  Catálogo Oficial & Drops
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customizer')} className="hover:text-[#FF5722] transition-colors">
                  Personalizador 3D
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('team_kits')} className="hover:text-[#FF5722] transition-colors">
                  Equipaciones & Rosters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracker')} className="hover:text-[#FF5722] transition-colors">
                  Rastreador de Confección FsGoD
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#FF5722] transition-colors">
                  Panel de Validación & Pasarelas
                </button>
              </li>
              {onOpenReferral && (
                <li>
                  <button onClick={onOpenReferral} className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors">
                    🎁 Programa de Embajadores (Gana 5%)
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-cyan-400 uppercase font-mono text-[11px] tracking-wider">
              Filosofía & Rendimiento
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>• El Padre: Propósito Supremo & Creación</li>
              <li>• El Hijo: Sacrificio & Resiliencia Atlética</li>
              <li>• El Espíritu Santo: Fuego & Alto Rendimiento</li>
              <li>• Blanks Heavyweight 240 a 420 GSM</li>
              <li>• Sublimación 4K y Vinilo Termosellado</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#FF5722] uppercase font-mono text-[11px] tracking-wider">
              Atención & Validación
            </h4>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-[#FF5722]" /> contacto@fsgod.com</p>
              <a 
                href="https://wa.me/573187801140" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> +57 318 780 1140 (WhatsApp & Pedidos Colombia)
              </a>
              <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Barranquilla, Colombia • Atelier & Despacho</p>
              <p className="text-[10px] text-slate-400 pt-1">Atención directa para atletas de fe, crews y pedidos mayoristas.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
