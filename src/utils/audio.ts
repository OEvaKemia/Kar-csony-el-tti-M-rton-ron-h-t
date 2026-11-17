/**
 * Zero-dependency Procedural Web Audio API sound effects for Christmas Code 2077.
 * Generates sci-fi clicks, liquid drops, seals unlocking, scan sweeps, and victory fanfare.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private celebrationTimeouts: number[] = [];
  private celebrationNodes: { stop: () => void }[] = [];

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopCelebrationMusic();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Audio error silently ignored
    }
  }

  public playDrop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  public playSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.26);
      });
    } catch {}
  }

  public playError() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  public playSealUnlock() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Cosmic chime chord
      const chords = [440, 554.37, 659.25, 880, 1108.73];
      chords.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.2);
      });
    } catch {}
  }

  public playHologramReveal() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [261.63, 392.0, 493.88, 659.25, 783.99]; // Cmaj9 ethereal shimmer
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * 0.98, now + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.08 + 0.45);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.08 + 2.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.2);
      });
    } catch {}
  }

  public playSceneTransition() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [293.66, 440.0, 587.33, 880.0]; // D5 open majestic chord
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.1);
        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.1 + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + 2.55);
      });
    } catch {}
  }

  public playFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const melody = [
        { freq: 523.25, dur: 0.15 }, // C5
        { freq: 523.25, dur: 0.15 }, // C5
        { freq: 523.25, dur: 0.15 }, // C5
        { freq: 659.25, dur: 0.4 },  // E5
        { freq: 587.33, dur: 0.2 },  // D5
        { freq: 783.99, dur: 0.7 },  // G5
        { freq: 1046.5, dur: 0.9 },  // C6
      ];

      let t = this.ctx.currentTime + 0.05;
      melody.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + note.dur + 0.05);
        t += note.dur * 0.85;
      });
    } catch {}
  }

  public stopCelebrationMusic() {
    this.celebrationTimeouts.forEach((id) => window.clearTimeout(id));
    this.celebrationTimeouts = [];
    this.celebrationNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    this.celebrationNodes = [];
  }

  /**
   * Short solemn instrumental wintry arrangement (celesta-bell melody + warm soft string pads).
   * Plays only when sound is enabled and cleans up automatically.
   */
  public playCelebrationMusic() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    this.stopCelebrationMusic();

    try {
      const ctx = this.ctx;
      const start = ctx.currentTime + 0.08;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.75, start);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, start);
      master.connect(filter);
      filter.connect(ctx.destination);

      const scheduleTone = (
        freq: number,
        offset: number,
        duration: number,
        type: OscillatorType,
        peakGain: number,
        attack = 0.04
      ) => {
        if (!this.enabled) return;
        const t0 = start + offset;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(peakGain, t0 + attack);
        g.gain.exponentialRampToValueAtTime(0.0005, t0 + duration);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
        this.celebrationNodes.push({
          stop: () => {
            try {
              g.gain.cancelScheduledValues(ctx.currentTime);
              g.gain.setValueAtTime(0.0001, ctx.currentTime);
              osc.stop(ctx.currentTime + 0.02);
            } catch {}
          },
        });
      };

      // Warm sustained harmonic chords (C -> G/B -> Am -> F -> C -> G -> C)
      const pads: { freqs: number[]; offset: number; dur: number }[] = [
        { freqs: [130.81, 196.0, 261.63, 329.63], offset: 0.0, dur: 2.2 },
        { freqs: [123.47, 196.0, 246.94, 293.66], offset: 2.0, dur: 2.2 },
        { freqs: [110.0, 220.0, 261.63, 329.63], offset: 4.0, dur: 2.2 },
        { freqs: [87.31, 174.61, 220.0, 261.63], offset: 6.0, dur: 2.2 },
        { freqs: [130.81, 196.0, 261.63, 329.63], offset: 8.0, dur: 2.0 },
        { freqs: [98.0, 196.0, 246.94, 293.66], offset: 9.8, dur: 2.0 },
        { freqs: [130.81, 196.0, 261.63, 392.0, 523.25], offset: 11.6, dur: 3.4 },
      ];

      pads.forEach((pad) => {
        pad.freqs.forEach((f) => {
          scheduleTone(f, pad.offset, pad.dur, 'sine', 0.036, 0.35);
        });
      });

      // Solemn winter bell melody
      const melody: { freq: number; offset: number; dur: number }[] = [
        { freq: 523.25, offset: 0.1, dur: 0.9 },  // C5
        { freq: 659.25, offset: 0.75, dur: 0.8 }, // E5
        { freq: 783.99, offset: 1.4, dur: 1.0 },  // G5
        { freq: 739.99, offset: 2.1, dur: 0.7 },  // F#5 -> gentle winter lift
        { freq: 783.99, offset: 2.65, dur: 1.2 }, // G5
        { freq: 659.25, offset: 3.4, dur: 0.9 },  // E5
        { freq: 523.25, offset: 4.1, dur: 1.1 },  // C5
        { freq: 587.33, offset: 4.9, dur: 0.8 },  // D5
        { freq: 659.25, offset: 5.5, dur: 1.0 },  // E5
        { freq: 698.46, offset: 6.1, dur: 0.9 },  // F5
        { freq: 659.25, offset: 6.8, dur: 0.8 },  // E5
        { freq: 587.33, offset: 7.4, dur: 1.0 },  // D5
        { freq: 523.25, offset: 8.1, dur: 1.0 },  // C5
        { freq: 659.25, offset: 8.85, dur: 0.9 }, // E5
        { freq: 783.99, offset: 9.5, dur: 0.9 },  // G5
        { freq: 880.0, offset: 10.15, dur: 0.9 }, // A5
        { freq: 987.77, offset: 10.85, dur: 0.9 },// B5
        { freq: 1046.5, offset: 11.65, dur: 2.8 },// C6
      ];

      melody.forEach((n) => {
        scheduleTone(n.freq, n.offset, n.dur, 'triangle', 0.085, 0.03);
        scheduleTone(n.freq * 2, n.offset, n.dur * 0.65, 'sine', 0.025, 0.015);
      });

      const cleanupTimer = window.setTimeout(() => {
        this.celebrationNodes = [];
        this.celebrationTimeouts = [];
      }, 15200);
      this.celebrationTimeouts.push(cleanupTimer);
    } catch {}
  }

  public playHiss() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // White noise burst for gas piston
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    } catch {}
  }
}

export const soundManager = new SoundSystem();
