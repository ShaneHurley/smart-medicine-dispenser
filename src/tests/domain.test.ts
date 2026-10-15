import {
  RoundTabletMedicine,
  OblongCapsuleMedicine,
  FragileScoredMedicine,
} from '../domain/index.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runDomainTests() {
  console.log('--- Running Domain Model Tests ---');

  // Test 1: RoundTabletMedicine polymorphic profile
  const round = new RoundTabletMedicine('med-r', 'Aspirin', '81mg', 1, 10, 30);
  assert(round.type === 'round_tablet', 'Type should be round_tablet');
  const roundProfile = round.getDispenseProfile();
  assert(roundProfile.stepDelayUs === 1200, 'Round tablet should have fast 1200us step delay');
  assert(roundProfile.vibrationJitterSteps === 0, 'Round tablet should have 0 jitter steps');
  assert(roundProfile.servoGateHoldMs === 800, 'Round tablet gate hold should be 800ms');
  assert(round.getJamRiskFactor() < 0.05, 'Round tablet jam risk should be low (< 0.05)');
  console.log('✓ RoundTabletMedicine profile assertions passed');

  // Test 2: OblongCapsuleMedicine polymorphic profile
  const capsule = new OblongCapsuleMedicine('med-c', 'Omega-3', '1000mg', 2, 15, 25);
  assert(capsule.type === 'oblong_capsule', 'Type should be oblong_capsule');
  const capProfile = capsule.getDispenseProfile();
  assert(capProfile.stepDelayUs === 1800, 'Capsule should have slower 1800us feed rate');
  assert(capProfile.vibrationJitterSteps === 4, 'Capsule must have 4 vibration jitter steps to prevent bridging');
  assert(capProfile.servoGateHoldMs === 1400, 'Capsule must have extended 1400ms gate hold to prevent pinch');
  assert(capsule.getJamRiskFactor() > 0.1, 'Capsule jam risk factor should be higher (> 0.10)');
  console.log('✓ OblongCapsuleMedicine profile assertions passed');

  // Test 3: FragileScoredMedicine polymorphic profile
  const fragile = new FragileScoredMedicine('med-f', 'Prednisone', '20mg', 4, 12, 30, 'Take half', 2, 'uncoated');
  assert(fragile.type === 'fragile_scored', 'Type should be fragile_scored');
  const fragProfile = fragile.getDispenseProfile();
  assert(fragProfile.acceleration === 300, 'Fragile tablet requires gentle 300 step/s^2 acceleration');
  assert(fragProfile.microsteps === 64, 'Fragile tablet requires 1/64 microstepping for ultra-smooth torque');
  assert(fragProfile.reverseBacklashSteps === 0, 'Fragile tablet must have 0 reverse backlash shock');
  assert(fragile.getPhysicalDescription().includes('2 score-lines'), 'Description should note 2 score-lines');
  console.log('✓ FragileScoredMedicine profile assertions passed');

  // Test 4: Inventory tracking, clamping, and edge cases
  const emptyMed = new RoundTabletMedicine('med-e', 'Test', '10mg', 3, 0, 10);
  assert(!emptyMed.canDispense(), 'Empty medicine cannot dispense');
  assert(!emptyMed.recordDispense(), 'recordDispense on empty medicine should return false');
  assert(emptyMed.inventoryCount === 0, 'Inventory count should stay at 0');

  const refilled = emptyMed.refill(15);
  assert(refilled === 10, 'Refill should clamp to maxCapacity (added 10)');
  assert(emptyMed.inventoryCount === 10, 'Inventory should be 10');
  assert(emptyMed.canDispense(), 'Can dispense after refill');
  assert(emptyMed.getFillPercentage() === 100, 'Fill percentage should be 100%');

  emptyMed.recordDispense();
  assert(emptyMed.inventoryCount === 9, 'Inventory should decrement to 9');
  assert(emptyMed.getFillPercentage() === 90, 'Fill percentage should be 90%');
  console.log('✓ Medicine inventory boundary tests passed');
}
