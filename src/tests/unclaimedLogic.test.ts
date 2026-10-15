import { MockHardwareService } from '../services/MockHardwareService.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export async function runUnclaimedLogicTests() {
  console.log('--- Running Unclaimed Pill Reminder & Buzzer Tests ---');

  const hw = MockHardwareService.getInstance();

  // Set short 2 second timeout for automated test
  hw.setUnclaimedTimeout(2);

  // Dispense a pill
  await hw.dispensePill(3);
  let status = await hw.getHardwareStatus();
  assert(status.dispenseState === 'waiting_pickup', 'State must be waiting_pickup');
  assert(status.unclaimedTimerSeconds === 2, 'Countdown should initialize to 2');

  // Wait 2.2 seconds for timeout to expire
  console.log('Waiting for unclaimed timer expiry...');
  await new Promise((r) => setTimeout(r, 2200));

  status = await hw.getHardwareStatus();
  assert(
    status.dispenseState === 'unclaimed_alarm',
    `Expected state unclaimed_alarm, got: ${status.dispenseState}`
  );
  assert(status.buzzerActive, 'Buzzer must be active when unclaimed alarm triggers');
  assert(
    status.buzzerPattern === 'unclaimed_alert',
    'Buzzer pattern must be unclaimed_alert'
  );
  console.log('✓ Unclaimed pill alarm triggered with active buzzer alert');

  // Patient retrieves pill
  await hw.acknowledgePickup();
  status = await hw.getHardwareStatus();
  assert(!status.trayOccupied, 'Tray should be cleared');
  assert(status.dispenseState === 'idle', 'State should be restored to idle');
  assert(!status.buzzerActive, 'Buzzer should be silenced');
  console.log('✓ Unclaimed alarm silenced upon patient pickup acknowledgment');

  // Restore default timeout
  hw.setUnclaimedTimeout(15);
}
