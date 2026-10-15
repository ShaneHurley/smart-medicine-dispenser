export type MedicineType = 'round_tablet' | 'oblong_capsule' | 'fragile_scored';

export interface DispenseProfile {
  /** Delay between microsteps in microseconds (controls rotational speed) */
  stepDelayUs: number;
  /** TMC2209 microstepping setting (e.g. 16, 32, 64) */
  microsteps: number;
  /** Stepper acceleration ramp in steps/s^2 */
  acceleration: number;
  /** Time the servo trapdoor remains fully open (ms) to allow gravity drop */
  servoGateHoldMs: number;
  /** Micro-vibrational jitter steps to prevent bridging/tumbling */
  vibrationJitterSteps: number;
  /** Backlash compensation steps after indexing */
  reverseBacklashSteps: number;
}

export abstract class Medicine {
  public readonly id: string;
  public name: string;
  public dosage: string;
  public readonly type: MedicineType;
  public chamberId: number; // 1 to 4
  public inventoryCount: number;
  public maxCapacity: number;
  public instructions: string;
  public colorHex: string;
  public accentBorderHex: string;

  constructor(
    id: string,
    name: string,
    dosage: string,
    type: MedicineType,
    chamberId: number,
    inventoryCount: number = 20,
    maxCapacity: number = 30,
    instructions: string = 'Take with water',
    colorHex: string = '#7dcbbe',
    accentBorderHex: string = '#4fa897'
  ) {
    this.id = id;
    this.name = name;
    this.dosage = dosage;
    this.type = type;
    this.chamberId = chamberId;
    this.inventoryCount = Math.max(0, inventoryCount);
    this.maxCapacity = maxCapacity;
    this.instructions = instructions;
    this.colorHex = colorHex;
    this.accentBorderHex = accentBorderHex;
  }

  /**
   * Calculates the optimal hardware actuation parameters for this pill geometry.
   */
  public abstract getDispenseProfile(): DispenseProfile;

  /**
   * Evaluates the risk factor of a mechanical chamber jam (0.00 to 1.00).
   */
  public abstract getJamRiskFactor(): number;

  /**
   * Human-readable physical geometry and handling description.
   */
  public abstract getPhysicalDescription(): string;

  /**
   * Check if at least 1 pill is available to dispense.
   */
  public canDispense(): boolean {
    return this.inventoryCount > 0;
  }

  /**
   * Decrements inventory upon confirmed drop detection.
   */
  public recordDispense(): boolean {
    if (this.inventoryCount > 0) {
      this.inventoryCount -= 1;
      return true;
    }
    return false;
  }

  /**
   * Refills the chamber inventory up to maxCapacity.
   */
  public refill(amount: number): number {
    const added = Math.min(amount, this.maxCapacity - this.inventoryCount);
    this.inventoryCount += added;
    return added;
  }

  /**
   * Inventory fullness percentage (0 - 100).
   */
  public getFillPercentage(): number {
    return Math.round((this.inventoryCount / this.maxCapacity) * 100);
  }
}
