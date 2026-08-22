import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  SkipForward, 
  SkipBack,
  Music, 
  Sliders, 
  Upload, 
  ChevronDown,
  ChevronUp,
  Radio,
  Sparkles,
  Layers,
  CheckCircle2,
  Disc3
} from 'lucide-react';
import { audioEngine, AudioTrackInfo } from '../utils/audioEngine';

export const BackgroundMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.18);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrackInfo>(audioEngine.getCurrentTrack());
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([4, 6, 8, 5, 7]);

  const animationFrameRef = useRef<number | null>(null);

  // Subscribe to central audioEngine state
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
      setVolume(state.volume);
      setCurrentTrack(state.currentTrack);
      setAutoSwitch(state.autoSwitchBySection);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Equalizer animation loop
  useEffect(() => {
    let active = true;

    const updateAnalyser = () => {
      if (!active) return;

      if (isPlaying && !isMuted && volume > 0) {
        const data = audioEngine.getAnalyserData();
        const levels = [
          Math.min(100, Math.max(10, (data[1] || 0) / 2.0)),
          Math.min(100, Math.max(15, (data[3] || 0) / 1.8)),
          Math.min(100, Math.max(20, (data[5] || 0) / 1.6)),
          Math.min(100, Math.max(12, (data[7] || 0) / 2.0)),
          Math.min(100, Math.max(8, (data[9] || 0) / 2.4)),
        ];
        setAudioLevels(levels);
      } else {
        setAudioLevels([4, 4, 4, 4, 4]);
      }

      animationFrameRef.current = requestAnimationFrame(updateAnalyser);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnalyser);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isMuted, volume]);

  const handleTogglePlay = () => {
    audioEngine.toggle();
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleToggleMute = () => {
    audioEngine.toggleMute();
  };

  const handleVolumeChange = (newVol: number) => {
    audioEngine.setVolume(newVol);
  };

  const handleSelectTrack = (idx: number) => {
    audioEngine.setTrack(idx);
    if (!isPlaying) {
      audioEngine.play();
    }
  };

  const handleNextTrack = () => {
    audioEngine.nextTrack();
    if (!isPlaying) {
      audioEngine.play();
    }
  };

  const handlePrevTrack = () => {
    audioEngine.prevTrack();
    if (!isPlaying) {
      audioEngine.play();
    }
  };

  const handleToggleAutoSwitch = () => {
    audioEngine.setAutoSwitchBySection(!autoSwitch);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audioEngine.loadCustomAudioFile(file);
    }
  };

  return (
    <aside 
      aria-label="Reproductor de audio y música de fondo por secciones"
      className="fixed bottom-5 right-5 z-50 transition-all duration-300 font-sans"
    >
      <div className="relative">
        
        {/* Expanded Panel (Flyout menu with full 6 tracks & controls) */}
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-3 w-96 max-w-[94vw] bg-[#0c1017]/98 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-4 shadow-2xl shadow-black/95 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            
            {/* Header / Track Info */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                    FsGoD Street Radio
                    <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                      6 Tracks
                    </span>
                  </h4>
                  <p className="text-[10px] text-amber-400/90 font-mono">
                    {isPlaying ? (isMuted ? 'Muted (Silenciado)' : 'Reproduciendo en segundo plano') : 'En pausa (Clic en Play)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimizar reproductor"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Playing Card */}
            <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTrack.color || '#FF5722' }} />
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                    {currentTrack.section}
                  </span>
                </div>
                
                {/* Dynamic Equalizer Bars */}
                <div className="flex items-end space-x-1 h-4 shrink-0 px-1">
                  {audioLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                      style={{
                        height: isPlaying && !isMuted ? `${Math.max(4, lvl * 0.18)}px` : '3px',
                        opacity: isPlaying && !isMuted ? 0.95 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <span className="text-xs font-black text-white block truncate">
                    {currentTrack.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate font-mono">
                    {currentTrack.style} • {currentTrack.bpm} BPM
                  </span>
                </div>
                <Disc3 className={`w-6 h-6 text-amber-400 shrink-0 ${isPlaying && !isMuted ? 'animate-spin' : 'opacity-40'}`} style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Main Action Buttons (Prev / Play / Pause / Stop / Mute / Next) */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {/* Prev */}
              <button
                onClick={handlePrevTrack}
                className="py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center transition-all"
                title="Pista anterior"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={handleTogglePlay}
                className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1 transition-all ${
                  isPlaying
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 col-span-1'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 col-span-1'
                }`}
                title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={handleStop}
                className="py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center transition-all"
                title="Detener / Stop por completo"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
              </button>

              {/* Next Track */}
              <button
                onClick={handleNextTrack}
                className="py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center transition-all"
                title="Siguiente pista"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Mute / Unmute Button */}
              <button
                onClick={handleToggleMute}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center transition-all border ${
                  isMuted
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-800'
                }`}
                title={isMuted ? 'Desactivar silencio' : 'Silenciar audio (Mute)'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Sliders className="w-3 h-3 text-amber-400" />
                  Volumen Maestro
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {isMuted ? '0% (Silencio)' : `${Math.round(volume * 100)}%`}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Auto Switch by Section Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">Sincronizar música con la sección activa</span>
              </div>
              <button
                onClick={handleToggleAutoSwitch}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  autoSwitch
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {autoSwitch ? 'ACTIVO' : 'MANUAL'}
              </button>
            </div>

            {/* 6 Sections Soundtracks List */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Canciones por Sección (6 Tracks)</span>
                <span className="text-amber-400 text-[9px] font-mono">Selección Directa</span>
              </span>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {audioEngine.tracks.map((trk, idx) => {
                  const isCurrent = currentTrack.id === trk.id;
                  return (
                    <button
                      key={trk.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-amber-400/15 border border-amber-400/60 text-amber-300 font-bold'
                          : 'bg-slate-950/60 hover:bg-slate-950 text-slate-300 border border-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: trk.color }} 
                        />
                        <div className="truncate">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block leading-tight">
                            {trk.section}
                          </span>
                          <span className="truncate block font-semibold text-white group-hover:text-amber-300 transition-colors">
                            {trk.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <span className="text-[9px] font-mono text-slate-500">
                          {trk.bpm} BPM
                        </span>
                        {isCurrent && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Audio Upload Option */}
            <label className="p-2.5 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950 text-[11px] text-slate-300 hover:text-white cursor-pointer flex items-center justify-between transition-all group">
              <div className="flex items-center space-x-2">
                <Upload className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Cargar tu propio track de audio (MP3/WAV)</span>
              </div>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">
                Subir
              </span>
            </label>
          </div>
        )}

        {/* Floating Mini Pill Player Bar (Always Visible Bottom-Right) */}
        <div className="flex items-center space-x-1.5 bg-[#0a0e17]/95 hover:bg-[#0a0e17] backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 p-1.5 pl-3 rounded-2xl shadow-xl shadow-black/90 transition-all duration-300">
          
          {/* Equalizer & Status Icon - Clicking opens deck */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 cursor-pointer pr-1"
            title="Expandir controles completos de audio"
          >
            <div className="flex items-end space-x-0.5 h-4 w-4">
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-100"
                  style={{
                    height: isPlaying && !isMuted ? `${Math.max(3, lvl * 0.16)}px` : '3px',
                    opacity: isPlaying && !isMuted ? 0.95 : 0.35,
                  }}
                />
              ))}
            </div>

            <div className="hidden sm:block text-left select-none">
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block leading-tight">
                {currentTrack.section} • {isPlaying ? (isMuted ? 'Silenciado' : 'On') : 'Pausa'}
              </span>
              <span className="text-[11px] font-bold text-white block max-w-[130px] truncate leading-tight">
                {currentTrack.title}
              </span>
            </div>
          </div>

          {/* Quick Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md shadow-amber-400/25 transition-transform active:scale-95 flex items-center justify-center"
            title={isPlaying ? 'Pausar música' : 'Reproducir audio'}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-slate-950" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Quick Stop Button */}
          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors flex items-center justify-center"
            title="Detener audio (Stop)"
            aria-label="Detener audio"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Quick Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-amber-400'
            }`}
            title={isMuted ? 'Activar sonido' : 'Silenciar audio (Mute)'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center justify-center"
            title={isExpanded ? 'Ocultar panel' : 'Más opciones de audio'}
            aria-label="Opciones de audio"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

        </div>

      </div>
    </aside>
  );
};
