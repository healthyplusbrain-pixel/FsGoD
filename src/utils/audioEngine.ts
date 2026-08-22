// Web Audio API Ambient & Streetwear Soundtrack Engine
// Tuned for 6 high-definition procedural tracks across different app sections
// with full Play, Pause, Stop, Mute, Section-Mapping, and custom audio upload support

export interface AudioTrackInfo {
  id: string;
  title: string;
  section: string;
  sectionKey: 'catalog' | 'customizer' | 'team_kits' | 'slot' | 'referral' | 'tracker' | 'custom';
  style: string;
  bpm: number;
  mood: string;
  color: string;
  audioUrl?: string;
}

type AudioStateListener = (state: {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: AudioTrackInfo;
  autoSwitchBySection: boolean;
}) => void;

class BackgroundAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timerId: number | null = null;
  private currentTrackIndex = 0;
  private volume = 0.18; // 18% default comfortable background level
  private prevVolume = 0.18;
  private customAudio: HTMLAudioElement | null = null;
  private customTrackName: string | null = null;
  private step = 0;
  private userExplicitlyStopped = false;
  private autoSwitchBySection = true;
  private listeners: Set<AudioStateListener> = new Set();

  public tracks: AudioTrackInfo[] = [
    {
      id: 'trinity_glory',
      title: 'FsGoD • Dios Por Delante (Urban Ambient)',
      section: 'Catálogo & Street Drops',
      sectionKey: 'catalog',
      style: 'Trinidad Beat • Lo-Fi & Celestial Gospel Pad',
      bpm: 80,
      mood: 'Espiritual, Urbano, Premium',
      color: '#FF5722', // Safety Orange
    },
    {
      id: 'cyber_customizer',
      title: 'FsGoD Cyber Lab (Techwear Studio Flow)',
      section: 'Estudio de Personalización 3D',
      sectionKey: 'customizer',
      style: 'Lo-Fi Trap, 808 Sub-Bass & Dream Arp',
      bpm: 82,
      mood: 'Creativo, Tecnológico, Dinámico',
      color: '#00F0FF', // Cyan Neon
    },
    {
      id: 'stadium_hype',
      title: 'FsGoD Stadium Drill (Pro Locker Anthem)',
      section: 'Team Kits & Uniformes Pro',
      sectionKey: 'team_kits',
      style: 'High-Energy Athletic Drill & Brass',
      bpm: 92,
      mood: 'Competitivo, Épico, Deportivo',
      color: '#F59E0B', // Amber Gold
    },
    {
      id: 'arcade_cyberwave',
      title: 'Tokyo Midnight Arcade (Katakana Cyberwave)',
      section: 'Street Loot & Ruleta de Premios',
      sectionKey: 'slot',
      style: 'Retrowave 80s, Neon Chimes & 16th Arp',
      bpm: 110,
      mood: 'Arcade, Vibrante, Suerte',
      color: '#EC4899', // Pink Neon
    },
    {
      id: 'ambassador_lounge',
      title: 'Golden Heritage (90s Boombap Lounge)',
      section: 'Embajadores & Programa de Referidos',
      sectionKey: 'referral',
      style: 'Vintage Boombap, Rhodes Chords & Warm Sub',
      bpm: 88,
      mood: 'Lounge, Elegante, Chillout',
      color: '#10B981', // Emerald Green
    },
    {
      id: 'factory_midnight',
      title: 'Industrial Factory Midnight (Darkwave Sub)',
      section: 'Rastreo & Taller de Producción en Vivo',
      sectionKey: 'tracker',
      style: 'Minimal Darkwave, Sub Pulsar & Atmosphere',
      bpm: 75,
      mood: 'Industrial, Nocturno, Precision',
      color: '#8B5CF6', // Purple Glow
    },
  ];

  constructor() {
    // Setup automatic click listener for first user interaction if not explicitly stopped
    if (typeof window !== 'undefined') {
      const handleGlobalFirstClick = () => {
        if (!this.isPlaying && !this.userExplicitlyStopped) {
          this.play().catch(() => {});
        }
      };

      window.addEventListener('click', handleGlobalFirstClick, { once: true });
      window.addEventListener('touchstart', handleGlobalFirstClick, { once: true });
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.warn('Audio listener error:', err);
      }
    });
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrack: this.getCurrentTrack(),
      autoSwitchBySection: this.autoSwitchBySection,
    };
  }

  public setAutoSwitchBySection(val: boolean) {
    this.autoSwitchBySection = val;
    this.notify();
  }

  public getAutoSwitchBySection(): boolean {
    return this.autoSwitchBySection;
  }

  public switchSectionSoundtrack(sectionKey: 'catalog' | 'customizer' | 'team_kits' | 'slot' | 'referral' | 'tracker') {
    const targetIdx = this.tracks.findIndex((t) => t.sectionKey === sectionKey);
    if (targetIdx !== -1 && targetIdx !== this.currentTrackIndex) {
      this.setTrack(targetIdx);
      if (!this.isPlaying && !this.userExplicitlyStopped) {
        this.play().catch(() => {});
      }
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      const currentVol = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(currentVol, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    const targetVol = this.isMuted ? 0 : this.volume;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.05);
    }
    if (this.customAudio) {
      this.customAudio.volume = targetVol;
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.initContext();
    if (this.isMuted) {
      this.isMuted = false;
      this.setVolume(this.prevVolume || 0.18);
    } else {
      this.prevVolume = this.volume > 0 ? this.volume : 0.18;
      this.isMuted = true;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
      }
      if (this.customAudio) {
        this.customAudio.volume = 0;
      }
    }
    this.notify();
    return this.isMuted;
  }

  public getCurrentTrack(): AudioTrackInfo {
    if (this.customTrackName) {
      return {
        id: 'custom',
        title: this.customTrackName,
        section: 'Música Personalizada',
        sectionKey: 'custom',
        style: 'Audio Personalizado Subido',
        bpm: 120,
        mood: 'Personalizado',
        color: '#3B82F6',
      };
    }
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public async play() {
    this.userExplicitlyStopped = false;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.customAudio && this.customTrackName) {
      this.isPlaying = true;
      this.customAudio.play().catch(() => {});
      this.notify();
      return;
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.notify();
    this.scheduleBeatLoop();
  }

  public pause() {
    this.userExplicitlyStopped = true;
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.notify();
  }

  public stop() {
    this.userExplicitlyStopped = true;
    this.isPlaying = false;
    this.step = 0;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
    }
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public setTrack(index: number) {
    this.customTrackName = null;
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    this.step = 0;
    this.notify();
  }

  public nextTrack() {
    this.setTrack(this.currentTrackIndex + 1);
    if (!this.isPlaying && !this.userExplicitlyStopped) {
      this.play().catch(() => {});
    }
  }

  public prevTrack() {
    this.setTrack(this.currentTrackIndex - 1);
    if (!this.isPlaying && !this.userExplicitlyStopped) {
      this.play().catch(() => {});
    }
  }

  public loadCustomAudioFile(file: File) {
    this.initContext();
    if (this.customAudio) {
      this.customAudio.pause();
    }
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = this.isMuted ? 0 : this.volume;

    this.customAudio = audio;
    this.customTrackName = file.name.replace(/\.[^/.]+$/, '');

    this.userExplicitlyStopped = false;
    this.isPlaying = true;
    this.customAudio.play().catch(() => {});
    this.notify();
  }

  // Generative Procedural Synthesis for 6 section soundtracks
  private scheduleBeatLoop = () => {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const track = this.tracks[this.currentTrackIndex] || this.tracks[0];
    const stepDuration = 60 / track.bpm / 4; // 16th note in seconds

    this.playStepNotes(this.step, track.id);
    this.step = (this.step + 1) % 64;

    this.timerId = window.setTimeout(this.scheduleBeatLoop, stepDuration * 1000);
  };

  private playStepNotes(step: number, trackId: string) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // =========================================================================
    // Track 1: Trinity Glory (Catalog & Street Drops)
    // Style: Urban Ambient Gospel / Celestial Pad / Trinity Chimes
    // =========================================================================
    if (trackId === 'trinity_glory') {
      const chordIndex = Math.floor(step / 16) % 4;
      const chords = [
        [146.83, 185.00, 220.00, 277.18], // D maj 9
        [123.47, 146.83, 185.00, 220.00], // B min 9
        [98.00,  123.47, 146.83, 185.00], // G maj 9
        [110.00, 146.83, 164.81, 220.00], // A 11
      ];

      // Celestial pad
      if (step % 16 === 0) {
        chords[chordIndex].forEach((freq, idx) => {
          this.playSmoothPadNote(freq, t, 3.6, 0.08 - idx * 0.012);
        });
      }

      // Trinity Chime Bells
      if (step % 8 === 0) {
        const bells = [587.33, 739.99, 880.00, 1174.66];
        const bellNote = bells[(step / 8 + chordIndex) % bells.length];
        this.playPluckNote(bellNote, t, 0.7, 0.045);
      }

      // Sub Bass
      if (step % 8 === 0 || step % 16 === 6 || step % 16 === 12) {
        const rootBass = [73.42, 61.74, 49.00, 55.00][chordIndex];
        this.playDeepSubBass(rootBass, t, 0.45, 0.16);
      }

      // Soft Kick
      if (step % 16 === 0 || step % 16 === 10) {
        this.playSoftKick(t, 0.14);
      }

      // Snare Rim
      if (step % 16 === 8) {
        this.playWarmSnare(t, 0.08);
      }

      // Hi-Hat
      if (step % 2 === 0) {
        this.playGentleHiHat(t, 0.025);
      }
    }

    // =========================================================================
    // Track 2: Cyber Customizer (Customizer Studio 3D)
    // Style: Lo-Fi Trap / 808 Sub-Bass / Cyber Dream Arpeggios
    // =========================================================================
    else if (trackId === 'cyber_customizer') {
      const chordIndex = Math.floor(step / 16) % 4;
      const chords = [
        [130.81, 155.56, 196.00, 246.94], // C minor 9
        [116.54, 146.83, 174.61, 220.00], // Bb maj 7
        [103.83, 130.81, 155.56, 196.00], // Ab maj 7
        [98.00,  123.47, 146.83, 174.61], // G minor 7
      ];

      if (step % 16 === 0) {
        chords[chordIndex].forEach((freq, idx) => {
          this.playSmoothPadNote(freq, t, 3.2, 0.08 - idx * 0.015);
        });
      }

      // Bouncy 808 Trap Sub Bass
      if (step % 8 === 0 || step % 16 === 6 || step % 16 === 14) {
        const rootFreqs = [65.41, 58.27, 51.91, 49.00];
        const bassFreq = rootFreqs[chordIndex];
        this.playDeepSubBass(bassFreq, t, 0.45, 0.19);
      }

      // Punchy kick
      if (step % 16 === 0 || step % 16 === 10) {
        this.playSoftKick(t, 0.16);
      }

      if (step % 16 === 8) {
        this.playWarmSnare(t, 0.10);
      }

      // Faster trap hi-hats
      if (step % 2 === 0 || (step % 8 === 6)) {
        this.playGentleHiHat(t, step % 4 === 0 ? 0.035 : 0.02);
      }

      // Tech Arpeggios
      if (step % 4 === 2 || step % 8 === 7) {
        const arpeggios = [392.00, 440.00, 523.25, 587.33, 659.25];
        const note = arpeggios[(step * 3) % arpeggios.length];
        this.playPluckNote(note, t, 0.35, 0.04);
      }
    }

    // =========================================================================
    // Track 3: Stadium Drill (Team Kit Builder & Pro Locker)
    // Style: Athletic Drill / Heavy 808 Glide / Brass Stabs
    // =========================================================================
    else if (trackId === 'stadium_hype') {
      const chordIndex = Math.floor(step / 16) % 4;
      const drillRoots = [87.31, 77.78, 69.30, 82.41]; // F, Eb, Db, E
      
      // Brass stab on beat 1 and 3
      if (step % 16 === 0 || step % 16 === 6 || step % 16 === 12) {
        const brassFreq = [349.23, 311.13, 277.18, 329.63][chordIndex];
        this.playBrassStab(brassFreq, t, 0.45, 0.09);
        this.playBrassStab(brassFreq * 1.5, t, 0.45, 0.06);
      }

      // Heavy 808 Glide
      if (step % 8 === 0 || step % 16 === 7 || step % 16 === 14) {
        this.playDeepSubBass(drillRoots[chordIndex], t, 0.5, 0.22);
      }

      // Heavy kick
      if (step % 16 === 0 || step % 16 === 8 || step % 16 === 11) {
        this.playSoftKick(t, 0.18);
      }

      // Crisp drill snare
      if (step % 16 === 6 || step % 16 === 14) {
        this.playWarmSnare(t, 0.12);
      }

      // Triple hi-hat roll
      if (step % 2 === 0 || step % 8 === 5 || step % 8 === 6) {
        this.playGentleHiHat(t, 0.03);
      }
    }

    // =========================================================================
    // Track 4: Arcade Cyberwave (Street Loot Slot Machine)
    // Style: Retrowave 80s / Katakana Arps / Running Synth Bass
    // =========================================================================
    else if (trackId === 'arcade_cyberwave') {
      const chordIndex = Math.floor(step / 16) % 4;
      const chords = [
        [146.83, 174.61, 220.00, 261.63], // D minor 7
        [164.81, 196.00, 246.94, 293.66], // E minor 7
        [174.61, 220.00, 261.63, 329.63], // F maj 7
        [164.81, 196.00, 246.94, 293.66], // E minor 7
      ];

      // Retro Saw Synth Pad
      if (step % 16 === 0) {
        chords[chordIndex].forEach((freq) => {
          this.playAnalogWarmSynth(freq, t, 3.4, 0.07);
        });
      }

      // Running 16th Synth Bassline
      if (step % 4 === 0 || step % 4 === 2) {
        const rootBass = [73.42, 82.41, 87.31, 82.41][chordIndex];
        this.playAnalogBass(rootBass, t, 0.22, 0.12);
      }

      // Four-on-the-floor kick
      if (step % 4 === 0) {
        this.playSoftKick(t, 0.13);
      }

      // Cyber Snare on 2 and 4
      if (step % 8 === 4) {
        this.playWarmSnare(t, 0.09);
      }

      // Arcade Lead Melody
      if (step % 4 === 3 || step % 8 === 1) {
        const arcadeNotes = [587.33, 659.25, 698.46, 783.99, 880.00, 1046.50];
        const pitch = arcadeNotes[(step + chordIndex) % arcadeNotes.length];
        this.playPluckNote(pitch, t, 0.35, 0.04);
      }
    }

    // =========================================================================
    // Track 5: Ambassador Lounge (Referral & Ambassadors Hub)
    // Style: 90s Vintage Boombap / Rhodes Electric Piano / Warm Lounge
    // =========================================================================
    else if (trackId === 'ambassador_lounge') {
      const chordIndex = Math.floor(step / 16) % 4;
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // C maj 9
        [110.00, 138.59, 164.81, 207.65], // A minor 9
        [146.83, 174.61, 220.00, 261.63], // D minor 9
        [98.00,  123.47, 146.83, 174.61], // G 13
      ];

      // Smooth Rhodes Chords
      if (step % 16 === 0 || step % 16 === 6) {
        chords[chordIndex].forEach((freq) => {
          this.playRhodesNote(freq, t, 2.2, 0.08);
        });
      }

      // Warm Boombap Bass
      if (step % 8 === 0 || step % 16 === 10) {
        const rootBass = [65.41, 55.00, 73.42, 49.00][chordIndex];
        this.playDeepSubBass(rootBass, t, 0.5, 0.16);
      }

      // Boombap Kick
      if (step % 16 === 0 || step % 16 === 3 || step % 16 === 10) {
        this.playSoftKick(t, 0.14);
      }

      // Fat Snare
      if (step % 16 === 4 || step % 16 === 12) {
        this.playWarmSnare(t, 0.11);
      }

      // Shaker Groove
      if (step % 2 === 0) {
        this.playGentleHiHat(t, 0.025);
      }
    }

    // =========================================================================
    // Track 6: Factory Midnight (Order Tracker & Live Workshop)
    // Style: Minimal Darkwave / Sub Pulsar / Industrial Precision
    // =========================================================================
    else if (trackId === 'factory_midnight') {
      const chordIndex = Math.floor(step / 16) % 2;
      // E minor / C Major
      const roots = [82.41, 65.41];

      // Ambient Dark Drone
      if (step % 32 === 0) {
        this.playSmoothPadNote(roots[chordIndex] * 2, t, 6.0, 0.06);
        this.playSmoothPadNote(roots[chordIndex] * 3, t, 6.0, 0.04);
      }

      // Pulsar Sub Bass
      if (step % 8 === 0 || step % 16 === 6 || step % 16 === 12) {
        this.playDeepSubBass(roots[chordIndex], t, 0.6, 0.20);
      }

      // Industrial Sub Kick
      if (step % 16 === 0 || step % 16 === 8) {
        this.playSoftKick(t, 0.15);
      }

      // Factory Metal Click / Precision Snare
      if (step % 16 === 4 || step % 16 === 12) {
        this.playMetalClick(t, 0.06);
      }

      // Minimal Tick (Clock/Production beat)
      if (step % 2 === 0) {
        this.playGentleHiHat(t, 0.015);
      }
    }
  }

  // --- Sound synthesis primitives ---

  private playSmoothPadNote(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(1200, time + duration * 0.5);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playAnalogWarmSynth(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.linearRampToValueAtTime(850, time + 0.8);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playBrassStab(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.01, time); // slight detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(2400, time + 0.08);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private playAnalogBass(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playRhodesNote(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    oscHarmonic.start(time);
    osc.stop(time + duration);
    oscHarmonic.stop(time + duration);
  }

  private playDeepSubBass(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playPluckNote(freq: number, time: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSoftKick(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playWarmSnare(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.14);
  }

  private playMetalClick(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.03);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playGentleHiHat(time: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  // INTERACTIVE STREETWEAR SFX METHODS
  public playClickSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {
      // safe fallback
    }
  }

  public playSprayCanSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.36);
    } catch (e) {
      // safe fallback
    }
  }

  public playTapeScratchSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      // safe fallback
    }
  }

  public playCashChimeSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.09, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.32);
      });
    } catch (e) {
      // safe fallback
    }
  }

  public playWhooshSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      // safe fallback
    }
  }

  public playLeverPull() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.05, 0.09, 0.14].forEach((offset, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + i * 70, now + offset);
        osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.04);
        gain.gain.setValueAtTime(0.14, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.045);
      });
    } catch (e) {
      // safe fallback
    }
  }

  public playSlotSpin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      // safe fallback
    }
  }

  public playSlotReelStop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } catch (e) {
      // safe fallback
    }
  }

  public playSlotJackpot() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      fanfare.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.42);
      });
    } catch (e) {
      // safe fallback
    }
  }
}

export const audioEngine = new BackgroundAudioEngine();
