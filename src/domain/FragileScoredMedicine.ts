import { Medicine, type DispenseProfile } from './Medicine.ts';

/**
 * Scored splitting tablet (e.g., Prednisone, Alprazolam, Metoprolol Tartrate).
 * Brittle binder matrix prone to mechanical shock chipping, dust, and corner breakage.
 * Requires ultra-gentle S-curve acceleration, 1/64 microstepping, and zero harsh reverse snaps.
 */
export class FragileScoredMedicine extends Medicine {
  public readonly scoreLines: number; // e.g. 1 for half-score, 2 for quad-score
  public readonly coatingType: 'uncoated' | 'film_coated' | 'sugar_coated';

  constructor(
    id: string,
    name: string,
    dosage: string,
    chamberId: number,
    inventoryCount: number = 15,
    maxCapacity: number = 30,
    instructions: string = 'Take half or whole as prescribed by physician',
    scoreLines: number = 1,
    coatingType: 'uncoated' | 'film_coated' = 'uncoated',
    colorHex: string = '#8ec5e8',
    accentBorderHex: string = '#6a9fc4'
  ) {
    super(
      id,
      name,
      dosage,
      'fragile_scored',
      chamberId,
      inventoryCount,
      maxCapacity,
      instructions,
      colorHex,
      accentBorderHex
    );
    this.scoreLines = scoreLines;
    this.coatingType = coatingType;
  }

  public getDispenseProfile(): DispenseProfile {
    return {
      stepDelayUs: 2400, // Very gentle indexing speed
      microsteps: 64, // 1/64 microstepping for ultra-smooth torque delivery
      acceleration: 300, // Soft S-curve acceleration ramp
      servoGateHoldMs: 1100, // Adequate clear drop window
      vibrationJitterSteps: 0, // No harsh vibrational jitter (prevents chipping)
      reverseBacklashSteps: 0, // Zero hard backlash snapping
    };
  }

  public getJamRiskFactor(): number {
    // Moderate risk; powder accumulation can occur if tablets chip
    return 0.08;
  }

  public getPhysicalDescription(): string {
    const scoreText = this.scoreLines === 1 ? 'single score-line' : `${this.scoreLines} score-lines`;
    return `Fragile ${this.coatingType} tablet with ${scoreText}, requires low-acceleration handling.`;
  }
}
