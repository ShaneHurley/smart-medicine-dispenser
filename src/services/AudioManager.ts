import type { BuzzerPattern } from './IHardwareService.ts';

/**
 * Web Audio API synthesizer for the ESP32 Piezo Buzzer.
 * Generates tactile auditory feedback directly in the browser.
 */
export class AudioManager {
  private static instance: AudioManager;
  private audioCtx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private currentGainNodes: GainNode[] = [];
  private isMuted: boolean = false;
  private masterGain: number = 0.2;
  private alarmIntervalId: any = null;

  private constructor() {
    // Lazily initialized on first user interaction
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.masterGain = Math.max(0, Math.min(1, volume));
  }

  public playPattern(pattern: BuzzerPattern) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.stop();

    switch (pattern) {
      case 'beep':
        this.playBeep(660, 0.08);
        break;
      case 'confirm':
        this.playChord([523.25, 659.25, 783.99], 0.25); // C5 Major chord
        break;
      case 'reminder':
        this.playChime();
        break;
      case 'unclaimed_alert':
        this.startUnclaimedAlarm();
        break;
      case 'jam_error':
        this.playHarshBuzz();
        break;
      case 'stop':
      default:
        this.stop();
        break;
    }
  }

  public stop() {
    if (this.alarmIntervalId) {
      clearInterval(this.alarmIntervalId);
      this.alarmIntervalId = null;
    }
    for (const osc of this.currentOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    }
    for (const gain of this.currentGainNodes) {
      try {
        gain.disconnect();
      } catch (_) {}
    }
    this.currentOscillators = [];
    this.currentGainNodes = [];
  }

  private playTone(freq: number, durationSec: number, type: OscillatorType = 'sine', gainVal: number = 0.2) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainVal * this.masterGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + durationSec);

    this.currentOscillators.push(osc);
    this.currentGainNodes.push(gain);
  }

  private playBeep(freq: number = 660, duration: number = 0.08) {
    this.playTone(freq, duration, 'square', 0.15);
  }

  private playChime() {
    if (!this.audioCtx) return;
    // Pleasant 2-tone melodic chime: A5 (880Hz) followed by E6 (1318Hz)
    this.playTone(880, 0.2, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(1318.5, 0.35, 'sine', 0.22);
    }, 180);
  }

  private playChord(freqs: number[], durationSec: number) {
    for (const f of freqs) {
      this.playTone(f, durationSec, 'triangle', 0.12);
    }
  }

  private playHarshBuzz() {
    // 140Hz square wave with frequency drop
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.4);

    gain.gain.setValueAtTime(0.3 * this.masterGain, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
    this.currentOscillators.push(osc);
  }

  private startUnclaimedAlarm() {
    // Escalating alert pattern: 3 rapid 2730Hz beeps every 2.5 seconds
    const emitBurst = () => {
      this.playTone(2730, 0.12, 'square', 0.28);
      setTimeout(() => this.playTone(2730, 0.12, 'square', 0.28), 180);
      setTimeout(() => this.playTone(2730, 0.18, 'square', 0.32), 360);
    };

    emitBurst();
    this.alarmIntervalId = setInterval(() => {
      if (!this.isMuted) {
        emitBurst();
      }
    }, 2800);
  }
}
