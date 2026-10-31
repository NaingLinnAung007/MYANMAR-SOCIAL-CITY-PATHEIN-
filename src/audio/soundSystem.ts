/**
 * Web Audio API procedural sound synthesizer for Pathein, Myanmar
 * Zero external 404 dependencies - all sounds generated procedurally!
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientTimer: number | null = null;
  private isAmbientRunning: boolean = false;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainRunning: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx?.currentTime || 0);
    }
    if (this.rainGain) {
      this.rainGain.gain.setValueAtTime(muted ? 0 : 0.18, this.ctx?.currentTime || 0);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Shwemokhtaw Pagoda traditional bronze bell strike (ကြေးခေါင်းလောင်းသံ)
   */
  public playPagodaBell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const fundamental = 392; // G4 bell tone

    // Bell harmonics
    const harmonics = [1, 2.01, 2.98, 4.2, 5.4];
    const gains = [0.6, 0.4, 0.25, 0.15, 0.08];

    harmonics.forEach((ratio, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(fundamental * ratio, t);

      gain.gain.setValueAtTime(gains[idx] * 0.4, t);
      // Long resonant decay for temple bell
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 4.5);
    });
  }

  /**
   * Pagoda spire wind chimes / Hti bell tinkling (စေတီထီးတော် ဆည်းလည်းသံ)
   */
  public playWindChimes() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const pitches = [1318.5, 1567.98, 1760.0, 2093.0, 2349.32]; // E6, G6, A6, C7, D7
    const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomPitch, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.8);
  }

  /**
   * River gentle wave / water splash
   */
  public playRiverWater() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  /**
   * Character Footstep sound
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Jump sound
   */
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Interaction chime
   */
  public playInteraction() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.1, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  /**
   * Start soft soothing ambient Myanmar melodic harp / atmosphere
   */
  public startAmbientAtmosphere() {
    if (this.isAmbientRunning) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isAmbientRunning = true;
    const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C, D, E, G, A, C

    const playMelodicDrop = () => {
      if (!this.isAmbientRunning || this.isMuted || !this.ctx) return;
      const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.5);

      // Random wind chimes occasionally
      if (Math.random() > 0.6) {
        setTimeout(() => this.playWindChimes(), 600);
      }

      this.ambientTimer = window.setTimeout(playMelodicDrop, 3200 + Math.random() * 2800);
    };

    this.ambientTimer = window.setTimeout(playMelodicDrop, 1000);
  }

  public stopAmbient() {
    this.isAmbientRunning = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  /**
   * Procedural tropical rain sound synthesis (မိုးသံ)
   * Simulates continuous warm delta monsoon shower with soft water droplets
   */
  public startRainAudio() {
    if (this.isRainRunning) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isRainRunning = true;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 3.0; // 3 second looping buffer
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

    // Generate soft pink/brown filtered noise
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Soft lowpass accumulation for soothing rain sound
        lastOut = (lastOut + 0.025 * white) / 1.025;
        data[i] = lastOut * 1.8;
      }
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Filter to shape rain frequency
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // High shelf for gentle pitter-patter
    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.setValueAtTime(2800, this.ctx.currentTime);
    highShelf.gain.setValueAtTime(4.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(highShelf);
    highShelf.connect(gain);
    gain.connect(this.ctx.destination);

    rainSource.start();

    this.rainSource = rainSource;
    this.rainGain = gain;
  }

  public stopRainAudio() {
    if (!this.isRainRunning) return;
    this.isRainRunning = false;
    if (this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch {
        // already stopped
      }
      this.rainSource = null;
    }
    this.rainGain = null;
  }
}

export const sound = new SoundSystem();
