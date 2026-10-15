import { runDomainTests } from '../src/tests/domain.test.ts';
import { runHardwareTests } from '../src/tests/hardwareService.test.ts';
import { runUnclaimedLogicTests } from '../src/tests/unclaimedLogic.test.ts';
import { runScheduleTests } from '../src/tests/schedule.test.ts';

async function main() {
  console.log('====================================================');
  console.log('🤖 SMART MEDICINE DISPENSER - AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  try {
    runDomainTests();
    console.log('');
    runScheduleTests();
    console.log('');
    await runHardwareTests();
    console.log('');
    await runUnclaimedLogicTests();
    console.log('\n====================================================');
    console.log('✅ ALL TEST SUITES PASSED WITH ZERO ERRORS');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUNNER FAILURE:', err);
    process.exit(1);
  }
}

main();
