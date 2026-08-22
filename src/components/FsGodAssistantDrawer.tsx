import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  Tag, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight,
  Calculator,
  Flame,
  Shirt,
  Layers,
  PhoneCall,
  Share2
} from 'lucide-react';
import { MasterCatalogProduct, FSGOD_MASTER_CATALOG, formatCopCurrency } from '../data/masterCatalog';
import { ShareModal } from './ShareModal';
import { audioEngine } from '../utils/audioEngine';


export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedProducts?: MasterCatalogProduct[];
  suggestedActions?: string[];
}

interface FsGodAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForOrder?: (product: MasterCatalogProduct) => void;
  initialSkuQuery?: string;
}

export function FsGodAssistantDrawer({
  isOpen,
  onClose,
  onSelectProductForOrder,
  initialSkuQuery,
}: FsGodAssistantDrawerProps) {
  const [sharingProduct, setSharingProduct] = useState<MasterCatalogProduct | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: '¡Epale mi amor! ¡Bienvenido a FsGoD! 🌴🔥 Soy Valeria, tu Asesora y Gerente de Experiencia FsGoD directa desde Curramba la Bella.\n\nAquí todo está al pelo: tenemos el Catálogo Maestro con más de 35 prendas con puro piquete, precios oficiales con el 40% de margen reglamentario, comparación contra la competencia y despacho inmediato.\n\n¿Qué SKU o prenda andas buscando hoy, corazón?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        '🔥 Ver Jerseys Retro (FSG-JER-02)',
        '📐 Explicar margen del 40%',
        '👕 Hoodies 380 GSM (FSG-HDY-01)',
        '🚚 Tiempos de envío Colombia',
        '💬 Armar pedido por WhatsApp',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle initial SKU query if provided
  useEffect(() => {
    if (initialSkuQuery && isOpen) {
      handleSendMessage(`Hola Valeria, cuéntame todo sobre el SKU ${initialSkuQuery}, su costo base, precio con el 40% y disponibilidad.`);
    }
  }, [initialSkuQuery, isOpen]);

  // Text-To-Speech audio playback for Caribbean persona voice
  const speakVoice = (text: string) => {
    if (isVoiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for cleaner voice
      const cleanText = text.replace(/[*#_•`]/g, '').slice(0, 220);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-CO';
      utterance.rate = 1.05; // Lively, energetic pace
      utterance.pitch = 1.15; // Young, cheerful female tone
      
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.includes('es-CO') || v.lang.includes('es-419') || v.lang.includes('es-MX') || v.lang.includes('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/fsgod-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedProducts: data.matchedProducts || [],
          suggestedActions: [
            '🔍 Cotizar otro SKU',
            '📐 Ver desglose de ganancia 40%',
            '📦 Cotizar envío a mi ciudad',
            '💬 Enviar pedido a WhatsApp FsGoD',
          ],
        };

        setMessages(prev => [...prev, assistantMsg]);
        speakVoice(data.reply);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: '¡Ajá mi amor! Hubo una pequeña interferencia pero aquí sigo al pelo. Pregúntame por cualquier SKU del catálogo maestro (ej. FSG-JER-02, FSG-HDY-01, FSG-TEE-01) y te paso el precio oficial con el 40% de margen al instante.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300"
        id="fsgod-assistant-drawer"
      >
        {/* Header Drawer */}
        <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-amber-400 text-base tracking-wide flex items-center">
                  Valeria • Asistente FsGoD
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  Curramba Voice
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Gerente de Experiencia • Catálogo Maestro & Margen 40%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                const nextState = !isVoiceMuted;
                setIsVoiceMuted(nextState);
                if (nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={isVoiceMuted ? 'Activar voz' : 'Silenciar voz'}
              className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Business Rule Badge Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-amber-300">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Regla FsGoD: <strong>Precio = Costo * 1.40 (+40% margen)</strong></span>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
            37 SKUs Verificados
          </span>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Render Matched Products If Any */}
                {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                    <p className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                      <Tag className="w-3 h-3 mr-1" /> Ficha Oficial de Catálogo:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.matchedProducts.map((prod) => (
                        <div
                          key={prod.sku}
                          className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                        >
                          <img
                            src={prod.featuredImage}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-900 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                {prod.sku}
                              </span>
                              <span className="text-xs font-semibold text-zinc-200 truncate">
                                {prod.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1 text-[11px]">
                              <span className="text-zinc-400">
                                Costo: <strong className="text-zinc-300">${prod.baseCostCop.toLocaleString('es-CO')}</strong>
                              </span>
                              <span className="text-emerald-400 font-bold">
                                Venta (40%): ${prod.retailPriceCop.toLocaleString('es-CO')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                audioEngine.playSprayCanSound();
                                setSharingProduct(prod);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs transition-colors"
                              title={`Compartir ${prod.name}`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {onSelectProductForOrder && (
                              <button
                                onClick={() => {
                                  onSelectProductForOrder(prod);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Pedir</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-zinc-800' : 'text-zinc-500'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {/* Action chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action.replace(/^[^\w]+/, ''))}
                      className="text-xs bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/30 rounded-full px-3 py-1 transition-colors flex items-center space-x-1"
                    >
                      <span>{action}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2 text-zinc-400 text-xs animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-zinc-300">
                Valeria está consultando el catálogo maestro y calculando los precios al 40%...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe un SKU (ej. FSG-JER-02), pregunta por precios o envíos..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-500 px-1">
            <span>Powered by Gemini 3.7 & FsGoD Master Engine</span>
            <span className="text-amber-400/80">Barranquilla, Colombia 🇨🇴</span>
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
