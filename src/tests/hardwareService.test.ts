import { MockHardwareService } from '../services/MockHardwareService.ts';
import { RoundTabletMedicine, OblongCapsuleMedicine } from '../domain/index.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export async function runHardwareTests() {
  console.log('--- Running Hardware Service Simulation Tests ---');

  const hw = MockHardwareService.getInstance();
  const initialStatus = await hw.getHardwareStatus();

  assert(initialStatus.dispenseState === 'idle', 'Initial state should be idle');
  assert(!initialStatus.trayOccupied, 'Initial tray should be empty');
  assert(!initialStatus.opticalBeamBroken, 'Initial optical beam should be clear');

  // Test 1: Single Pill Dispense sequence
  console.log('Testing single pill dispense for Chamber 1 (Round Tablet)...');
  const roundMed = new RoundTabletMedicine('t-1', 'Aspirin', '81mg', 1);
  const result = await hw.dispensePill(1, roundMed.getDispenseProfile());

  assert(result.success, 'Dispense should succeed');
  assert(result.chamberId === 1, 'Chamber should be 1');
  assert(result.beamBreakDurationMs > 0, 'Beam break drop duration must be recorded');

  const postDispense = await hw.getHardwareStatus();
  assert(postDispense.trayOccupied, 'Tray must be occupied after drop');
  assert(postDispense.dispenseState === 'waiting_pickup', 'State should be waiting_pickup');
  assert(postDispense.unclaimedTimerSeconds > 0, 'Unclaimed timer countdown should be started');
  console.log('✓ Dispense sequence verified (stepper -> servo -> beam break -> tray occupied)');

  // Test 2: CRITICAL SAFETY CHECK - Reject duplicate dispense while tray is occupied
  console.log('Testing safety interlock: Rejecting dispense while tray is occupied...');
  const duplicateResult = await hw.dispensePill(2);
  assert(!duplicateResult.success, 'Dispense MUST be rejected when tray is occupied');
  assert(duplicateResult.errorCode === 'TRAY_OCCUPIED', `Expected TRAY_OCCUPIED, got ${duplicateResult.errorCode}`);
  console.log('✓ Tray-occupied safety interlock verified (prevents double-dosing)');

  // Test 3: Pickup Acknowledgment
  console.log('Testing patient pickup acknowledgment...');
  await hw.acknowledgePickup();
  const postPickup = await hw.getHardwareStatus();
  assert(!postPickup.trayOccupied, 'Tray should now be empty');
  assert(postPickup.dispenseState === 'idle', 'State should return to idle');
  assert(postPickup.unclaimedTimerSeconds === 0, 'Timer should be reset');
  console.log('✓ Pickup acknowledgment verified');

  // Test 4: StallGuard Jam Fault Injection & Directional Reverse Backoff
  console.log('Testing StallGuard jam fault injection & auto-recovery...');
  hw.simulateJam(true);
  const jamStatus = await hw.getHardwareStatus();
  assert(jamStatus.jamDetected, 'Jam flag should be set');

  // Chamber 2 targets 135 deg; upon jam auto-recovery, it should reverse 15 deg to 120 deg
  const jamMed = new OblongCapsuleMedicine('t-2', 'Capsule', '500mg', 2);
  const jamResult = await hw.dispensePill(2, jamMed.getDispenseProfile());
  assert(!jamResult.success, 'Dispense should fail when jammed');
  assert(jamResult.errorCode === 'STALLGUARD_JAM', 'Should return STALLGUARD_JAM error');

  const postJamStatus = await hw.getHardwareStatus();
  assert(postJamStatus.stepperAngleDeg === 120, `Expected stepper to reverse 15° to 120°, got ${postJamStatus.stepperAngleDeg}°`);
  console.log('✓ StallGuard jam detection and directional 15° reverse backoff verified');

  // Clear jam
  hw.simulateJam(false);
  const clearedStatus = await hw.getHardwareStatus();
  assert(!clearedStatus.jamDetected, 'Jam should be cleared');
  console.log('✓ StallGuard jam cleared');
}
