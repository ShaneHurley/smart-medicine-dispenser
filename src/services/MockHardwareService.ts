import type {
  IHardwareService,
  HardwareTelemetry,
  DispenseResult,
  DispenseState,
  BuzzerPattern,
} from './IHardwareService.ts';
import type { DispenseProfile } from '../domain/Medicine.ts';
import { AudioManager } from './AudioManager.ts';

export class MockHardwareService implements IHardwareService {
  private static instance: MockHardwareService;
  private audioManager: AudioManager = AudioManager.getInstance();

  private telemetry: HardwareTelemetry = {
    timestamp: Date.now(),
    dispenseState: 'idle',
    stepperAngleDeg: 0,
    stepperRunning: false,
    servoAngleDeg: 0,
    opticalBeamBroken: false,
    pillDetectedInChute: false,
    trayOccupied: false,
    unclaimedTimerSeconds: 0,
    buzzerActive: false,
    buzzerPattern: 'stop',
    motorVoltage: 12.14,
    espTemperatureC: 24.2,
    activeChamber: 1,
    lastDispenseSuccess: null,
    jamDetected: false,
    firmwareVersion: 'ESP32S3-v1.4.2-LFS',
  };

  private listeners: Set<(t: HardwareTelemetry) => void> = new Set();
  private unclaimedInterval: any = null;
  private unclaimedTimeoutSec: number = 15; // 15 seconds simulation window
  private isJamSimulated: boolean = false;
  private animationFrameId: any = null;

  private constructor() {
    // Ambient telemetry jitter loop (battery, temperature)
    setInterval(() => {
      this.telemetry.timestamp = Date.now();
      this.telemetry.espTemperatureC = Number((24.0 + Math.sin(Date.now() / 15000) * 0.8).toFixed(1));
      this.telemetry.motorVoltage = Number((12.1 + (Math.random() - 0.5) * 0.08).toFixed(2));
      this.notify();
    }, 2000);
  }

  public static getInstance(): MockHardwareService {
    if (!MockHardwareService.instance) {
      MockHardwareService.instance = new MockHardwareService();
    }
    return MockHardwareService.instance;
  }

  public subscribeToTelemetry(callback: (t: HardwareTelemetry) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.telemetry });
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const snapshot = { ...this.telemetry };
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  public async getHardwareStatus(): Promise<HardwareTelemetry> {
    return { ...this.telemetry };
  }

  public setUnclaimedTimeout(seconds: number) {
    this.unclaimedTimeoutSec = Math.max(1, seconds);
  }

  public simulateJam(active: boolean) {
    this.isJamSimulated = active;
    this.telemetry.jamDetected = active;
    if (active && this.telemetry.dispenseState !== 'idle') {
      this.telemetry.dispenseState = 'jammed';
      this.triggerBuzzer('jam_error');
    } else if (!active && this.telemetry.dispenseState === 'jammed') {
      this.telemetry.dispenseState = 'idle';
      this.triggerBuzzer('stop');
    }
    this.notify();
  }

  public simulateOpticalDrop(detected: boolean) {
    this.telemetry.opticalBeamBroken = detected;
    this.telemetry.pillDetectedInChute = detected;
    this.notify();
    if (detected) {
      setTimeout(() => {
        this.telemetry.opticalBeamBroken = false;
        this.notify();
      }, 350);
    }
  }

  public async triggerBuzzer(pattern: BuzzerPattern): Promise<void> {
    this.telemetry.buzzerActive = pattern !== 'stop';
    this.telemetry.buzzerPattern = pattern;
    this.audioManager.playPattern(pattern);
    this.notify();

    if (pattern === 'beep' || pattern === 'confirm' || pattern === 'reminder') {
      setTimeout(() => {
        if (this.telemetry.buzzerPattern === pattern) {
          this.telemetry.buzzerActive = false;
          this.telemetry.buzzerPattern = 'stop';
          this.notify();
        }
      }, 1200);
    }
  }

  public async setServoAngle(angleDeg: number): Promise<void> {
    const clamped = Math.max(0, Math.min(90, angleDeg));
    const start = this.telemetry.servoAngleDeg;
    const diff = clamped - start;
    const steps = 10;
    const stepDuration = 20;

    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, stepDuration));
      this.telemetry.servoAngleDeg = Math.round(start + (diff * i) / steps);
      this.notify();
    }
  }

  public async reverseStepper(chamberId: number, degrees: number, _speed: number = 2000): Promise<void> {
    this.telemetry.stepperRunning = true;
    this.telemetry.activeChamber = chamberId;
    this.notify();

    const startDeg = this.telemetry.stepperAngleDeg;
    const totalSteps = 15;
    const stepTime = 20;

    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, stepTime));
      let current = startDeg - (degrees * i) / totalSteps;
      while (current < 0) current += 360;
      this.telemetry.stepperAngleDeg = Math.round(current) % 360;
      this.notify();
    }

    this.telemetry.stepperRunning = false;
    this.notify();
  }

  public async rotateStepper(chamberId: number, targetDeg: number, _speed: number): Promise<void> {
    this.telemetry.stepperRunning = true;
    this.telemetry.activeChamber = chamberId;
    this.notify();

    const startDeg = this.telemetry.stepperAngleDeg;
    let delta = (targetDeg - startDeg) % 360;
    if (delta < 0) delta += 360;
    const totalSteps = 24;
    const stepTime = 25;

    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, stepTime));
      this.telemetry.stepperAngleDeg = Math.round((startDeg + (delta * i) / totalSteps) % 360);
      this.notify();
    }

    this.telemetry.stepperRunning = false;
    this.notify();
  }

  public async dispensePill(
    chamberId: number,
    profile?: DispenseProfile
  ): Promise<DispenseResult> {
    // Safety check 1: Reject if tray already contains an unclaimed pill
    if (this.telemetry.trayOccupied) {
      return {
        success: false,
        chamberId,
        durationMs: 0,
        beamBreakDurationMs: 0,
        errorCode: 'TRAY_OCCUPIED',
        message: 'Pickup tray already contains an unretrieved pill. Please retrieve it before dispensing another dose.',
      };
    }

    // Safety check 2: Reject if mechanism is active in non-idle state
    if (this.telemetry.dispenseState !== 'idle') {
      return {
        success: false,
        chamberId,
        durationMs: 0,
        beamBreakDurationMs: 0,
        errorCode: 'BUSY',
        message: `Hardware busy in state: ${this.telemetry.dispenseState}`,
      };
    }

    const startTime = Date.now();
    this.telemetry.activeChamber = chamberId;
    this.telemetry.lastDispenseSuccess = null;

    // Target carousel index: Chamber 1=45°, 2=135°, 3=225°, 4=315°
    const chamberAngles: Record<number, number> = { 1: 45, 2: 135, 3: 225, 4: 315 };
    const targetAngle = chamberAngles[chamberId] ?? 45;

    // STEP 1: Rotate Stepper Motor to Chamber
    this.telemetry.dispenseState = 'indexing_motor';
    this.notify();
    await this.rotateStepper(chamberId, targetAngle, profile?.stepDelayUs ?? 1200);

    // Simulated Jam Check
    if (this.isJamSimulated) {
      this.telemetry.dispenseState = 'jammed';
      this.telemetry.jamDetected = true;
      this.triggerBuzzer('jam_error');
      // Auto-recovery reverse rotation: Smooth counter-clockwise 15° backoff
      await this.reverseStepper(chamberId, 15, 2000);
      this.notify();
      return {
        success: false,
        chamberId,
        durationMs: Date.now() - startTime,
        beamBreakDurationMs: 0,
        errorCode: 'STALLGUARD_JAM',
        message: 'TMC2209 StallGuard detected torque threshold limit! Motor reversed 15° to clear jam.',
      };
    }

    // STEP 2: Micro-vibrational Jitter (if profile specifies for capsules)
    if (profile && profile.vibrationJitterSteps > 0) {
      this.telemetry.dispenseState = 'vibrating';
      this.notify();
      for (let j = 0; j < profile.vibrationJitterSteps; j++) {
        this.telemetry.stepperAngleDeg = (this.telemetry.stepperAngleDeg + 3) % 360;
        this.notify();
        await new Promise((r) => setTimeout(r, 40));
        this.telemetry.stepperAngleDeg = (this.telemetry.stepperAngleDeg - 3 + 360) % 360;
        this.notify();
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    // STEP 3: Actuate Servo Trapdoor Gate Open
    this.telemetry.dispenseState = 'opening_gate';
    this.notify();
    await this.setServoAngle(90);

    // STEP 4: Optical Beam Break Drop Detection
    this.telemetry.dispenseState = 'verifying_beam_break';
    this.notify();
    await new Promise((r) => setTimeout(r, 200));

    // Pill crosses IR beam
    this.telemetry.opticalBeamBroken = true;
    this.telemetry.pillDetectedInChute = true;
    this.notify();
    this.triggerBuzzer('confirm');

    await new Promise((r) => setTimeout(r, profile?.servoGateHoldMs ?? 800));

    this.telemetry.opticalBeamBroken = false;
    this.notify();

    // STEP 5: Close Trapdoor
    this.telemetry.dispenseState = 'closing_gate';
    this.notify();
    await this.setServoAngle(0);

    // STEP 6: Waiting for Patient Pickup + Start Unclaimed Timer Countdown
    this.telemetry.dispenseState = 'waiting_pickup';
    this.telemetry.trayOccupied = true;
    this.telemetry.lastDispenseSuccess = true;
    this.telemetry.unclaimedTimerSeconds = this.unclaimedTimeoutSec;
    this.notify();

    this.startUnclaimedCountdown();

    const totalDuration = Date.now() - startTime;
    return {
      success: true,
      chamberId,
      durationMs: totalDuration,
      beamBreakDurationMs: 280,
      message: `Pill successfully dispensed from Chamber ${chamberId} in ${totalDuration}ms.`,
    };
  }

  private startUnclaimedCountdown() {
    if (this.unclaimedInterval) {
      clearInterval(this.unclaimedInterval);
    }

    this.unclaimedInterval = setInterval(() => {
      if (this.telemetry.dispenseState !== 'waiting_pickup' && this.telemetry.dispenseState !== 'unclaimed_alarm') {
        clearInterval(this.unclaimedInterval);
        this.unclaimedInterval = null;
        return;
      }

      if (this.telemetry.unclaimedTimerSeconds > 0) {
        this.telemetry.unclaimedTimerSeconds -= 1;
        this.notify();

        if (this.telemetry.unclaimedTimerSeconds === 0) {
          // TIME EXPIRED! Pill was not picked up. Enter escalating alert state!
          this.telemetry.dispenseState = 'unclaimed_alarm';
          this.triggerBuzzer('unclaimed_alert');
          this.notify();
        }
      }
    }, 1000);
  }

  public async acknowledgePickup(): Promise<void> {
    if (this.unclaimedInterval) {
      clearInterval(this.unclaimedInterval);
      this.unclaimedInterval = null;
    }

    this.triggerBuzzer('stop');
    this.telemetry.trayOccupied = false;
    this.telemetry.unclaimedTimerSeconds = 0;
    this.telemetry.dispenseState = 'idle';
    this.telemetry.pillDetectedInChute = false;
    this.notify();

    // Pleasant confirmation chime
    await this.audioManager.playPattern('confirm');
  }
}
