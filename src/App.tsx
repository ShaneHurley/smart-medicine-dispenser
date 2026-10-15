import React, { useState, useEffect } from 'react';
import {
  Medicine,
  RoundTabletMedicine,
  OblongCapsuleMedicine,
  FragileScoredMedicine,
} from './domain/index.ts';
import { ScheduleManager, ScheduleItem } from './domain/ScheduleManager.ts';
import {
  IHardwareService,
  HardwareTelemetry,
  DispenseResult,
} from './services/IHardwareService.ts';
import { MockHardwareService } from './services/MockHardwareService.ts';
import { RealHardwareService } from './services/RealHardwareService.ts';
import { Header, ActiveTab } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ChamberManagerView } from './components/ChamberManagerView.tsx';
import { ScheduleView } from './components/ScheduleView.tsx';
import { HardwareSimulatorView } from './components/HardwareSimulatorView.tsx';
import { QuickDispenseModal } from './components/QuickDispenseModal.tsx';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isRealHardware, setIsRealHardware] = useState(false);

  // Initialize polymorphic medicine hoppers
  const [medicines, setMedicines] = useState<Medicine[]>([
    new RoundTabletMedicine('med-1', 'Lisinopril', '10 mg', 1, 24, 30, 'Take in morning for blood pressure', 8.0, 3.2, '#7dcbbe', '#4fa897'),
    new OblongCapsuleMedicine('med-2', 'Omega-3 Fish Oil', '1000 mg', 2, 18, 25, 'Take with meal and plenty of water', 19.5, 6.8, '#f0b7a0', '#d4786a'),
    new RoundTabletMedicine('med-3', 'Metformin', '500 mg', 3, 20, 30, 'Take twice daily with meals', 9.5, 4.0, '#f6e7a9', '#d1b854'),
    new FragileScoredMedicine('med-4', 'Prednisone', '20 mg', 4, 14, 30, 'Taper dose as directed; single score line', 1, 'uncoated', '#8ec5e8', '#6a9fc4'),
  ]);

  const scheduleMgr = ScheduleManager.getInstance();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(scheduleMgr.getSchedules());

  // Hardware service instance
  const [hardwareService, setHardwareService] = useState<IHardwareService>(
    MockHardwareService.getInstance()
  );

  const [telemetry, setTelemetry] = useState<HardwareTelemetry>({
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
    motorVoltage: 12.14,
    espTemperatureC: 24.2,
    activeChamber: 1,
    lastDispenseSuccess: null,
    jamDetected: false,
    firmwareVersion: 'ESP32S3-v1.4.2-LFS',
  });

  // Quick dispense modal state
  const [selectedMedForModal, setSelectedMedForModal] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscribe to live hardware telemetry
  useEffect(() => {
    const unsubscribe = hardwareService.subscribeToTelemetry((t) => {
      setTelemetry({ ...t });
    });
    return unsubscribe;
  }, [hardwareService]);

  // Toggle hardware mode
  const handleToggleHardwareMode = () => {
    const nextReal = !isRealHardware;
    setIsRealHardware(nextReal);
    if (nextReal) {
      setHardwareService(new RealHardwareService());
    } else {
      setHardwareService(MockHardwareService.getInstance());
    }
  };

  // Dispense single pill execution
  const handleDispense = async (medicine: Medicine): Promise<DispenseResult> => {
    const profile = medicine.getDispenseProfile();
    const result = await hardwareService.dispensePill(medicine.chamberId, profile);

    if (result.success) {
      medicine.recordDispense();
      setMedicines([...medicines]);

      // Check if this matched any scheduled dose
      const dueSchedule = schedules.find(
        (s) => s.chamberId === medicine.chamberId && (s.status === 'upcoming' || s.status === 'due')
      );
      if (dueSchedule) {
        scheduleMgr.markDispensed(dueSchedule.id);
        setSchedules(scheduleMgr.getSchedules());
      }
    }

    return result;
  };

  // Acknowledge patient pickup
  const handleAcknowledgePickup = async () => {
    await hardwareService.acknowledgePickup();

    // Mark any dispensed schedule item as taken
    const dispensed = schedules.find(
      (s) => s.status === 'dispensed' || s.status === 'unclaimed_alert'
    );
    if (dispensed) {
      scheduleMgr.markTaken(dispensed.id);
      setSchedules(scheduleMgr.getSchedules());
    }
  };

  // Trigger dispense for scheduled item
  const handleDispenseScheduled = async (item: ScheduleItem) => {
    const med = medicines.find((m) => m.chamberId === item.chamberId);
    if (med) {
      setSelectedMedForModal(med);
      setIsModalOpen(true);
    }
  };

  // Chamber refill
  const handleRefill = (chamberId: number, amount: number) => {
    const med = medicines.find((m) => m.chamberId === chamberId);
    if (med) {
      med.refill(amount);
      setMedicines([...medicines]);
    }
  };

  const nextUpcomingDose = scheduleMgr.getNextUpcomingDose();
  const isBusy = telemetry.dispenseState !== 'idle';

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#2f383b] flex flex-col font-sans selection:bg-[#7dcbbe]/30">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        telemetry={telemetry}
        isRealHardware={isRealHardware}
        onToggleHardwareMode={handleToggleHardwareMode}
      />

      {/* Main Content View Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            medicines={medicines}
            nextDose={nextUpcomingDose}
            telemetry={telemetry}
            onOpenQuickDispense={(med) => {
              setSelectedMedForModal(med);
              setIsModalOpen(true);
            }}
            onAcknowledgePickup={handleAcknowledgePickup}
            onDispenseScheduled={handleDispenseScheduled}
          />
        )}

        {activeTab === 'chambers' && (
          <ChamberManagerView
            medicines={medicines}
            onRefill={handleRefill}
            onOpenQuickDispense={(med) => {
              setSelectedMedForModal(med);
              setIsModalOpen(true);
            }}
            isBusy={isBusy}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            schedules={schedules}
            medicines={medicines}
            onDispenseSchedule={handleDispenseScheduled}
            onMarkTaken={(id) => {
              scheduleMgr.markTaken(id);
              setSchedules(scheduleMgr.getSchedules());
              handleAcknowledgePickup();
            }}
            onAddSchedule={(time, label, chamberId) => {
              scheduleMgr.addSchedule(time, label, chamberId);
              setSchedules(scheduleMgr.getSchedules());
            }}
            onDeleteSchedule={(id) => {
              scheduleMgr.deleteSchedule(id);
              setSchedules(scheduleMgr.getSchedules());
            }}
            isBusy={isBusy}
          />
        )}

        {activeTab === 'simulator' && (
          <HardwareSimulatorView
            hardwareService={hardwareService}
            telemetry={telemetry}
            onAcknowledgePickup={handleAcknowledgePickup}
          />
        )}
      </main>

      {/* Quick Dispense Modal */}
      <QuickDispenseModal
        medicine={selectedMedForModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMedForModal(null);
        }}
        onDispense={handleDispense}
        telemetry={telemetry}
        onAcknowledgePickup={handleAcknowledgePickup}
      />
    </div>
  );
};
export default App;
