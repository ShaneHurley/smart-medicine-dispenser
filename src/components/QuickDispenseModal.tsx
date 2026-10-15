import React from 'react';
import { Medicine } from '../domain/Medicine.ts';
import { ClayButton } from './ui/ClayButton.tsx';
import { ClayBadge } from './ui/ClayBadge.tsx';
import { HardwareTelemetry, DispenseResult } from '../services/IHardwareService.ts';

interface QuickDispenseModalProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onDispense: (medicine: Medicine) => Promise<DispenseResult>;
  telemetry: HardwareTelemetry;
  onAcknowledgePickup: () => void;
}

export const QuickDispenseModal: React.FC<QuickDispenseModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onDispense,
  telemetry,
  onAcknowledgePickup,
}) => {
  const [dispenseResult, setDispenseResult] = React.useState<DispenseResult | null>(null);
  const [isDispensing, setIsDispensing] = React.useState(false);

  if (!isOpen || !medicine) return null;

  const handleStartDispense = async () => {
    setIsDispensing(true);
    setDispenseResult(null);
    try {
      const res = await onDispense(medicine);
      setDispenseResult(res);
    } finally {
      setIsDispensing(false);
    }
  };

  const getStepStatus = (step: number) => {
    const s = telemetry.dispenseState;
    if (s === 'indexing_motor' && step === 1) return 'active';
    if ((s === 'vibrating' || s === 'opening_gate') && step <= 2) return step === 2 ? 'active' : 'done';
    if (s === 'verifying_beam_break' && step <= 3) return step === 3 ? 'active' : 'done';
    if ((s === 'waiting_pickup' || s === 'unclaimed_alarm') && step <= 4) return 'done';
    if (s === 'idle' && dispenseResult?.success) return 'done';
    if (step === 1 && isDispensing) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffdf8] w-full max-w-lg rounded-[2rem] border border-[#ebdccb] shadow-[0_20px_50px_rgba(47,56,59,0.2),inset_0_2px_0_rgba(255,255,255,0.9)] p-6 md:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebdccb] pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-[inset_0_2px_0_rgba(255,255,255,0.6),0_3px_6px_rgba(0,0,0,0.06)]"
              style={{ backgroundColor: medicine.colorHex }}
            >
              💊
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#2f383b] leading-tight">
                Dispense 1 Pill
              </h2>
              <p className="text-sm font-semibold text-[#5f6d72]">
                Chamber {medicine.chamberId} • {medicine.name} {medicine.dosage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f4efe6] hover:bg-[#eae3d7] flex items-center justify-center text-[#5f6d72] font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Medicine Profile Card */}
        <div className="bg-[#f7f4ed] rounded-[1.5rem] p-4 border border-[#e5dcce] flex flex-col gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs font-bold text-[#5f6d72]">
            <span>GEOMETRY SPEC</span>
            <ClayBadge tone="mint" size="sm">
              {medicine.type.replace('_', ' ').toUpperCase()}
            </ClayBadge>
          </div>
          <p className="text-sm font-medium text-[#2f383b]">
            {medicine.getPhysicalDescription()}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-[#ebdccb]/60 text-xs">
            <div>
              <span className="text-[#5f6d72]">Feed Step Rate:</span>{' '}
              <strong className="text-[#2f383b]">{medicine.getDispenseProfile().stepDelayUs}µs</strong>
            </div>
            <div>
              <span className="text-[#5f6d72]">Gate Hold:</span>{' '}
              <strong className="text-[#2f383b]">{medicine.getDispenseProfile().servoGateHoldMs}ms</strong>
            </div>
          </div>
        </div>

        {/* Live Hardware Actuation Steps */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-extrabold text-[#5f6d72] tracking-wider uppercase">
            Hardware Dispense Pipeline
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { num: 1, title: 'Stepper Index' },
              { num: 2, title: 'Servo Gate' },
              { num: 3, title: 'IR Drop Detect' },
              { num: 4, title: 'Tray Ready' },
            ].map((step) => {
              const status = getStepStatus(step.num);
              return (
                <div
                  key={step.num}
                  className={`
                    p-2.5 rounded-[1.25rem] border font-bold flex flex-col items-center gap-1 transition-all duration-200
                    ${
                      status === 'active'
                        ? 'bg-[#7dcbbe] text-[#1b3d36] border-[#5cb8a8] shadow-sm animate-pulse'
                        : status === 'done'
                        ? 'bg-[#d6f2ec] text-[#1b5e50] border-[#9fdcd1]'
                        : 'bg-[#f4efe6] text-[#88969b] border-[#e2dbce]'
                    }
                  `}
                >
                  <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-[10px]">
                    {status === 'done' ? '✓' : step.num}
                  </span>
                  <span className="text-[11px] leading-tight">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Hardware Telemetry Strip */}
        <div className="bg-white rounded-[1.25rem] border border-[#ebdccb] p-3 text-xs flex items-center justify-between text-[#5f6d72]">
          <div>
            <span>Motor Angle: </span>
            <strong className="text-[#2f383b]">{telemetry.stepperAngleDeg}°</strong>
          </div>
          <div>
            <span>Servo Gate: </span>
            <strong className="text-[#2f383b]">{telemetry.servoAngleDeg}°</strong>
          </div>
          <div>
            <span>IR Beam: </span>
            <strong className={telemetry.opticalBeamBroken ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}>
              {telemetry.opticalBeamBroken ? 'BROKEN (Pill Dropped)' : 'Clear'}
            </strong>
          </div>
        </div>

        {/* Unclaimed Pill Alert within modal if applicable */}
        {telemetry.dispenseState === 'unclaimed_alarm' && (
          <div className="bg-[#fdf0ee] border-2 border-[#f0a89e] rounded-[1.5rem] p-4 text-center animate-bounce">
            <p className="font-extrabold text-[#7a1913] text-sm">
              ⚠️ UNCLAIMED PILL ALERT! Buzzer sounding.
            </p>
            <p className="text-xs text-[#5f6d72] mt-0.5">
              The pill was dispensed into the tray but has not been picked up yet.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          {telemetry.trayOccupied ? (
            <ClayButton
              tone="mint"
              size="lg"
              fullWidth
              onClick={() => {
                onAcknowledgePickup();
                onClose();
              }}
              className="text-base"
            >
              ✓ Confirm Pill Taken (Stop Buzzer)
            </ClayButton>
          ) : (
            <>
              <ClayButton
                tone="quiet"
                size="lg"
                onClick={onClose}
                disabled={isDispensing}
                className="flex-1"
              >
                Cancel
              </ClayButton>
              <ClayButton
                tone="mint"
                size="lg"
                onClick={handleStartDispense}
                disabled={isDispensing || !medicine.canDispense()}
                className="flex-2"
              >
                {isDispensing ? 'Dispensing Single Pill...' : 'Dispense 1 Pill Now'}
              </ClayButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
