import { Medicine, type DispenseProfile } from './Medicine.ts';

/**
 * Standard round compressed tablet (e.g., Lisinopril, Metformin, Aspirin).
 * Low friction, symmetrical geometry, fast indexing, standard gate release.
 */
export class RoundTabletMedicine extends Medicine {
  public readonly diameterMm: number;
  public readonly thicknessMm: number;

  constructor(
    id: string,
    name: string,
    dosage: string,
    chamberId: number,
    inventoryCount: number = 24,
    maxCapacity: number = 30,
    instructions: string = 'Take daily in morning with food',
    diameterMm: number = 8.0,
    thicknessMm: number = 3.5,
    colorHex: string = '#7dcbbe',
    accentBorderHex: string = '#4fa897'
  ) {
    super(
      id,
      name,
      dosage,
      'round_tablet',
      chamberId,
      inventoryCount,
      maxCapacity,
      instructions,
      colorHex,
      accentBorderHex
    );
    this.diameterMm = diameterMm;
    this.thicknessMm = thicknessMm;
  }

  public getDispenseProfile(): DispenseProfile {
    return {
      stepDelayUs: 1200, // Fast feed rate
      microsteps: 16, // Standard 1/16 microstepping
      acceleration: 850, // Crisp acceleration
      servoGateHoldMs: 800, // 0.8s drop window
      vibrationJitterSteps: 0, // No jitter required for round pills
      reverseBacklashSteps: 2, // Minor backlash take-up
    };
  }

  public getJamRiskFactor(): number {
    // Round pills roll cleanly with minimal wedging risk
    return 0.03;
  }

  public getPhysicalDescription(): string {
    return `Round convex tablet (${this.diameterMm}mm × ${this.thicknessMm}mm), coated for smooth rolling feed.`;
  }
}
