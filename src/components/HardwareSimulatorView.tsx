import React from 'react';
import { IHardwareService, HardwareTelemetry, BuzzerPattern } from '../services/IHardwareService.ts';
import { ClayCard } from './ui/ClayCard.tsx';
import { ClayButton } from './ui/ClayButton.tsx';
import { ClayBadge } from './ui/ClayBadge.tsx';

interface HardwareSimulatorViewProps {
  hardwareService: IHardwareService;
  telemetry: HardwareTelemetry;
  onAcknowledgePickup: () => void;
}

interface TelemetryLogEntry {
  id: string;
  time: string;
  source: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export const HardwareSimulatorView: React.FC<HardwareSimulatorViewProps> = ({
  hardwareService,
  telemetry,
  onAcknowledgePickup,
}) => {
  const [logs, setLogs] = React.useState<TelemetryLogEntry[]>([
    {
      id: 'log-0',
      time: new Date().toLocaleTimeString(),
      source: 'ESP32-S3',
      message: 'System Boot: Dual-core FreeRTOS initialized. Core 0: Motors, Core 1: WebServer.',
      level: 'info',
    },
    {
      id: 'log-1',
      time: new Date().toLocaleTimeString(),
      source: 'TMC2209',
      message: 'UART driver connected. StealthChop2 enabled, StallGuard threshold=64.',
      level: 'success',
    },
    {
      id: 'log-2',
      time: new Date().toLocaleTimeString(),
      source: 'IR_BEAM',
      message: 'Optical beam interrupter calibrated. GPIO interrupt FALLING attached.',
      level: 'info',
    },
  ]);

  const addLog = (source: string, message: string, level: TelemetryLogEntry['level'] = 'info') => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        source,
        message,
        level,
      },
      ...prev.slice(0, 40),
    ]);
  };

  const handleManualStep = async (deltaDeg: number) => {
    const nextAngle = (telemetry.stepperAngleDeg + deltaDeg + 360) % 360;
    addLog('TMC2209', `Manual step command: ${deltaDeg > 0 ? '+' : ''}${deltaDeg}° -> Target: ${nextAngle}°`);
    await hardwareService.rotateStepper(telemetry.activeChamber, nextAngle, 1200);
  };

  const handleManualServo = async (angle: number) => {
    addLog('MG90S', `Actuating servo trapdoor to ${angle}°`);
    await hardwareService.setServoAngle(angle);
  };

  const handleBuzzer = async (pattern: BuzzerPattern) => {
    addLog('PIEZO', `Triggering buzzer tone pattern: ${pattern}`);
    await hardwareService.triggerBuzzer(pattern);
  };

  const handleToggleJam = () => {
    const next = !telemetry.jamDetected;
    hardwareService.simulateJam(next);
    addLog('TMC2209', next ? 'FAULT INJECTION: StallGuard load threshold exceeded!' : 'Jam condition cleared.', next ? 'warn' : 'info');
  };

  const handleTriggerDrop = () => {
    hardwareService.simulateOpticalDrop(true);
    addLog('IR_BEAM', 'Optical beam broken! Pill drop detected (duration=280ms).', 'success');
  };

  // Chamber slot angles on the 8-slot carousel:
  // Chamber 1 = 45°, 2 = 135°, 3 = 225°, 4 = 315°
  const chamberColors: Record<number, string> = {
    1: '#7dcbbe', // Mint
    2: '#f0b7a0', // Peach
    3: '#8ec5e8', // Sky
    4: '#f6e7a9', // Butter
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-2xl font-black text-[#2f383b] tracking-tight">
            Virtual Hardware Diagnostic Simulator
          </h2>
          <p className="text-sm font-semibold text-[#5f6d72]">
            Real-time interactive hardware visualization of Stepper carousel, Servo trapdoor, Optical sensor & Piezo buzzer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ClayBadge tone={telemetry.jamDetected ? 'danger' : 'mint'} size="md" pulse={telemetry.jamDetected}>
            {telemetry.jamDetected ? '⚠️ StallGuard Jam Detected' : '✓ Hardware Nominal'}
          </ClayBadge>
          <ClayBadge tone="quiet" size="md">
            12.1V Motor Rail
          </ClayBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INTERACTIVE SVG HARDWARE SCHEMATIC (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <ClayCard tone="clay" className="border-[#ebdccb] p-6 flex flex-col items-center">
            <h3 className="font-extrabold text-[#2f383b] text-base mb-2 self-start tracking-tight">
              Actuation Assembly (Carousel Rotor & Dispense Chute)
            </h3>

            {/* SVG Visualizer */}
            <div className="w-full max-w-[440px] aspect-square relative flex items-center justify-center bg-[#f7f4ed] rounded-[2rem] border border-[#e5dcce] p-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] overflow-hidden">
              <svg viewBox="0 0 400 400" className="w-full h-full select-none">
                <defs>
                  {/* Subtle shadows & gradients */}
                  <radialGradient id="rotorGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ede5d5" stopOpacity="0.4" />
                  </radialGradient>
                  <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Outer Dispenser Housing Ring */}
                <circle cx="200" cy="180" r="145" fill="#f0ebe0" stroke="#d8cfbe" strokeWidth="4" />
                <circle cx="200" cy="180" r="130" fill="url(#rotorGlow)" stroke="#ebdccb" strokeWidth="2" />

                {/* Fixed Chute Exit Marker at Bottom (180°) */}
                <path
                  d="M 175 305 L 225 305 L 210 330 L 190 330 Z"
                  fill="#7dcbbe"
                  stroke="#5cb8a8"
                  strokeWidth="2"
                />
                <text x="200" y="322" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1b3d36">
                  CHUTE EXIT
                </text>

                {/* ROTATING STEPPER CAROUSEL ROTOR */}
                <g
                  transform={`rotate(${telemetry.stepperAngleDeg}, 200, 180)`}
                  style={{ transition: telemetry.stepperRunning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)' }}
                >
                  {/* Rotor Body */}
                  <circle cx="200" cy="180" r="115" fill="#ffffff" stroke="#ded4c3" strokeWidth="3" filter="url(#softShadow)" />

                  {/* 8 Aperture Slots (Chambers 1-4 + 4 intermediate alignment notches) */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                    const chamberNum = i === 1 ? 1 : i === 3 ? 2 : i === 5 ? 3 : i === 7 ? 4 : null;
                    const rad = ((deg - 90) * Math.PI) / 180;
                    const x = 200 + 75 * Math.cos(rad);
                    const y = 180 + 75 * Math.sin(rad);

                    return (
                      <g key={deg}>
                        {/* Slot pocket */}
                        <circle
                          cx={x}
                          cy={y}
                          r={chamberNum ? 18 : 10}
                          fill={chamberNum ? chamberColors[chamberNum] : '#f2ece1'}
                          stroke={chamberNum ? '#ffffff' : '#e0d5c3'}
                          strokeWidth="2.5"
                          filter="url(#softShadow)"
                        />
                        {chamberNum && (
                          <text
                            x={x}
                            y={y + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="900"
                            fill="#2f383b"
                          >
                            C{chamberNum}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Center Motor Shaft Hub */}
                  <circle cx="200" cy="180" r="28" fill="#5f6d72" stroke="#2f383b" strokeWidth="3" />
                  <circle cx="200" cy="180" r="12" fill="#ffffff" />
                  {/* D-Cut shaft indicator */}
                  <line x1="200" y1="180" x2="200" y2="160" stroke="#2f383b" strokeWidth="4" strokeLinecap="round" />
                </g>

                {/* TMC2209 Angle degree read-out badge */}
                <rect x="155" y="15" width="90" height="26" rx="13" fill="#ffffff" stroke="#ebdccb" strokeWidth="1.5" />
                <text x="200" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2f383b">
                  {telemetry.stepperAngleDeg}° ROTOR
                </text>

                {/* LOWER SECTION: GRAVITY CHUTE, SERVO TRAPDOOR & OPTICAL SENSOR */}
                {/* Chute walls */}
                <line x1="170" y1="315" x2="170" y2="385" stroke="#88969b" strokeWidth="3" />
                <line x1="230" y1="315" x2="230" y2="385" stroke="#88969b" strokeWidth="3" />

                {/* SERVO TRAPDOOR FLAP */}
                {/* Hinged at (170, 345). 0° = horizontal closed, 90° = vertical open */}
                <g transform={`translate(170, 345) rotate(${telemetry.servoAngleDeg})`}>
                  <line x1="0" y1="0" x2="58" y2="0" stroke="#d4786a" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="4" fill="#2f383b" />
                </g>
                <text x="110" y="348" fontSize="10" fontWeight="bold" fill="#5f6d72">
                  SERVO ({telemetry.servoAngleDeg}°)
                </text>

                {/* IR OPTICAL BEAM BREAK SENSOR (At y = 365) */}
                <g>
                  {/* IR Emitter (Left) */}
                  <rect x="155" y="360" width="12" height="10" rx="3" fill="#2f383b" />
                  <circle cx="167" cy="365" r="3" fill="#e04e3a" />

                  {/* IR Receiver (Right) */}
                  <rect x="233" y="360" width="12" height="10" rx="3" fill="#2f383b" />
                  <circle cx="233" cy="365" r="3" fill="#7dcbbe" />

                  {/* IR Beam Ray */}
                  <line
                    x1="170"
                    y1="365"
                    x2="230"
                    y2="365"
                    stroke={telemetry.opticalBeamBroken ? '#e04e3a' : '#7dcbbe'}
                    strokeWidth={telemetry.opticalBeamBroken ? '4' : '2'}
                    strokeDasharray={telemetry.opticalBeamBroken ? 'none' : '3 3'}
                  />

                  {telemetry.opticalBeamBroken && (
                    <circle cx="200" cy="365" r="10" fill="#e04e3a" fillOpacity="0.4" className="animate-ping" />
                  )}

                  <text x="252" y="368" fontSize="9" fontWeight="bold" fill={telemetry.opticalBeamBroken ? '#e04e3a' : '#5f6d72'}>
                    {telemetry.opticalBeamBroken ? 'BEAM BROKEN!' : 'IR BEAM CLEAR'}
                  </text>
                </g>

                {/* PILL IN TRAY (Bottom Exit) */}
                {telemetry.trayOccupied && (
                  <g>
                    <ellipse cx="200" cy="388" rx="14" ry="7" fill="#7dcbbe" stroke="#4fa897" strokeWidth="2" filter="url(#softShadow)" />
                    <text x="200" y="391" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1b3d36">
                      PILL
                    </text>
                  </g>
                )}

                {/* PIEZO BUZZER GRAPHIC (Top Right) */}
                <g transform="translate(325, 30)">
                  <rect x="0" y="0" width="44" height="44" rx="12" fill="#ffffff" stroke="#ebdccb" strokeWidth="1.5" />
                  <text x="22" y="26" textAnchor="middle" fontSize="18">
                    {telemetry.buzzerActive ? '🔔' : '🔕'}
                  </text>
                  {telemetry.buzzerActive && (
                    <circle cx="22" cy="22" r="24" fill="none" stroke="#e04e3a" strokeWidth="2" className="animate-ping" />
                  )}
                </g>
              </svg>
            </div>

            {/* Visualizer Footer Status */}
            <div className="flex items-center justify-between w-full mt-3 text-xs font-bold text-[#5f6d72] px-2">
              <span>Active Chamber: <strong>Chamber #{telemetry.activeChamber}</strong></span>
              <span>Pickup Tray: <strong className={telemetry.trayOccupied ? 'text-amber-700' : 'text-emerald-700'}>
                {telemetry.trayOccupied ? 'Occupied (Waiting)' : 'Empty'}
              </strong></span>
            </div>
          </ClayCard>
        </div>

        {/* RIGHT COLUMN: MANUAL CONTROLS & TELEMETRY STREAM (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Manual Hardware Testing Controls */}
          <ClayCard tone="clay" className="border-[#ebdccb] p-5 flex flex-col gap-4">
            <h3 className="font-extrabold text-[#2f383b] text-base tracking-tight">
              Manual Hardware Control & Calibration
            </h3>

            {/* Stepper Motor Manual Jog */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#5f6d72]">TMC2209 Stepper Jog</span>
              <div className="grid grid-cols-3 gap-2">
                <ClayButton size="sm" tone="quiet" onClick={() => handleManualStep(-45)}>
                  -45° Step
                </ClayButton>
                <ClayButton size="sm" tone="quiet" onClick={() => handleManualStep(45)}>
                  +45° Step
                </ClayButton>
                <ClayButton
                  size="sm"
                  tone="quiet"
                  onClick={() => hardwareService.rotateStepper(1, 0, 1000)}
                >
                  Home (0°)
                </ClayButton>
              </div>
            </div>

            {/* Servo Trapdoor Manual Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#5f6d72]">MG90S Servo Trapdoor</span>
              <div className="grid grid-cols-2 gap-2">
                <ClayButton
                  size="sm"
                  tone={telemetry.servoAngleDeg === 90 ? 'mint' : 'quiet'}
                  onClick={() => handleManualServo(90)}
                >
                  Open Gate (90°)
                </ClayButton>
                <ClayButton
                  size="sm"
                  tone={telemetry.servoAngleDeg === 0 ? 'mint' : 'quiet'}
                  onClick={() => handleManualServo(0)}
                >
                  Close Gate (0°)
                </ClayButton>
              </div>
            </div>

            {/* Piezo Buzzer Sound Test */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#5f6d72]">ESP32 LEDC Piezo Audio</span>
              <div className="grid grid-cols-3 gap-2">
                <ClayButton size="sm" tone="butter" onClick={() => handleBuzzer('reminder')}>
                  Chime
                </ClayButton>
                <ClayButton size="sm" tone="danger" onClick={() => handleBuzzer('unclaimed_alert')}>
                  Alarm
                </ClayButton>
                <ClayButton size="sm" tone="quiet" onClick={() => handleBuzzer('stop')}>
                  Stop
                </ClayButton>
              </div>
            </div>

            {/* Sensor & Fault Simulation */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#ebdccb]">
              <span className="text-xs font-bold text-[#5f6d72]">Sensors & Fault Injection</span>
              <div className="grid grid-cols-2 gap-2">
                <ClayButton size="sm" tone="sky" onClick={handleTriggerDrop}>
                  Test IR Drop
                </ClayButton>
                <ClayButton
                  size="sm"
                  tone={telemetry.jamDetected ? 'danger' : 'quiet'}
                  onClick={handleToggleJam}
                >
                  {telemetry.jamDetected ? 'Clear Jam' : 'Simulate Jam'}
                </ClayButton>
              </div>
            </div>

            {/* Tray Pickup Acknowledgment */}
            {telemetry.trayOccupied && (
              <ClayButton
                tone="mint"
                size="md"
                fullWidth
                onClick={onAcknowledgePickup}
                className="mt-1"
              >
                ✓ Acknowledge Tray Pickup (Take Pill)
              </ClayButton>
            )}
          </ClayCard>

          {/* Real-time Hardware Telemetry Console */}
          <ClayCard tone="clay" className="border-[#ebdccb] p-4 flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between border-b border-[#ebdccb] pb-2">
              <h4 className="font-extrabold text-[#2f383b] text-xs uppercase tracking-wider">
                ESP32 UART / RTOS Telemetry Log
              </h4>
              <button
                onClick={() => setLogs([])}
                className="text-[11px] font-bold text-[#5f6d72] hover:text-[#2f383b] cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] font-mono text-[11px] pr-1">
              {logs.map((log) => {
                const badgeColor =
                  log.level === 'error'
                    ? 'text-rose-600'
                    : log.level === 'warn'
                    ? 'text-amber-600'
                    : log.level === 'success'
                    ? 'text-emerald-700'
                    : 'text-[#5f6d72]';

                return (
                  <div key={log.id} className="leading-tight py-0.5 border-b border-[#ebdccb]/40">
                    <span className="text-[#88969b] mr-1.5">[{log.time}]</span>
                    <strong className={`${badgeColor} mr-1.5`}>[{log.source}]</strong>
                    <span className="text-[#2f383b]">{log.message}</span>
                  </div>
                );
              })}
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
