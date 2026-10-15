import React from 'react';
import { ScheduleItem } from '../domain/ScheduleManager.ts';
import { Medicine } from '../domain/Medicine.ts';
import { ClayCard } from './ui/ClayCard.tsx';
import { ClayButton } from './ui/ClayButton.tsx';
import { ClayBadge } from './ui/ClayBadge.tsx';
import { ClayInput } from './ui/ClayInput.tsx';
import {
  ClockIcon,
  PlusIcon,
  XIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from './ui/LucideIcons.tsx';

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  medicines: Medicine[];
  onDispenseSchedule: (schedule: ScheduleItem) => void;
  onMarkTaken: (id: string) => void;
  onAddSchedule: (time: string, label: string, chamberId: number) => void;
  onDeleteSchedule: (id: string) => void;
  isBusy: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  medicines,
  onDispenseSchedule,
  onMarkTaken,
  onAddSchedule,
  onDeleteSchedule,
  isBusy,
}) => {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newTime, setNewTime] = React.useState('14:00');
  const [newLabel, setNewLabel] = React.useState('Afternoon Dose');
  const [newChamber, setNewChamber] = React.useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTime && newLabel) {
      onAddSchedule(newTime, newLabel, newChamber);
      setShowAddModal(false);
    }
  };

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'taken':
        return (
          <ClayBadge tone="mint" size="sm" className="flex items-center gap-1">
            <CheckCircle2Icon size={12} />
            <span>Taken</span>
          </ClayBadge>
        );
      case 'dispensed':
        return <ClayBadge tone="butter" size="sm" pulse>In Pickup Tray</ClayBadge>;
      case 'unclaimed_alert':
        return (
          <ClayBadge tone="danger" size="sm" pulse className="flex items-center gap-1">
            <AlertTriangleIcon size={12} />
            <span>Unclaimed Alarm</span>
          </ClayBadge>
        );
      case 'due':
        return <ClayBadge tone="peach" size="sm" pulse>Due Now</ClayBadge>;
      case 'upcoming':
      default:
        return <ClayBadge tone="quiet" size="sm">Scheduled</ClayBadge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-2xl font-black text-[#2f383b] tracking-tight">
            Daily Dispensing Schedule
          </h2>
          <p className="text-sm font-semibold text-[#5f6d72]">
            Automated dosing timeline with optical drop confirmation and unclaimed pill reminders.
          </p>
        </div>
        <ClayButton
          tone="mint"
          size="md"
          onClick={() => setShowAddModal(true)}
          className="shadow-sm flex items-center gap-1.5"
        >
          <PlusIcon size={18} />
          <span>Add Scheduled Dose</span>
        </ClayButton>
      </div>

      {/* Schedule Items List */}
      <div className="flex flex-col gap-4">
        {schedules.map((item) => {
          const med = medicines.find((m) => m.chamberId === item.chamberId);

          return (
            <ClayCard
              key={item.id}
              tone={item.status === 'unclaimed_alert' ? 'danger' : 'clay'}
              className="border-[#e5dcce] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Column: Time & Pill Details */}
              <div className="flex items-center gap-4">
                <div className="min-w-[80px] text-center bg-[#f4efe6] py-2.5 px-3 rounded-[1.25rem] border border-[#e2dbce]">
                  <span className="text-xl font-black text-[#2f383b] tracking-tight block">
                    {item.time}
                  </span>
                  <span className="text-[11px] font-bold text-[#5f6d72] uppercase block">
                    {parseInt(item.time.split(':')[0], 10) < 12 ? 'AM' : 'PM'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#2f383b] leading-tight">
                      {item.label}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>
                  {med && (
                    <p className="text-sm font-semibold text-[#5f6d72]">
                      Chamber {med.chamberId} • <strong className="text-[#2f383b]">{med.name}</strong> ({med.dosage})
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                {item.status === 'dispensed' || item.status === 'unclaimed_alert' ? (
                  <ClayButton
                    tone={item.status === 'unclaimed_alert' ? 'danger' : 'mint'}
                    size="md"
                    onClick={() => onMarkTaken(item.id)}
                    className="flex-1 md:flex-initial flex items-center gap-1.5"
                  >
                    <CheckCircle2Icon size={16} />
                    <span>Confirm Taken</span>
                  </ClayButton>
                ) : item.status === 'taken' ? (
                  <span className="text-xs font-bold text-[#1b5e50] bg-[#eef7f5] px-3 py-1.5 rounded-full border border-[#c5e6df] flex items-center gap-1">
                    <CheckCircle2Icon size={14} />
                    <span>Dose Retrieved</span>
                  </span>
                ) : (
                  <ClayButton
                    tone="mint"
                    size="md"
                    onClick={() => onDispenseSchedule(item)}
                    disabled={isBusy || (med ? !med.canDispense() : true)}
                    className="flex-1 md:flex-initial"
                  >
                    Dispense 1 Pill
                  </ClayButton>
                )}

                <button
                  onClick={() => onDeleteSchedule(item.id)}
                  title="Remove from schedule"
                  className="w-10 h-10 rounded-full hover:bg-[#eae3d7] flex items-center justify-center text-[#88969b] hover:text-[#5f6d72] font-bold cursor-pointer transition-colors"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </ClayCard>
          );
        })}
      </div>

      {/* Add Schedule Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#fffdf8] w-full max-w-md rounded-[2rem] border border-[#ebdccb] shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-3">
              <h3 className="text-lg font-extrabold text-[#2f383b]">
                Add Daily Dose Schedule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#f4efe6] flex items-center justify-center font-bold text-[#5f6d72] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <ClayInput
                label="Dose Time (24h format)"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />

              <ClayInput
                label="Dose Label"
                type="text"
                placeholder="e.g. Afternoon Snack Dose"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#2f383b] text-sm">Select Chamber / Medicine</label>
                <select
                  value={newChamber}
                  onChange={(e) => setNewChamber(Number(e.target.value))}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-[1.25rem] bg-[#f7f4ed] text-[#2f383b] font-semibold text-base border border-[#e0d6c5] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#7dcbbe]/30 cursor-pointer"
                >
                  {medicines.map((m) => (
                    <option key={m.chamberId} value={m.chamberId}>
                      Chamber {m.chamberId}: {m.name} ({m.dosage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#ebdccb]">
                <ClayButton
                  type="button"
                  tone="quiet"
                  size="md"
                  fullWidth
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  type="submit"
                  tone="mint"
                  size="md"
                  fullWidth
                >
                  Add Schedule
                </ClayButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
