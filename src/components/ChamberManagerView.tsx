import React from 'react';
import { Medicine } from '../domain/Medicine.ts';
import { ClayCard } from './ui/ClayCard.tsx';
import { ClayButton } from './ui/ClayButton.tsx';
import { ClayBadge } from './ui/ClayBadge.tsx';

interface ChamberManagerViewProps {
  medicines: Medicine[];
  onRefill: (chamberId: number, amount: number) => void;
  onOpenQuickDispense: (med: Medicine) => void;
  isBusy: boolean;
}

export const ChamberManagerView: React.FC<ChamberManagerViewProps> = ({
  medicines,
  onRefill,
  onOpenQuickDispense,
  isBusy,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-2xl font-black text-[#2f383b] tracking-tight">
            Chamber & Medicine Manager
          </h2>
          <p className="text-sm font-semibold text-[#5f6d72]">
            Polymorphic dispense profiles calibrated for pill friction, aspect ratio, and fragility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicines.map((med) => {
          const profile = med.getDispenseProfile();
          const jamRisk = med.getJamRiskFactor();
          const fillPct = med.getFillPercentage();

          return (
            <ClayCard key={med.id} tone="clay" className="border-[#e5dcce] flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#ebdccb] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-[inset_0_2px_0_rgba(255,255,255,0.7)]"
                    style={{ backgroundColor: med.colorHex }}
                  >
                    {med.chamberId}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2f383b] leading-tight">
                      {med.name}
                    </h3>
                    <p className="text-sm font-bold text-[#5f6d72]">
                      {med.dosage} • Chamber #{med.chamberId}
                    </p>
                  </div>
                </div>
                <ClayBadge tone="mint" size="md">
                  {med.type.replace('_', ' ').toUpperCase()}
                </ClayBadge>
              </div>

              {/* Physical Geometry Notes */}
              <div className="bg-[#f7f4ed] p-3.5 rounded-[1.25rem] border border-[#e5dcce] text-xs">
                <span className="font-extrabold text-[#5f6d72] block mb-1">
                  PHYSICAL SPECIFICATION & HANDLING
                </span>
                <p className="font-semibold text-[#2f383b]">
                  {med.getPhysicalDescription()}
                </p>
              </div>

              {/* Polymorphic Hardware Profile Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#f4efe6] p-3 rounded-[1.25rem] border border-[#e2dbce] text-xs">
                <div>
                  <span className="text-[#5f6d72] block">Step Delay</span>
                  <strong className="text-[#2f383b] font-extrabold">{profile.stepDelayUs} µs</strong>
                </div>
                <div>
                  <span className="text-[#5f6d72] block">Microsteps</span>
                  <strong className="text-[#2f383b] font-extrabold">1/{profile.microsteps}</strong>
                </div>
                <div>
                  <span className="text-[#5f6d72] block">Gate Hold</span>
                  <strong className="text-[#2f383b] font-extrabold">{profile.servoGateHoldMs} ms</strong>
                </div>
                <div>
                  <span className="text-[#5f6d72] block">Acceleration</span>
                  <strong className="text-[#2f383b] font-extrabold">{profile.acceleration} s/s²</strong>
                </div>
                <div>
                  <span className="text-[#5f6d72] block">Vibration Jitter</span>
                  <strong className="text-[#2f383b] font-extrabold">{profile.vibrationJitterSteps} pulses</strong>
                </div>
                <div>
                  <span className="text-[#5f6d72] block">Jam Probability</span>
                  <strong className="text-[#2f383b] font-extrabold">{(jamRisk * 100).toFixed(0)}%</strong>
                </div>
              </div>

              {/* Refill Level & Capacity */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#5f6d72]">Current Stock</span>
                  <span className="text-[#2f383b]">
                    <strong>{med.inventoryCount}</strong> / {med.maxCapacity} pills ({fillPct}%)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#e5dcce] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${fillPct}%`,
                      backgroundColor: med.colorHex,
                    }}
                  />
                </div>
              </div>

              {/* Refill Buttons & Dispense Action */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#ebdccb]">
                <ClayButton
                  size="sm"
                  tone="quiet"
                  onClick={() => onRefill(med.chamberId, 5)}
                  disabled={med.inventoryCount >= med.maxCapacity}
                  className="flex-1"
                >
                  +5 Pills
                </ClayButton>
                <ClayButton
                  size="sm"
                  tone="quiet"
                  onClick={() => onRefill(med.chamberId, 10)}
                  disabled={med.inventoryCount >= med.maxCapacity}
                  className="flex-1"
                >
                  +10 Pills
                </ClayButton>
                <ClayButton
                  size="sm"
                  tone="mint"
                  onClick={() => onOpenQuickDispense(med)}
                  disabled={isBusy || !med.canDispense()}
                  className="flex-2"
                >
                  Dispense 1
                </ClayButton>
              </div>
            </ClayCard>
          );
        })}
      </div>
    </div>
  );
};
