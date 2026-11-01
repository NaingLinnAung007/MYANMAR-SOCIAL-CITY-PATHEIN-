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

  // District-specific ambient sound system
  private currentDistrictId: string | null = null;
  private districtGain: GainNode | null = null;
  private districtActiveNodes: AudioNode[] = [];
  private districtIntervals: number[] = [];

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
    if (this.districtGain) {
      this.districtGain.gain.setValueAtTime(muted ? 0 : 0.22, this.ctx?.currentTime || 0);
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

  /**
   * Daily Quest Completion Celebratory Chime
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.12, t + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.65);
    });
  }

  /**
   * Coin / Merit claim reward chime
   */
  public playCoinReward() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.14, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.4);
    });
  }

  /**
   * District-Specific Dynamic Background Soundscape
   * Seamlessly switches audio when entering Shwemokhtaw, Riverfront, Market, Cafe, or Downtown
   */
  public setDistrictAmbient(districtId: string | null) {
    if (this.currentDistrictId === districtId) return;
    this.currentDistrictId = districtId;

    this.stopDistrictAmbient();
    if (!districtId) return;

    this.initCtx();
    if (!this.ctx) return;

    // Master gain node for district soundscape with cross-fade
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(
      this.isMuted ? 0.0001 : 0.22,
      this.ctx.currentTime + 1.2
    );
    masterGain.connect(this.ctx.destination);
    this.districtGain = masterGain;

    if (districtId === 'shwemokhtaw') {
      this.startPagodaChanting(masterGain);
    } else if (districtId === 'riverfront') {
      this.startRiverfrontFlow(masterGain);
    } else if (districtId === 'umbrella_market') {
      this.startUmbrellaMarketSound(masterGain);
    } else if (districtId === 'social_park') {
      this.startTeaCafeAmbiance(masterGain);
    } else if (districtId === 'downtown') {
      this.startDowntownAmbiance(masterGain);
    }
  }

  public stopDistrictAmbient() {
    // Clear recurring district timers
    this.districtIntervals.forEach(id => clearInterval(id));
    this.districtIntervals = [];

    // Fade out active nodes
    if (this.districtGain && this.ctx) {
      try {
        const curT = this.ctx.currentTime;
        this.districtGain.gain.setValueAtTime(this.districtGain.gain.value, curT);
        this.districtGain.gain.exponentialRampToValueAtTime(0.0001, curT + 0.6);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      this.districtActiveNodes.forEach(node => {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore
        }
      });
      this.districtActiveNodes = [];
      this.districtGain = null;
    }, 700);
  }

  /**
   * Shwemokhtaw Pagoda: Sacred Buddhist monks chanting drone & hti chimes
   * Produces authentic low resonant meditative chant drone with harmonic overtones
   */
  private startPagodaChanting(destNode: GainNode) {
    if (!this.ctx) return;

    // Low monk fundamental chants (110Hz A2, 165Hz E3, 220Hz A3)
    const chantFrequencies = [110.0, 165.0, 220.0];
    const chantGains = [0.18, 0.12, 0.08];

    // LFO to simulate deep breathing and mantra rhythmic modulation (approx 0.18Hz)
    const breathLfo = this.ctx.createOscillator();
    breathLfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const breathGain = this.ctx.createGain();
    breathGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    breathLfo.connect(breathGain);

    chantFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const chantGain = this.ctx.createGain();
      const formantFilter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Vocal formant filter (warm 'Oh'/'Ah' monastic vowel throat singing resonance)
      formantFilter.type = 'bandpass';
      formantFilter.frequency.setValueAtTime(freq * 3.2, this.ctx.currentTime);
      formantFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      chantGain.gain.setValueAtTime(chantGains[idx], this.ctx.currentTime);
      breathGain.connect(chantGain.gain);

      osc.connect(formantFilter);
      formantFilter.connect(chantGain);
      chantGain.connect(destNode);

      osc.start();
      this.districtActiveNodes.push(osc, formantFilter, chantGain);
    });

    breathLfo.start();
    this.districtActiveNodes.push(breathLfo, breathGain);

    // Periodic gentle Hti wind chime tinkle every 6-9 seconds
    const chimeTimer = window.setInterval(() => {
      if (!this.isMuted && this.currentDistrictId === 'shwemokhtaw') {
        this.playWindChimes();
      }
    }, 7500);
    this.districtIntervals.push(chimeTimer);
  }

  /**
   * Pathein Riverfront: Gentle flowing river current & waves lapping
   */
  private startRiverfrontFlow(destNode: GainNode) {
    if (!this.ctx) return;

    // Filtered pink noise loop for rushing water body
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 3.0;
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.28;
      }
    }

    const waterSource = this.ctx.createBufferSource();
    waterSource.buffer = buffer;
    waterSource.loop = true;

    // Filter simulating deep river channel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);

    // LFO for wave surges washing on river bank
    const surgeLfo = this.ctx.createOscillator();
    surgeLfo.frequency.setValueAtTime(0.22, this.ctx.currentTime);
    const surgeGain = this.ctx.createGain();
    surgeGain.gain.setValueAtTime(160, this.ctx.currentTime);
    surgeLfo.connect(surgeGain);
    surgeGain.connect(filter.frequency);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

    waterSource.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(destNode);

    waterSource.start();
    surgeLfo.start();
    this.districtActiveNodes.push(waterSource, filter, surgeLfo, surgeGain, waterGain);
  }

  /**
   * Pathein Umbrella Market: Colorful traditional bazaar ambiance
   */
  private startUmbrellaMarketSound(destNode: GainNode) {
    if (!this.ctx) return;

    // Light warm background hum
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(destNode);
    osc.start();
    this.districtActiveNodes.push(osc, oscGain);

    // Bamboo umbrella craft tap and wind chime pulses
    const marketTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.currentDistrictId !== 'umbrella_market') return;
      const t = this.ctx.currentTime;
      // Gentle wooden bamboo click
      const woodOsc = this.ctx.createOscillator();
      const woodGain = this.ctx.createGain();
      woodOsc.type = 'sine';
      woodOsc.frequency.setValueAtTime(680 + Math.random() * 200, t);
      woodGain.gain.setValueAtTime(0.06, t);
      woodGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      woodOsc.connect(woodGain);
      woodGain.connect(destNode);
      woodOsc.start(t);
      woodOsc.stop(t + 0.15);
    }, 2800);
    this.districtIntervals.push(marketTimer);
  }

  /**
   * Thiri Ayeyar Tea Cafe: Traditional Saung Gauk (Burmese harp) melodies
   */
  private startTeaCafeAmbiance(destNode: GainNode) {
    if (!this.ctx) return;

    const pentatonicHarp = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C
    const harpTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.currentDistrictId !== 'social_park') return;
      const t = this.ctx.currentTime;
      const note = pentatonicHarp[Math.floor(Math.random() * pentatonicHarp.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(gain);
      gain.connect(destNode);
      osc.start(t);
      osc.stop(t + 1.85);
    }, 3200);
    this.districtIntervals.push(harpTimer);
  }

  /**
   * Pathein Downtown: Town air & distant bicycle bell (Ting-Ting!)
   */
  private startDowntownAmbiance(destNode: GainNode) {
    if (!this.ctx) return;

    const bellTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.currentDistrictId !== 'downtown') return;
      const t = this.ctx.currentTime;
      // Authentic Myanmar trishaw / bicycle double ring (Ting-Ting!)
      [0, 0.16].forEach(delay => {
        if (!this.ctx) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'triangle';
        bellOsc.frequency.setValueAtTime(2489.02, t + delay); // D#7
        bellGain.gain.setValueAtTime(0.05, t + delay);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.35);
        bellOsc.connect(bellGain);
        bellGain.connect(destNode);
        bellOsc.start(t + delay);
        bellOsc.stop(t + delay + 0.4);
      });
    }, 6500);
    this.districtIntervals.push(bellTimer);
  }

  /**
   * Triumphant Level Up Fanfare & Royal Gong
   */
  public playLevelUpFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Ceremonial Royal Gong at fundamental
    const gong = this.ctx.createOscillator();
    const gongGain = this.ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(196.0, t); // G3
    gongGain.gain.setValueAtTime(0.3, t);
    gongGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
    gong.connect(gongGain);
    gongGain.connect(this.ctx.destination);
    gong.start(t);
    gong.stop(t + 3.6);

    // 2. Ascending golden fanfare arpeggio (C4, E4, G4, C5, E5, G5, C6)
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = idx === arpeggio.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.setValueAtTime(0.18, noteTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + (idx === arpeggio.length - 1 ? 1.5 : 0.6));

      osc.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.6);
    });

    // 3. Shimmering star sparkle cascade
    for (let i = 0; i < 6; i++) {
      const sparkleTime = t + 0.8 + i * 0.12;
      const spkOsc = this.ctx.createOscillator();
      const spkGain = this.ctx.createGain();
      spkOsc.type = 'sine';
      spkOsc.frequency.setValueAtTime(1500 + Math.random() * 1200, sparkleTime);
      spkGain.gain.setValueAtTime(0.07, sparkleTime);
      spkGain.gain.exponentialRampToValueAtTime(0.0001, sparkleTime + 0.35);
      spkOsc.connect(spkGain);
      spkGain.connect(this.ctx.destination);
      spkOsc.start(sparkleTime);
      spkOsc.stop(sparkleTime + 0.4);
    }
  }

  /**
   * Camera Shutter Click for Photo Mode
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Mechanical mirror flip
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(180, t);
    gain1.gain.setValueAtTime(0.15, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.07);

    // Sharp shutter curtain snap
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, t + 0.08);
    gain2.gain.setValueAtTime(0.18, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.15);
  }

  /**
   * Myanmar Traditional Radio Harp/Xylophone Tune (မြန်မာ့သံစဉ် ရေဒီယို သီချင်းသံ)
   */
  public playRadioTune() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pentatonic Myanmar classical notes (ပဉ္စမသံစဉ် - C, D, E, G, A)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.22;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  /**
   * Lucky Draw Dice Roll (🎲 ကံစမ်းမဲ လှည့်သံ)
   */
  public playLuckyDrawRoll() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const clickTime = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + Math.random() * 400, clickTime);

      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.05);
    }
  }

  /**
   * Lucky Draw Golden Win (🎲 ရွှေဆုကြီး ပေါက်သံ)
   */
  public playLuckyDrawWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    const t = this.ctx.currentTime;

    chords.forEach((freq, i) => {
      if (!this.ctx) return;
      const noteTime = t + i * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.25);
    });
  }
}

export const sound = new SoundSystem();

