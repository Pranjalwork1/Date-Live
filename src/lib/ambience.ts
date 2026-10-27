// Romantic Cozy Soundscapes via Web Audio API (Zero external assets, 100% original & royalty-free)

export type AmbienceType = 'rain' | 'fireplace' | 'starlight';

class AmbienceManager {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentType: AmbienceType | null = null;
  private isPlaying = false;
  private stopFunction: (() => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.15; // default subtle gentle volume
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public start(type: AmbienceType) {
    if (typeof window === 'undefined') return;
    this.stop();
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.currentType = type;
    this.isPlaying = true;

    if (type === 'rain') {
      this.stopFunction = this.createRain(this.ctx, this.gainNode);
    } else if (type === 'fireplace') {
      this.stopFunction = this.createFireplace(this.ctx, this.gainNode);
    } else if (type === 'starlight') {
      this.stopFunction = this.createStarlight(this.ctx, this.gainNode);
    }
  }

  public stop() {
    if (this.stopFunction) {
      try {
        this.stopFunction();
      } catch {
        // cleanup safe
      }
      this.stopFunction = null;
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
    };
  }

  // Gentle Pink Noise Rain
  private createRain(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like rain outside window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start(0);

    return () => {
      whiteNoise.stop();
      whiteNoise.disconnect();
      filter.disconnect();
    };
  }

  // Crackling Fireplace
  private createFireplace(ctx: AudioContext, destination: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 90; // deep warm hearth rumble

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 180;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.25;

    osc.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(destination);
    osc.start();

    // Occasional subtle crackle
    const interval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      try {
        const snap = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snap.type = 'square';
        snap.frequency.value = 800 + Math.random() * 1200;
        const initialGain = Math.max(0.0001, 0.04 * Math.random());
        snapGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        snap.connect(snapGain);
        snapGain.connect(destination);
        snap.start();
        snap.stop(this.ctx.currentTime + 0.05);
      } catch {
        // safe
      }
    }, 280);

    return () => {
      clearInterval(interval);
      osc.stop();
      osc.disconnect();
      lowpass.disconnect();
      rumbleGain.disconnect();
    };
  }

  // Starlight Ethereal Chord
  private createStarlight(ctx: AudioContext, destination: GainNode) {
    const freqs = [220, 277.18, 329.63, 440]; // A major 7th chord
    const oscillators: OscillatorNode[] = [];
    const localGain = ctx.createGain();
    localGain.gain.value = 0.05;
    localGain.connect(destination);

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(localGain);
      osc.start();
      oscillators.push(osc);
    });

    return () => {
      oscillators.forEach((osc) => {
        osc.stop();
        osc.disconnect();
      });
      localGain.disconnect();
    };
  }
}

export const ambienceManager = new AmbienceManager();
