import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music2, Disc3, Radio, Sparkles } from 'lucide-react';
import { audioEngine, AudioTrackInfo } from '../utils/audioEngine';

interface SectionSoundtrackBannerProps {
  sectionKey: 'catalog' | 'customizer' | 'team_kits' | 'slot' | 'referral' | 'tracker';
  className?: string;
  compact?: boolean;
}

export const SectionSoundtrackBanner: React.FC<SectionSoundtrackBannerProps> = ({
  sectionKey,
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrackInfo>(audioEngine.getCurrentTrack());
  const [volume, setVolume] = useState(0.18);

  const sectionTrack = audioEngine.tracks.find((t) => t.sectionKey === sectionKey) || audioEngine.tracks[0];
  const isThisTrackPlaying = isPlaying && currentTrack.id === sectionTrack.id;

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.isMuted);
      setCurrentTrack(state.currentTrack);
      setVolume(state.volume);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    if (isThisTrackPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.switchSectionSoundtrack(sectionKey);
      audioEngine.play().catch(() => {});
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.toggleMute();
  };

  if (compact) {
    return (
      <div 
        onClick={handleToggle}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all duration-200 group text-xs select-none ${className}`}
      >
        <span 
          className="w-2 h-2 rounded-full shrink-0" 
          style={{ backgroundColor: sectionTrack.color }} 
        />
        <div className="flex items-center space-x-1 text-slate-300 group-hover:text-white truncate">
          <Music2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-[10px] uppercase text-amber-400/90 font-bold truncate">
            {sectionTrack.title}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="p-1 rounded-md bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors ml-1"
          title={isThisTrackPlaying ? 'Pausar canción' : 'Reproducir soundtrack'}
        >
          {isThisTrackPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950/90 via-[#111622]/90 to-slate-950/90 border border-slate-800/90 hover:border-amber-500/40 p-3 sm:p-4 backdrop-blur-md shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <div 
            onClick={handleToggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer relative shrink-0 transition-transform active:scale-95 group"
            style={{ 
              backgroundColor: `${sectionTrack.color}20`,
              border: `1px solid ${sectionTrack.color}50`
            }}
          >
            <Disc3 
              className={`w-5 h-5 transition-transform ${isThisTrackPlaying ? 'animate-spin' : 'group-hover:rotate-45'}`}
              style={{ 
                color: sectionTrack.color,
                animationDuration: '3s' 
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
              {isThisTrackPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span 
                className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border"
                style={{
                  color: sectionTrack.color,
                  backgroundColor: `${sectionTrack.color}15`,
                  borderColor: `${sectionTrack.color}40`,
                }}
              >
                Soundtrack de Sección
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {sectionTrack.bpm} BPM • {sectionTrack.mood}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
              {sectionTrack.title}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {sectionTrack.style}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          {/* Audio Visualizer Waves */}
          {isThisTrackPlaying && !isMuted && (
            <div className="flex items-end space-x-0.5 h-4 px-2">
              {[40, 80, 100, 60, 90, 45].map((h, idx) => (
                <span
                  key={idx}
                  className="w-0.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: sectionTrack.color,
                    height: `${h}%`,
                    animationDelay: `${idx * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Main Action Button */}
          <button
            onClick={handleToggle}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
              isThisTrackPlaying
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-amber-400/40'
            }`}
          >
            {isThisTrackPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Escuchar Track</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
