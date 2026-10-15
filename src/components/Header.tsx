import React from 'react';
import { ClayBadge } from './ui/ClayBadge.tsx';
import { ClayButton } from './ui/ClayButton.tsx';
import { HardwareTelemetry } from '../services/IHardwareService.ts';
import { AudioManager } from '../services/AudioManager.ts';

export type ActiveTab = 'dashboard' | 'chambers' | 'schedule' | 'simulator';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  telemetry: HardwareTelemetry;
  isRealHardware: boolean;
  onToggleHardwareMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  telemetry,
  isRealHardware,
  onToggleHardwareMode,
}) => {
  const audioManager = AudioManager.getInstance();
  const [isMuted, setIsMuted] = React.useState(audioManager.getIsMuted());

  const handleToggleMute = () => {
    const next = !isMuted;
    audioManager.setMuted(next);
    setIsMuted(next);
  };

  const navItems: { tab: ActiveTab; label: string; icon: string }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { tab: 'chambers', label: 'Chambers', icon: '💊' },
    { tab: 'schedule', label: 'Daily Schedule', icon: '⏰' },
    { tab: 'simulator', label: 'Hardware Diagnostic', icon: '⚙️' },
  ];

  return (
    <header className="w-full bg-[#fffdf8]/90 backdrop-blur-md border-b border-[#ebdccb] sticky top-0 z-40 px-4 py-3 shadow-[0_2px_12px_rgba(47,56,59,0.04)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7dcbbe] flex items-center justify-center text-xl shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_3px_6px_rgba(0,0,0,0.08)]">
              💊
            </div>
            <div>
              <h1 className="font-extrabold text-[#2f383b] text-lg tracking-tight leading-none">
                Smart Dispenser
              </h1>
              <p className="text-xs text-[#5f6d72] font-semibold mt-0.5">
                EE Senior Design • ESP32-S3
              </p>
            </div>
          </div>

          {/* Quick Mode Status Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleHardwareMode}
              title="Click to toggle Real ESP32 / Mock mode"
              className="cursor-pointer"
            >
              <ClayBadge tone={isRealHardware ? 'mint' : 'sky'} size="sm">
                {isRealHardware ? '● ESP32 Hardware' : '○ Browser Mock'}
              </ClayBadge>
            </button>
            <ClayButton
              size="sm"
              tone={isMuted ? 'quiet' : 'mint'}
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Piezo Buzzer' : 'Mute Piezo Buzzer'}
              className="!min-h-[36px] !px-3"
            >
              {isMuted ? '🔇 Buzzer Muted' : '🔊 Buzzer Sound'}
            </ClayButton>
          </div>
        </div>

        {/* Tactile Tab Navigation with >=48px Touch Targets */}
        <nav className="flex items-center gap-1.5 bg-[#f5f1e8] p-1.5 rounded-[1.75rem] border border-[#e5dcce] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] w-full md:w-auto overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`
                  flex-1 md:flex-initial min-h-[44px] px-4 py-2 rounded-[1.25rem] font-bold text-sm select-none
                  transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer
                  ${
                    isActive
                      ? 'bg-[#ffffff] text-[#2f383b] shadow-[0_3px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#ebdccb]'
                      : 'text-[#5f6d72] hover:text-[#2f383b] hover:bg-[#ede7dc]/60'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
