import React from 'react';
import { Medicine } from '../domain/Medicine.ts';
import { ScheduleItem } from '../domain/ScheduleManager.ts';
import { HardwareTelemetry } from '../services/IHardwareService.ts';
import { ClayCard } from './ui/ClayCard.tsx';
import { ClayButton } from './ui/ClayButton.tsx';
import { ClayBadge } from './ui/ClayBadge.tsx';

interface DashboardViewProps {
  medicines: Medicine[];
  nextDose: ScheduleItem | null;
  telemetry: HardwareTelemetry;
  onOpenQuickDispense: (med: Medicine) => void;
  onAcknowledgePickup: () => void;
  onDispenseScheduled: (schedule: ScheduleItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  medicines,
  nextDose,
  telemetry,
  onOpenQuickDispense,
  onAcknowledgePickup,
  onDispenseScheduled,
}) => {
  const isPillWaiting = telemetry.trayOccupied;
  const isUnclaimedAlarm = telemetry.dispenseState === 'unclaimed_alarm';

  const nextMed = nextDose
    ? medicines.find((m) => m.chamberId === nextDose.chamberId)
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* 1. CRITICAL UNCLAIMED PILL ALERT BANNER (If pill waiting in tray) */}
      {isPillWaiting && (
        <div
          className={`
            p-5 rounded-[2rem] border-2 transition-all duration-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4
            ${
              isUnclaimedAlarm
                ? 'bg-[#fdf0ee] border-[#e04e3a] animate-pulse shadow-rose-200'
                : 'bg-[#fdfbe9] border-[#edd994] shadow-amber-100'
            }
          `}
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div
              className={`
                w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md
                ${isUnclaimedAlarm ? 'bg-[#f0a89e] text-white animate-bounce' : 'bg-[#f6e7a9] text-[#483c16]'}
              `}
            >
              {isUnclaimedAlarm ? '🚨' : '💊'}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h3 className="text-xl font-black text-[#2f383b]">
                  {isUnclaimedAlarm ? 'PILL UNCLAIMED — BUZZER ACTIVE' : 'Dose Ready in Pickup Tray'}
                </h3>
                <ClayBadge tone={isUnclaimedAlarm ? 'danger' : 'butter'} size="sm" pulse={isUnclaimedAlarm}>
                  {isUnclaimedAlarm ? 'Audio Reminder Sounding' : `Unclaimed in ${telemetry.unclaimedTimerSeconds}s`}
                </ClayBadge>
              </div>
              <p className="text-sm font-semibold text-[#5f6d72] mt-0.5">
                {isUnclaimedAlarm
                  ? 'The patient has not retrieved their dispensed medication. Escalating piezo alert is sounding!'
                  : 'Single pill dropped into the tray via optical verification. Please take dose to silence reminders.'}
              </p>
            </div>
          </div>

          <ClayButton
            tone={isUnclaimedAlarm ? 'danger' : 'mint'}
            size="lg"
            onClick={onAcknowledgePickup}
            className="w-full md:w-auto shadow-md min-w-[240px] text-base"
          >
            ✓ I Have Taken My Pill
          </ClayButton>
        </div>
      )}

      {/* 2. UPCOMING DOSE HERO CARD */}
      <ClayCard tone="clay" className="border-[#e5dcce]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ClayBadge tone="mint" size="md">
                NEXT SCHEDULED DOSE
              </ClayBadge>
              {nextDose && (
                <span className="text-sm font-bold text-[#5f6d72]">
                  {nextDose.label} • {nextDose.time}
                </span>
              )}
            </div>

            {nextMed ? (
              <div>
                <h2 className="text-3xl font-extrabold text-[#2f383b] tracking-tight">
                  {nextMed.name} <span className="text-[#5f6d72] text-xl font-medium">{nextMed.dosage}</span>
                </h2>
                <p className="text-sm font-semibold text-[#5f6d72] mt-1">
                  Chamber {nextMed.chamberId} • {nextMed.instructions}
                </p>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-[#2f383b]">All doses completed for today!</h2>
            )}
          </div>

          {/* Quick Dispense Action for Next Dose */}
          {nextMed && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <ClayButton
                tone="mint"
                size="xl"
                onClick={() => {
                  if (nextDose) onDispenseScheduled(nextDose);
                  else onOpenQuickDispense(nextMed);
                }}
                disabled={isPillWaiting || telemetry.dispenseState !== 'idle' || !nextMed.canDispense()}
                className="w-full md:w-auto shadow-lg text-lg"
              >
                Dispense Next Dose (1 Pill)
              </ClayButton>
            </div>
          )}
        </div>
      </ClayCard>

      {/* 3. 4 CHAMBER INVENTORY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-black text-[#2f383b] tracking-tight">
            Chamber Inventory (4 Hoppers)
          </h3>
          <span className="text-xs font-bold text-[#5f6d72]">
            Singulation Carousel • 1 Pill at a time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {medicines.map((med) => {
            const fillPct = med.getFillPercentage();
            const isLow = med.inventoryCount <= 5;

            return (
              <ClayCard
                key={med.id}
                tone="clay"
                className="flex flex-col justify-between gap-4 border-[#e5dcce] hover:border-[#7dcbbe] transition-colors"
              >
                {/* Chamber Top Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-[inset_0_2px_0_rgba(255,255,255,0.7)]"
                      style={{ backgroundColor: med.colorHex }}
                    >
                      {med.chamberId}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#2f383b] text-base leading-tight">
                        {med.name}
                      </h4>
                      <p className="text-xs font-bold text-[#5f6d72]">{med.dosage}</p>
                    </div>
                  </div>
                  <ClayBadge
                    tone={isLow ? 'danger' : 'quiet'}
                    size="sm"
                  >
                    {med.type === 'round_tablet'
                      ? 'Round'
                      : med.type === 'oblong_capsule'
                      ? 'Capsule'
                      : 'Scored'}
                  </ClayBadge>
                </div>

                {/* Pill Visual & Inventory Progress Bar */}
                <div className="flex flex-col gap-2 bg-[#f7f4ed] p-3 rounded-[1.25rem] border border-[#e8dfcf]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5f6d72]">
                    <span>Inventory</span>
                    <span className="text-[#2f383b]">
                      <strong>{med.inventoryCount}</strong> / {med.maxCapacity} pills
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#e2dbce] rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${fillPct}%`,
                        backgroundColor: isLow ? '#f0a89e' : med.colorHex,
                      }}
                    />
                  </div>
                </div>

                {/* Dispense 1 Pill Quick Button */}
                <ClayButton
                  tone="quiet"
                  size="md"
                  fullWidth
                  onClick={() => onOpenQuickDispense(med)}
                  disabled={isPillWaiting || telemetry.dispenseState !== 'idle' || !med.canDispense()}
                  className="!min-h-[44px]"
                >
                  Dispense 1 Pill
                </ClayButton>
              </ClayCard>
            );
          })}
        </div>
      </div>

      {/* 4. HARDWARE STATUS & TELEMETRY STRIP */}
      <ClayCard tone="clay" className="p-4 border-[#e5dcce]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-[#5f6d72]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ESP32-S3 Core 0 (Motor/Servo/Buzzer RTOS Task)</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              Motor Rail: <strong className="text-[#2f383b]">{telemetry.motorVoltage}V</strong>
            </div>
            <div>
              Board Temp: <strong className="text-[#2f383b]">{telemetry.espTemperatureC}°C</strong>
            </div>
            <div>
              State:{' '}
              <strong className="text-[#2f383b] uppercase">
                {telemetry.dispenseState.replace('_', ' ')}
              </strong>
            </div>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};
