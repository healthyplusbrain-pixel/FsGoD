import React, { useState } from 'react';
import { Copy, CheckCircle2, ShieldCheck, ExternalLink, Smartphone } from 'lucide-react';
import { FSGOD_BRAND_CONTACT, getZelleQrUrl } from '../data/brandContact';
import { audioEngine } from '../utils/audioEngine';

interface ZelleChaseQrCardProps {
  memo?: string;
  amountUsd?: number;
  compact?: boolean;
}

export function ZelleChaseQrCard({ memo = 'FSGOD-ORDER', amountUsd, compact = false }: ZelleChaseQrCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    audioEngine.playClickSound();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const qrUrl = getZelleQrUrl(memo);

  return (
    <div className="bg-[#0b0f19] border border-blue-500/30 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Card */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
            Chase Bank • Zelle® Gateway
          </span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-[10px] font-mono font-bold text-blue-300">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <span>Verificado Chase</span>
        </div>
      </div>

      {/* Main Chase / Zelle Share Code Section (Replicating exact uploaded Chase UI) */}
      <div className="flex flex-col items-center text-center space-y-3 py-2">
        <div className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-medium text-slate-300">
          Share code
        </div>

        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-sm">
          Scan this code in your bank's app to pay
        </p>

        <div className="space-y-0.5">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
            {FSGOD_BRAND_CONTACT.zelle.recipientName}
          </h3>
          <p className="text-sm font-mono text-blue-300 font-bold">
            at {FSGOD_BRAND_CONTACT.zelle.recipientIdentifier}.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-4 border-slate-900 my-2 flex flex-col items-center transition-transform hover:scale-[1.02]">
          <img
            src={qrUrl}
            alt="Zelle QR Code CLTV.DATA LLC"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Iconic Zelle® typography badge */}
        <div className="flex items-center justify-center space-x-1 pt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-400 font-sans">
            Żelle<sup className="text-xs">®</sup>
          </span>
        </div>
      </div>

      {/* Amount & Memo Info if provided */}
      {amountUsd && (
        <div className="mt-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Total a transferir:</span>
          <span className="text-emerald-400 font-mono font-black text-sm sm:text-base">
            ${amountUsd.toFixed(2)} USD
          </span>
        </div>
      )}

      {/* Account Details & One-Click Copy Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Recipient Name */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Titular / Empresa</span>
            <strong className="text-white font-mono text-xs">{FSGOD_BRAND_CONTACT.zelle.recipientName}</strong>
          </div>
          <button
            type="button"
            onClick={() => copyText(FSGOD_BRAND_CONTACT.zelle.recipientName, 'name')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copiar Titular"
          >
            {copiedKey === 'name' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'name' ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Zelle ID / Identifier */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Identificador Zelle</span>
            <strong className="text-blue-300 font-mono text-xs">{FSGOD_BRAND_CONTACT.zelle.recipientIdentifier}</strong>
          </div>
          <button
            type="button"
            onClick={() => copyText(FSGOD_BRAND_CONTACT.zelle.recipientIdentifier, 'id')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copiar ID"
          >
            {copiedKey === 'id' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'id' ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Bank Name */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">Banco Receptor (USA)</span>
          <strong className="text-white font-mono text-xs">{FSGOD_BRAND_CONTACT.zelle.bank}</strong>
        </div>

        {/* Memo / Concept */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Concepto / Memo</span>
            <strong className="text-amber-400 font-mono text-xs">{memo}</strong>
          </div>
          <button
            type="button"
            onClick={() => copyText(memo, 'memo')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copiar Memo"
          >
            {copiedKey === 'memo' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'memo' ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="mt-4 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 leading-relaxed flex items-start space-x-2">
        <Smartphone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          Abre la aplicación de tu banco (<strong>Chase, Bank of America, Wells Fargo, Citi, Capital One, etc.</strong>), selecciona <strong>Zelle®</strong>, escanea el código o busca a <strong>{FSGOD_BRAND_CONTACT.zelle.recipientName}</strong> con el ID <strong>{FSGOD_BRAND_CONTACT.zelle.recipientIdentifier}</strong> y coloca tu número de orden en el memo.
        </p>
      </div>
    </div>
  );
}
