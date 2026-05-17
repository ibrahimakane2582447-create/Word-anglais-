
// Utility to play discrete synthesized sound effects using Web Audio API
class SoundPlayer {
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  playCorrect() {
    // A nice upward "bing"
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 50); // E5
  }

  playIncorrect() {
    // A low "bzz"
    this.playTone(220, 'sawtooth', 0.15, 0.05); // A3
    setTimeout(() => this.playTone(180, 'sawtooth', 0.2, 0.05), 50);
  }

  playCreate() {
    // A digital "pop" or "whoosh"
    this.playTone(880, 'sine', 0.1, 0.1); // A5
  }

  playFinished() {
    // A "ta-da" or victory sound
    this.playTone(440, 'triangle', 0.1, 0.1);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.3, 0.1), 200);
  }
}

export const sounds = new SoundPlayer();
