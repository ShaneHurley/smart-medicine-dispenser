import { ScheduleManager } from '../domain/ScheduleManager.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runScheduleTests() {
  console.log('--- Running Schedule Engine Tests ---');
  const mgr = ScheduleManager.getInstance();

  const schedules = mgr.getSchedules();
  assert(schedules.length >= 4, 'Initial schedules should contain at least 4 items');

  // Verify time ordering
  for (let i = 0; i < schedules.length - 1; i++) {
    assert(
      schedules[i].time <= schedules[i + 1].time,
      `Schedules must be chronological: ${schedules[i].time} <= ${schedules[i + 1].time}`
    );
  }
  console.log('✓ Schedule chronological ordering verified');

  // Verify next upcoming dose selection
  const next = mgr.getNextUpcomingDose();
  assert(next !== null, 'Next dose should exist');
  assert(next?.status === 'upcoming' || next?.status === 'due', 'Next dose must be upcoming or due');
  console.log(`✓ Next dose identified: ${next?.label} at ${next?.time}`);

  // Test dynamic add and delete
  const added = mgr.addSchedule('15:45', 'Afternoon Snack', 2);
  assert(added.time === '15:45', 'Added schedule time should match');
  assert(mgr.getSchedules().some((s) => s.id === added.id), 'New schedule should exist in list');

  const deleted = mgr.deleteSchedule(added.id);
  assert(deleted, 'Delete should return true');
  assert(!mgr.getSchedules().some((s) => s.id === added.id), 'Deleted schedule should no longer exist');
  console.log('✓ Dynamic schedule add/delete operations passed');
}
