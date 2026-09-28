class EngineAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted = true;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      // Audio not supported
    }
  }

  public toggle(): boolean {
    if (this.isMuted) {
      this.unmute();
      return true;
    } else {
      this.mute();
      return false;
    }
  }

  public unmute() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startNodes();
    this.isMuted = false;
  }

  public mute() {
    this.isMuted = true;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startNodes() {
    if (!this.ctx || this.isRunning) {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.1);
      }
      return;
    }

    try {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      // Low rumble
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sawtooth';
      this.subOsc.frequency.setValueAtTime(42, this.ctx.currentTime);

      // Mid combustion harmonic
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'triangle';
      this.osc1.frequency.setValueAtTime(84, this.ctx.currentTime);

      // High turbo harmonic
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(168, this.ctx.currentTime);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      const osc1Gain = this.ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      this.subOsc.connect(subGain);
      this.osc1.connect(osc1Gain);
      this.osc2.connect(osc2Gain);

      subGain.connect(this.filter);
      osc1Gain.connect(this.filter);
      osc2Gain.connect(this.filter);

      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.subOsc.start();
      this.osc1.start();
      this.osc2.start();
      this.isRunning = true;
    } catch {
      // Audio initialization error caught
    }
  }

  public updateRPM(rpm: number) {
    if (this.isMuted || !this.ctx || !this.isRunning) return;

    // RPM 800 (idle) → 6000 (redline)
    const normalized = Math.min(Math.max((rpm - 800) / 5200, 0), 1);
    const baseFreq = 38 + normalized * 65; // 38Hz → 103Hz
    const cutoff = 220 + normalized * 750; // 220Hz → 970Hz

    const t = this.ctx.currentTime;
    this.subOsc?.frequency.setTargetAtTime(baseFreq, t, 0.05);
    this.osc1?.frequency.setTargetAtTime(baseFreq * 2, t, 0.05);
    this.osc2?.frequency.setTargetAtTime(baseFreq * 4, t, 0.05);
    this.filter?.frequency.setTargetAtTime(cutoff, t, 0.05);
  }
}

export const engineAudio = new EngineAudioSynthesizer();
