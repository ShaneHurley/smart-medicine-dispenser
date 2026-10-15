import type {
  IHardwareService,
  HardwareTelemetry,
  DispenseResult,
  BuzzerPattern,
} from './IHardwareService.ts';
import type { DispenseProfile } from '../domain/Medicine.ts';

export class RealHardwareService implements IHardwareService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private listeners: Set<(t: HardwareTelemetry) => void> = new Set();
  private lastTelemetry: HardwareTelemetry = {
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
    motorVoltage: 12.0,
    espTemperatureC: 25.0,
    activeChamber: 1,
    lastDispenseSuccess: null,
    jamDetected: false,
    firmwareVersion: 'ESP32S3-Hardware-v1.0',
  };

  constructor(host: string = window.location.hostname || '192.168.4.1') {
    this.baseUrl = `http://${host}`;
    this.wsUrl = `ws://${host}/ws`;
    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (typeof WebSocket === 'undefined') return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.lastTelemetry = { ...this.lastTelemetry, ...data };
          for (const l of this.listeners) l(this.lastTelemetry);
        } catch (_) {}
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Exponential backoff reconnect
        setTimeout(() => this.connectWebSocket(), 4000);
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (_) {}
  }

  public subscribeToTelemetry(callback: (telemetry: HardwareTelemetry) => void): () => void {
    this.listeners.add(callback);
    callback(this.lastTelemetry);
    return () => this.listeners.delete(callback);
  }

  public async getHardwareStatus(): Promise<HardwareTelemetry> {
    try {
      const res = await fetch(`${this.baseUrl}/api/status`);
      if (res.ok) {
        const data = await res.json();
        this.lastTelemetry = { ...this.lastTelemetry, ...data };
      }
    } catch (_) {}
    return this.lastTelemetry;
  }

  public async dispensePill(chamberId: number, profile?: DispenseProfile): Promise<DispenseResult> {
    const res = await fetch(`${this.baseUrl}/api/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chamberId, profile }),
    });
    return await res.json();
  }

  public async triggerBuzzer(pattern: BuzzerPattern): Promise<void> {
    await fetch(`${this.baseUrl}/api/buzzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern }),
    });
  }

  public async setServoAngle(angleDeg: number): Promise<void> {
    await fetch(`${this.baseUrl}/api/servo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ angleDeg }),
    });
  }

  public async rotateStepper(chamberId: number, steps: number, speed: number): Promise<void> {
    await fetch(`${this.baseUrl}/api/motor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chamberId, steps, speed }),
    });
  }

  public async reverseStepper(chamberId: number, degrees: number, speed: number = 2000): Promise<void> {
    await fetch(`${this.baseUrl}/api/motor/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chamberId, degrees, speed }),
    });
  }

  public async acknowledgePickup(): Promise<void> {
    await fetch(`${this.baseUrl}/api/pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged: true }),
    });
  }

  public simulateJam(active: boolean): void {
    fetch(`${this.baseUrl}/api/simulate/jam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    }).catch(() => {});
  }

  public simulateOpticalDrop(detected: boolean): void {
    fetch(`${this.baseUrl}/api/simulate/drop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detected }),
    }).catch(() => {});
  }

  public setUnclaimedTimeout(seconds: number): void {
    fetch(`${this.baseUrl}/api/config/unclaimed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds }),
    }).catch(() => {});
  }
}
