import type { DispenseProfile } from '../domain/Medicine.ts';

export type DispenseState =
  | 'idle'
  | 'indexing_motor'
  | 'vibrating'
  | 'opening_gate'
  | 'verifying_beam_break'
  | 'closing_gate'
  | 'waiting_pickup'
  | 'unclaimed_alarm'
  | 'jammed'
  | 'error';

export type BuzzerPattern =
  | 'beep'
  | 'confirm'
  | 'reminder'
  | 'unclaimed_alert'
  | 'jam_error'
  | 'stop';

export interface HardwareTelemetry {
  timestamp: number;
  dispenseState: DispenseState;
  stepperAngleDeg: number;
  stepperRunning: boolean;
  servoAngleDeg: number;
  opticalBeamBroken: boolean;
  pillDetectedInChute: boolean;
  trayOccupied: boolean;
  unclaimedTimerSeconds: number;
  buzzerActive: boolean;
  buzzerPattern: BuzzerPattern;
  motorVoltage: number;
  espTemperatureC: number;
  activeChamber: number;
  lastDispenseSuccess: boolean | null;
  jamDetected: boolean;
  firmwareVersion: string;
}

export interface DispenseResult {
  success: boolean;
  chamberId: number;
  durationMs: number;
  beamBreakDurationMs: number;
  errorCode?: string;
  message: string;
}

export interface IHardwareService {
  /** Initiate single pill singulation and dispense */
  dispensePill(chamberId: number, profile?: DispenseProfile): Promise<DispenseResult>;

  /** Command the piezo buzzer to play an audio tone/pattern */
  triggerBuzzer(pattern: BuzzerPattern): Promise<void>;

  /** Directly control servo trapdoor angle (0 - 90 deg) */
  setServoAngle(angleDeg: number): Promise<void>;

  /** Directly command stepper rotation */
  rotateStepper(chamberId: number, steps: number, speed: number): Promise<void>;

  /** User confirms pill taken or tray microswitch sensor detects pickup */
  acknowledgePickup(): Promise<void>;

  /** Read current telemetry snapshot */
  getHardwareStatus(): Promise<HardwareTelemetry>;

  /** Subscribe to real-time telemetry stream */
  subscribeToTelemetry(callback: (telemetry: HardwareTelemetry) => void): () => void;

  /** Inject simulated mechanical jam (TMC2209 StallGuard trigger) */
  simulateJam(active: boolean): void;

  /** Manually trigger optical beam-break drop sensor */
  simulateOpticalDrop(detected: boolean): void;

  /** Configure timeout threshold before unclaimed alarm sounds */
  setUnclaimedTimeout(seconds: number): void;
}
