import { Medicine, type DispenseProfile } from './Medicine.ts';

/**
 * Oblong gelatin capsule (e.g., Amoxicillin, Omega-3 Fish Oil, Gabapentin).
 * Asymmetric aspect ratio, susceptible to tumbling, bridging, and tail-pinching.
 * Requires micro-vibrations before gate release and a longer gate open hold time.
 */
export class OblongCapsuleMedicine extends Medicine {
  public readonly lengthMm: number;
  public readonly widthMm: number;

  constructor(
    id: string,
    name: string,
    dosage: string,
    chamberId: number,
    inventoryCount: number = 18,
    maxCapacity: number = 25,
    instructions: string = 'Take with large glass of water',
    lengthMm: number = 19.5,
    widthMm: number = 6.8,
    colorHex: string = '#f0b7a0',
    accentBorderHex: string = '#d4786a'
  ) {
    super(
      id,
      name,
      dosage,
      'oblong_capsule',
      chamberId,
      inventoryCount,
      maxCapacity,
      instructions,
      colorHex,
      accentBorderHex
    );
    this.lengthMm = lengthMm;
    this.widthMm = widthMm;
  }

  public getDispenseProfile(): DispenseProfile {
    return {
      stepDelayUs: 1800, // Slower feed rate to prevent tumbling
      microsteps: 32, // Finer microstepping for fluid motion
      acceleration: 500, // Moderate acceleration
      servoGateHoldMs: 1400, // Extended 1.4s gate hold to prevent capsule tail pinch
      vibrationJitterSteps: 4, // 4 micro-oscillation pulses to dislodge bridges
      reverseBacklashSteps: 4, // Take up carousel gap
    };
  }

  public getJamRiskFactor(): number {
    // Capsules have higher risk of bridging or cross-slot wedging
    return 0.16;
  }

  public getPhysicalDescription(): string {
    return `Oblong capsule (${this.lengthMm}mm × ${this.widthMm}mm), gelatin shell requiring vibration alignment.`;
  }
}
