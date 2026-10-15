import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const firmwareDataDir = path.resolve(rootDir, 'firmware', 'data');

console.log('🚀 Starting Smart Medicine Dispenser Production Build...');

// Ensure output directories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(firmwareDataDir, { recursive: true });

// Build the self-contained Single-Page Application HTML
const productionHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Smart Medicine Dispenser - Senior Design</title>
  <style>
    /* Embedded Claymorphic CSS System */
    :root {
      --color-mint: #7dcbbe;
      --color-peach: #f0b7a0;
      --color-sky: #8ec5e8;
      --color-butter: #f6e7a9;
      --color-ink: #2f383b;
      --color-muted: #5f6d72;
      --color-clay: #fffdf8;
      --radius-clay: 1.75rem;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --color-clay-glint: rgba(255, 255, 255, 0.65);
      --shadow-clay-rest: inset 0 2px 0 var(--color-clay-glint), inset 0 -2px 0 rgba(0, 0, 0, 0.05),
        0 4px 14px rgba(47, 56, 59, 0.08);
      --shadow-clay-pressed: inset 0 2px 5px rgba(31, 42, 46, 0.18),
        inset 0 1px 2px rgba(31, 42, 46, 0.1), 0 1px 2px rgba(31, 42, 46, 0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: var(--font-sans);
      background-color: #fcf9f2;
      color: #2f383b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .surface-clay {
      background-color: #fffdf8;
      border: 1px solid rgba(235, 220, 203, 0.9);
      box-shadow: var(--shadow-clay-rest);
      border-radius: var(--radius-clay);
    }
    .clay-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 700;
      min-height: 48px;
      padding: 0.65rem 1.4rem;
      border-radius: 1.5rem;
      border: 1px solid rgba(0,0,0,0.08);
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -2px 0 rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.08);
    }
    .clay-btn:active {
      transform: translateY(2px);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.08);
    }
    .clay-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    .btn-mint { background-color: #7dcbbe; color: #1b3d36; border-color: #5cb8a8; }
    .btn-peach { background-color: #f0b7a0; color: #4d281a; border-color: #e29d81; }
    .btn-sky { background-color: #8ec5e8; color: #1b364d; border-color: #72aecd; }
    .btn-butter { background-color: #f6e7a9; color: #483c16; border-color: #e5cd77; }
    .btn-danger { background-color: #f0a89e; color: #551913; border-color: #dc7d70; }
    .btn-quiet { background-color: #f4efe6; color: #475256; border-color: #ded4c3; }
    .clay-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }
    .badge-mint { background-color: #d6f2ec; color: #1b5e50; border-color: #9fdcd1; }
    .badge-peach { background-color: #fbe4db; color: #7a3219; border-color: #f4bba7; }
    .badge-sky { background-color: #dbeef9; color: #154e75; border-color: #a9d7f3; }
    .badge-butter { background-color: #fcf5ce; color: #6b5815; border-color: #f3e387; }
    .badge-danger { background-color: #fbdad5; color: #861e13; border-color: #f49f94; }
    .badge-quiet { background-color: #f0ebe0; color: #556368; border-color: #ded5c5; }
    header {
      background: rgba(255, 253, 248, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #ebdccb;
      position: sticky;
      top: 0;
      z-index: 40;
      padding: 0.75rem 1rem;
    }
    .container { max-width: 1140px; margin: 0 auto; width: 100%; }
    .header-content { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .nav-tabs { display: flex; gap: 0.35rem; background: #f5f1e8; padding: 0.35rem; border-radius: 1.5rem; border: 1px solid #e5dcce; overflow-x: auto; }
    .nav-tab {
      padding: 0.5rem 1rem; border-radius: 1.15rem; font-weight: 700; font-size: 0.875rem;
      border: none; background: transparent; color: #5f6d72; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
      white-space: nowrap; transition: all 0.15s ease;
    }
    .nav-tab.active { background: #fff; color: #2f383b; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #ebdccb; }
    main { flex: 1; padding: 1.5rem 1rem; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
    .hero-card { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; padding: 1.5rem; }
    .alert-banner {
      padding: 1.25rem 1.5rem; border-radius: 1.75rem; border: 2px solid #e04e3a; background: #fdf0ee;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;
      animation: alertPulse 1.8s infinite; box-shadow: 0 8px 24px rgba(224, 78, 58, 0.15);
    }
    @keyframes alertPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.008); box-shadow: 0 12px 30px rgba(224, 78, 58, 0.25); }
    }
    .modal-overlay {
      position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center;
      padding: 1rem; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #fffdf8; max-width: 520px; width: 100%; border-radius: 2rem; border: 1px solid #ebdccb;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.8); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;
    }
    .rotor-container {
      background: #f7f4ed; border: 1px solid #e5dcce; border-radius: 1.75rem; padding: 1rem;
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .rotor-svg { width: 100%; max-width: 420px; aspect-ratio: 1/1; }
    .telemetry-log {
      background: #fdfcf9; border: 1px solid #ebdccb; border-radius: 1.25rem; padding: 0.75rem;
      max-height: 220px; overflow-y: auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem;
    }
    .icon-svg { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; }
    .step-node {
      padding: 0.6rem 0.4rem; border-radius: 1rem; border: 1px solid #e2dbce; background: #f4efe6;
      font-size: 0.7rem; font-weight: 700; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    }
    .step-node.active { background: #7dcbbe; color: #1b3d36; border-color: #5cb8a8; animation: alertPulse 1.2s infinite; }
    .step-node.done { background: #d6f2ec; color: #1b5e50; border-color: #9fdcd1; }
  </style>
</head>
<body>
  <!-- Header App Shell -->
  <header>
    <div class="container header-content">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <div style="width:40px; height:40px; border-radius:1rem; background:#7dcbbe; display:flex; align-items:center; justify-content:center; color:#1b3d36; box-shadow:inset 0 2px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.08);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
        </div>
        <div>
          <div style="font-weight:900; font-size:1.15rem; letter-spacing:-0.02em;">Smart Dispenser</div>
          <div style="font-size:0.75rem; font-weight:700; color:#5f6d72;">EE Senior Design • ESP32-S3 Dual-Core</div>
        </div>
        <div style="display:flex; gap:0.5rem; margin-left:0.5rem; align-items:center;">
          <span class="clay-badge badge-mint" id="hw-mode-badge">● ESP32 Core 0/1</span>
          <button class="clay-btn btn-quiet" id="mute-btn" style="min-height:36px; padding:0.3rem 0.8rem; font-size:0.8rem;">
            <span id="mute-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>
            <span id="mute-text">Buzzer Active</span>
          </button>
        </div>
      </div>

      <nav class="nav-tabs">
        <button class="nav-tab active" data-tab="dashboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          Dashboard
        </button>
        <button class="nav-tab" data-tab="chambers">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
          Chambers
        </button>
        <button class="nav-tab" data-tab="schedule">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Schedule
        </button>
        <button class="nav-tab" data-tab="simulator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Hardware Diagnostic
        </button>
      </nav>
    </div>
  </header>

  <main class="container" id="main-content">
    <!-- Active view will be rendered by JavaScript -->
  </main>

  <!-- Modal Container -->
  <div id="modal-container" style="display:none;"></div>

  <!-- Client Application Script -->
  <script type="module">
    // Polymorphic Domain Model & Actuation Profiles
    class Medicine {
      constructor(id, name, dosage, type, chamberId, count, maxCap, instructions, color, border) {
        this.id = id;
        this.name = name;
        this.dosage = dosage;
        this.type = type;
        this.chamberId = chamberId;
        this.inventoryCount = count;
        this.maxCapacity = maxCap;
        this.instructions = instructions;
        this.colorHex = color;
        this.accentBorderHex = border;
      }
      canDispense() { return this.inventoryCount > 0; }
      recordDispense() { if (this.inventoryCount > 0) { this.inventoryCount--; return true; } return false; }
      refill(amount) { const added = Math.min(amount, this.maxCapacity - this.inventoryCount); this.inventoryCount += added; return added; }
      getFillPercentage() { return Math.round((this.inventoryCount / this.maxCapacity) * 100); }
    }

    class RoundTabletMedicine extends Medicine {
      getDispenseProfile() {
        return { stepDelayUs: 1200, microsteps: 16, acceleration: 850, servoGateHoldMs: 800, vibrationJitterSteps: 0, reverseBacklashSteps: 2 };
      }
      getJamRiskFactor() { return 0.03; }
      getPhysicalDescription() { return "Round convex tablet (8.0mm × 3.5mm), low rolling friction."; }
    }

    class OblongCapsuleMedicine extends Medicine {
      getDispenseProfile() {
        return { stepDelayUs: 1800, microsteps: 32, acceleration: 500, servoGateHoldMs: 1400, vibrationJitterSteps: 4, reverseBacklashSteps: 4 };
      }
      getJamRiskFactor() { return 0.16; }
      getPhysicalDescription() { return "Oblong gelatin capsule (19.5mm × 6.8mm), requires micro-vibration alignment."; }
    }

    class FragileScoredMedicine extends Medicine {
      getDispenseProfile() {
        return { stepDelayUs: 2400, microsteps: 64, acceleration: 300, servoGateHoldMs: 1100, vibrationJitterSteps: 0, reverseBacklashSteps: 0 };
      }
      getJamRiskFactor() { return 0.08; }
      getPhysicalDescription() { return "Fragile scored tablet with score-line, requires smooth S-curve acceleration."; }
    }

    // Web Audio Synthesizer for Piezo Buzzer
    class AudioManager {
      constructor() {
        this.ctx = null;
        this.muted = false;
        this.alarmInterval = null;
      }
      init() {
        if (!this.ctx && typeof AudioContext !== 'undefined') {
          this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
      playTone(freq, dur, type='sine', gainVal=0.2) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
      }
      playChime() {
        this.playTone(880, 0.2, 'sine', 0.25);
        setTimeout(() => this.playTone(1318.5, 0.35, 'sine', 0.22), 180);
      }
      playConfirm() {
        this.playTone(523.25, 0.2, 'triangle', 0.15);
        this.playTone(659.25, 0.2, 'triangle', 0.15);
        this.playTone(783.99, 0.25, 'triangle', 0.15);
      }
      playJamError() {
        this.playTone(150, 0.4, 'sawtooth', 0.3);
      }
      startUnclaimedAlarm() {
        if (this.alarmInterval) clearInterval(this.alarmInterval);
        const burst = () => {
          this.playTone(2730, 0.12, 'square', 0.28);
          setTimeout(() => this.playTone(2730, 0.12, 'square', 0.28), 180);
          setTimeout(() => this.playTone(2730, 0.18, 'square', 0.32), 360);
        };
        burst();
        this.alarmInterval = setInterval(() => { if (!this.muted) burst(); }, 2800);
      }
      stop() {
        if (this.alarmInterval) { clearInterval(this.alarmInterval); this.alarmInterval = null; }
      }
    }

    const audioMgr = new AudioManager();

    // Hardware State & Mock Simulation
    const state = {
      activeTab: 'dashboard',
      isReal: false,
      autoDoseEnabled: true,
      telemetry: {
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
        firmwareVersion: 'ESP32S3-v1.4.2-LFS'
      },
      medicines: [
        new RoundTabletMedicine('med-1', 'Lisinopril', '10 mg', 'round_tablet', 1, 24, 30, 'Take in morning for blood pressure', '#7dcbbe', '#4fa897'),
        new OblongCapsuleMedicine('med-2', 'Omega-3 Fish Oil', '1000 mg', 'oblong_capsule', 2, 18, 25, 'Take with meal and plenty of water', '#f0b7a0', '#d4786a'),
        new RoundTabletMedicine('med-3', 'Metformin', '500 mg', 'round_tablet', 3, 20, 30, 'Take twice daily with meals', '#f6e7a9', '#d1b854'),
        new FragileScoredMedicine('med-4', 'Prednisone', '20 mg', 'fragile_scored', 4, 14, 30, 'Taper dose as directed; single score line', '#8ec5e8', '#6a9fc4')
      ],
      schedules: [
        { id: 'sch-1', time: '08:00', label: 'Morning Dose', chamberId: 1, status: 'taken' },
        { id: 'sch-2', time: '12:30', label: 'Noon Dose', chamberId: 2, status: 'upcoming' },
        { id: 'sch-3', time: '18:00', label: 'Dinner Dose', chamberId: 3, status: 'upcoming' },
        { id: 'sch-4', time: '21:30', label: 'Bedtime Dose', chamberId: 4, status: 'upcoming' }
      ],
      logs: [
        { time: new Date().toLocaleTimeString(), src: 'ESP32-S3', msg: 'System Boot: Dual-core FreeRTOS initialized. Core 0: Motors, Core 1: WebServer.', level: 'info' },
        { time: new Date().toLocaleTimeString(), src: 'TMC2209', msg: 'StealthChop2 enabled, StallGuard threshold=64.', level: 'success' },
        { time: new Date().toLocaleTimeString(), src: 'IR_BEAM', msg: 'Optical beam interrupter calibrated. GPIO interrupt attached.', level: 'info' }
      ]
    };

    function addLog(src, msg, level='info') {
      state.logs.unshift({ time: new Date().toLocaleTimeString(), src, msg, level });
      if (state.logs.length > 30) state.logs.pop();
      if (state.activeTab === 'simulator') renderLogs();
    }

    // Hardware Simulation Actuations
    let unclaimedTimer = null;

    async function rotateStepper(targetDeg) {
      state.telemetry.stepperRunning = true;
      const start = state.telemetry.stepperAngleDeg;
      let delta = (targetDeg - start) % 360;
      if (delta < 0) delta += 360;
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 20));
        state.telemetry.stepperAngleDeg = Math.round((start + (delta * i) / steps) % 360);
        updateSimulatorSVG();
      }
      state.telemetry.stepperRunning = false;
    }

    async function reverseStepper(degrees) {
      state.telemetry.stepperRunning = true;
      const start = state.telemetry.stepperAngleDeg;
      const steps = 15;
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 20));
        let cur = start - (degrees * i) / steps;
        while (cur < 0) cur += 360;
        state.telemetry.stepperAngleDeg = Math.round(cur) % 360;
        updateSimulatorSVG();
      }
      state.telemetry.stepperRunning = false;
    }

    async function setServo(angle) {
      const start = state.telemetry.servoAngleDeg;
      const diff = angle - start;
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 20));
        state.telemetry.servoAngleDeg = Math.round(start + (diff * i) / steps);
        updateSimulatorSVG();
      }
    }

    async function dispensePill(chamberId) {
      // Critical Safety Interlock: Reject if tray is occupied or motor busy
      if (state.telemetry.trayOccupied) {
        addLog('SAFETY_INTERLOCK', 'Dispense BLOCKED: Pickup tray already contains a pill! Take dose first.', 'error');
        alert('Dispense blocked: A pill is already waiting in the collection tray. Please take your medication first.');
        return false;
      }
      if (state.telemetry.dispenseState !== 'idle') {
        addLog('HARDWARE', \`Dispenser busy in state: \${state.telemetry.dispenseState}\`, 'warn');
        return false;
      }

      const med = state.medicines.find(m => m.chamberId === chamberId);
      if (!med || !med.canDispense()) {
        addLog('INVENTORY', \`Chamber \${chamberId} empty or depleted!\`, 'error');
        return false;
      }

      const profile = med.getDispenseProfile();
      addLog('DISPENSER', \`Beginning single-pill singulation for Chamber \${chamberId} (\${med.name})...\`, 'info');

      // 1. Index Stepper
      const angles = { 1: 45, 2: 135, 3: 225, 4: 315 };
      state.telemetry.dispenseState = 'indexing_motor';
      state.telemetry.activeChamber = chamberId;
      updatePipelineModal(1);
      render();
      await rotateStepper(angles[chamberId] || 45);

      // Check Jam
      if (state.telemetry.jamDetected) {
        state.telemetry.dispenseState = 'jammed';
        audioMgr.playJamError();
        addLog('TMC2209', 'StallGuard torque limit reached! Reversing 15° counter-clockwise to clear jam.', 'error');
        await reverseStepper(15);
        closeModal();
        render();
        return false;
      }

      // 2. Vibration Jitter if capsule
      if (profile.vibrationJitterSteps > 0) {
        state.telemetry.dispenseState = 'vibrating';
        updatePipelineModal(2);
        render();
        for (let j = 0; j < profile.vibrationJitterSteps; j++) {
          state.telemetry.stepperAngleDeg = (state.telemetry.stepperAngleDeg + 3) % 360;
          updateSimulatorSVG();
          await new Promise(r => setTimeout(r, 40));
          state.telemetry.stepperAngleDeg = (state.telemetry.stepperAngleDeg - 3 + 360) % 360;
          updateSimulatorSVG();
          await new Promise(r => setTimeout(r, 40));
        }
      }

      // 3. Open Servo Gate
      state.telemetry.dispenseState = 'opening_gate';
      updatePipelineModal(2);
      render();
      await setServo(90);

      // 4. Optical Beam Drop Detect
      state.telemetry.dispenseState = 'verifying_beam_break';
      updatePipelineModal(3);
      render();
      await new Promise(r => setTimeout(r, 200));

      state.telemetry.opticalBeamBroken = true;
      audioMgr.playChime();
      addLog('IR_BEAM', \`Optical beam break confirmed! Pill dropped into tray (chamber \${chamberId}).\`, 'success');
      updateSimulatorSVG();
      await new Promise(r => setTimeout(r, profile.servoGateHoldMs));

      state.telemetry.opticalBeamBroken = false;
      updateSimulatorSVG();

      // 5. Close Gate
      state.telemetry.dispenseState = 'closing_gate';
      render();
      await setServo(0);

      // 6. Waiting for Pickup & Countdown
      med.recordDispense();
      state.telemetry.dispenseState = 'waiting_pickup';
      state.telemetry.trayOccupied = true;
      state.telemetry.unclaimedTimerSeconds = 15;
      updatePipelineModal(4);

      // Update schedule item if matched
      const due = state.schedules.find(s => s.chamberId === chamberId && (s.status === 'upcoming' || s.status === 'due'));
      if (due) due.status = 'dispensed';

      render();
      startUnclaimedTimer();
      return true;
    }

    function startUnclaimedTimer() {
      if (unclaimedTimer) clearInterval(unclaimedTimer);
      unclaimedTimer = setInterval(() => {
        if (state.telemetry.dispenseState !== 'waiting_pickup' && state.telemetry.dispenseState !== 'unclaimed_alarm') {
          clearInterval(unclaimedTimer);
          return;
        }
        if (state.telemetry.unclaimedTimerSeconds > 0) {
          state.telemetry.unclaimedTimerSeconds--;
          const timerEl = document.getElementById('unclaimed-timer-text');
          if (timerEl) timerEl.innerText = state.telemetry.unclaimedTimerSeconds + 's';

          if (state.telemetry.unclaimedTimerSeconds === 0) {
            state.telemetry.dispenseState = 'unclaimed_alarm';
            audioMgr.startUnclaimedAlarm();
            addLog('ALARM', 'UNCLAIMED PILL ALERT! Buzzer sounding because pill was not retrieved.', 'error');

            // Mark schedule item as unclaimed_alert
            const dispensed = state.schedules.find(s => s.status === 'dispensed');
            if (dispensed) dispensed.status = 'unclaimed_alert';

            render();
          }
        }
      }, 1000);
    }

    function acknowledgePickup() {
      if (unclaimedTimer) clearInterval(unclaimedTimer);
      audioMgr.stop();
      audioMgr.playConfirm();
      state.telemetry.trayOccupied = false;
      state.telemetry.unclaimedTimerSeconds = 0;
      state.telemetry.dispenseState = 'idle';
      addLog('TRAY_SENSOR', 'Patient retrieved medication from pickup tray. Reminder silenced.', 'success');

      // Update schedule item if one was waiting
      const due = state.schedules.find(s => s.status === 'dispensed' || s.status === 'unclaimed_alert');
      if (due) due.status = 'taken';

      closeModal();
      render();
    }

    // Modal UI Helpers
    let modalActiveMed = null;

    function openDispenseModal(chamberId) {
      const med = state.medicines.find(m => m.chamberId === chamberId);
      if (!med) return;
      modalActiveMed = med;
      const modal = document.getElementById('modal-container');
      const profile = med.getDispenseProfile();

      modal.innerHTML = \`
        <div class="modal-overlay" id="modal-backdrop">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ebdccb; pb:1rem; padding-bottom:0.75rem;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:44px; height:44px; border-radius:1rem; background:\${med.colorHex}; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:inset 0 2px 0 rgba(255,255,255,0.7);">
                  \${med.chamberId}
                </div>
                <div>
                  <h3 style="font-size:1.2rem; font-weight:900; line-height:1.2;">Dispense Single Pill</h3>
                  <p style="font-size:0.8rem; font-weight:700; color:#5f6d72;">Chamber #\${med.chamberId} • \${med.name} (\${med.dosage})</p>
                </div>
              </div>
              <button id="modal-close-btn" style="border:none; background:#f4efe6; width:34px; height:34px; border-radius:50%; font-weight:900; cursor:pointer;">✕</button>
            </div>

            <div style="background:#f7f4ed; padding:0.85rem; border-radius:1.25rem; border:1px solid #e5dcce; font-size:0.8rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <strong style="color:#5f6d72;">PROFILE & HANDLING</strong>
                <span class="clay-badge badge-mint">\${med.type.replace('_',' ').toUpperCase()}</span>
              </div>
              <p style="font-weight:600; color:#2f383b;">\${med.getPhysicalDescription()}</p>
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid #ebdccb;">
                <div><span style="color:#5f6d72;">Feed Rate:</span> <strong>\${profile.stepDelayUs}µs</strong></div>
                <div><span style="color:#5f6d72;">Gate Hold:</span> <strong>\${profile.servoGateHoldMs}ms</strong></div>
              </div>
            </div>

            <div>
              <span style="font-size:0.75rem; font-weight:800; color:#5f6d72; text-transform:uppercase; display:block; margin-bottom:0.4rem;">
                Hardware Dispense Pipeline
              </span>
              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem;">
                <div class="step-node" id="modal-step-1"><span>1</span><span>Stepper</span></div>
                <div class="step-node" id="modal-step-2"><span>2</span><span>Servo Gate</span></div>
                <div class="step-node" id="modal-step-3"><span>3</span><span>IR Drop</span></div>
                <div class="step-node" id="modal-step-4"><span>4</span><span>Tray Ready</span></div>
              </div>
            </div>

            <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
              <button class="clay-btn btn-quiet" id="modal-cancel-btn" style="flex:1;">Cancel</button>
              <button class="clay-btn btn-mint" id="modal-start-dispense-btn" style="flex:2;" \${state.telemetry.trayOccupied ? 'disabled' : ''}>
                Dispense 1 Pill Now
              </button>
            </div>
          </div>
        </div>
      \`;
      modal.style.display = 'block';

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
      document.getElementById('modal-start-dispense-btn').addEventListener('click', async () => {
        const btn = document.getElementById('modal-start-dispense-btn');
        if (btn) { btn.disabled = true; btn.innerText = 'Dispensing...'; }
        await dispensePill(chamberId);
      });
    }

    function updatePipelineModal(step) {
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(\`modal-step-\${i}\`);
        if (!el) continue;
        el.className = 'step-node';
        if (i < step) el.classList.add('done');
        else if (i === step) el.classList.add('active');
      }
    }

    function closeModal() {
      const modal = document.getElementById('modal-container');
      if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = '';
      }
      modalActiveMed = null;
    }

    // UI Renderers
    function render() {
      const main = document.getElementById('main-content');
      if (state.activeTab === 'dashboard') {
        main.innerHTML = renderDashboard();
      } else if (state.activeTab === 'chambers') {
        main.innerHTML = renderChambers();
      } else if (state.activeTab === 'schedule') {
        main.innerHTML = renderSchedule();
      } else if (state.activeTab === 'simulator') {
        main.innerHTML = renderSimulator();
        updateSimulatorSVG();
      }
      attachEvents();
    }

    function renderDashboard() {
      const isWaiting = state.telemetry.trayOccupied;
      const isAlarm = state.telemetry.dispenseState === 'unclaimed_alarm';
      const nextDose = state.schedules.find(s => s.status === 'upcoming') || state.schedules[0];
      const nextMed = state.medicines.find(m => m.chamberId === nextDose?.chamberId);

      return \`
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          \${isWaiting ? \`
            <div class="alert-banner" style="\${isAlarm ? '' : 'border-color:#edd994; background:#fdfbe9; animation:none;'}">
              <div style="display:flex; align-items:center; gap:1rem;">
                <div style="width:52px; height:52px; border-radius:1.25rem; background:\${isAlarm ? '#f0a89e' : '#f6e7a9'}; display:flex; align-items:center; justify-content:center; color:\${isAlarm ? '#551913' : '#483c16'};">
                  \${isAlarm ?
                    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>' :
                    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>'
                  }
                </div>
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <strong style="font-size:1.15rem; color:#2f383b;">
                      \${isAlarm ? 'PILL UNCLAIMED — BUZZER ACTIVE' : 'Dose Ready in Pickup Tray'}
                    </strong>
                    <span class="clay-badge \${isAlarm ? 'badge-danger' : 'badge-butter'}">
                      \${isAlarm ? 'Escalating Buzzer Alarm' : 'Unclaimed in <span id="unclaimed-timer-text">' + state.telemetry.unclaimedTimerSeconds + 's</span>'}
                    </span>
                  </div>
                  <p style="font-size:0.875rem; color:#5f6d72; margin-top:0.25rem;">
                    \${isAlarm ? 'Patient has not picked up medication! Piezo buzzer alarm is sounding.' : 'Pill dropped via optical beam verification. Take dose to clear.'}
                  </p>
                </div>
              </div>
              <button class="clay-btn \${isAlarm ? 'btn-danger' : 'btn-mint'}" id="ack-pickup-btn" style="min-width:240px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                I Have Taken My Pill
              </button>
            </div>
          \` : ''}

          <!-- Upcoming Dose Hero Card -->
          <div class="surface-clay hero-card">
            <div>
              <span class="clay-badge badge-mint" style="margin-bottom:0.5rem;">NEXT SCHEDULED DOSE</span>
              <h2 style="font-size:1.75rem; font-weight:900; letter-spacing:-0.02em; margin-top:0.25rem;">
                \${nextMed ? nextMed.name : 'All doses taken'} <span style="font-size:1.25rem; font-weight:600; color:#5f6d72;">\${nextMed ? nextMed.dosage : ''}</span>
              </h2>
              <p style="font-size:0.875rem; color:#5f6d72; font-weight:600; margin-top:0.25rem;">
                \${nextDose ? nextDose.label + ' • ' + nextDose.time : ''} • Chamber #\${nextMed ? nextMed.chamberId : 1}
              </p>
            </div>
            \${nextMed ? \`
              <button class="clay-btn btn-mint" id="dispense-next-btn" style="min-height:56px; padding:0 2rem; font-size:1.05rem;" \${isWaiting ? 'disabled' : ''}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                Dispense Next Dose (1 Pill)
              </button>
            \` : ''}
          </div>

          <!-- 4 Chamber Inventory -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h3 style="font-weight:900; font-size:1.15rem;">Chamber Inventory (4 Singulation Hoppers)</h3>
              <span style="font-size:0.75rem; font-weight:700; color:#5f6d72;">Carousel Singulation • 1 Pill at a time</span>
            </div>
            <div class="grid-4">
              \${state.medicines.map(m => \`
                <div class="surface-clay" style="padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                      <div style="width:36px; height:36px; border-radius:0.85rem; background:\${m.colorHex}; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.95rem; box-shadow:inset 0 2px 0 rgba(255,255,255,0.7);">
                        \${m.chamberId}
                      </div>
                      <div>
                        <div style="font-weight:800; font-size:1rem; line-height:1.2;">\${m.name}</div>
                        <div style="font-size:0.75rem; font-weight:700; color:#5f6d72;">\${m.dosage}</div>
                      </div>
                    </div>
                    <span class="clay-badge badge-quiet">\${m.type.replace('_',' ')}</span>
                  </div>

                  <div style="background:#f7f4ed; padding:0.6rem; border-radius:1rem; border:1px solid #ebdccb;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:#5f6d72; margin-bottom:0.35rem;">
                      <span>Stock</span>
                      <span style="color:#2f383b;"><strong>\${m.inventoryCount}</strong> / \${m.maxCapacity}</span>
                    </div>
                    <div style="height:8px; background:#e5dcce; border-radius:9999px; overflow:hidden;">
                      <div style="height:100%; width:\${m.getFillPercentage()}%; background:\${m.colorHex}; border-radius:9999px;"></div>
                    </div>
                  </div>

                  <button class="clay-btn btn-quiet open-dispense-modal-btn" data-chamber="\${m.chamberId}" \${isWaiting ? 'disabled' : ''} style="min-height:42px; font-size:0.875rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                    Dispense 1 Pill
                  </button>
                </div>
              \`).join('')}
            </div>
          </div>
        </div>
      \`;
    }

    function renderChambers() {
      return \`
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div>
            <h2 style="font-size:1.5rem; font-weight:900;">Chamber & Medicine Manager</h2>
            <p style="font-size:0.875rem; color:#5f6d72; font-weight:600;">Polymorphic actuation profiles for round tablets, oblong capsules, and fragile scored medications.</p>
          </div>
          <div class="grid-2">
            \${state.medicines.map(m => {
              const p = m.getDispenseProfile();
              return \`
                <div class="surface-clay" style="padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                      <div style="width:44px; height:44px; border-radius:1rem; background:\${m.colorHex}; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.1rem; box-shadow:inset 0 2px 0 rgba(255,255,255,0.7);">
                        \${m.chamberId}
                      </div>
                      <div>
                        <h3 style="font-weight:900; font-size:1.2rem;">\${m.name}</h3>
                        <p style="font-size:0.8rem; font-weight:700; color:#5f6d72;">\${m.dosage} • Chamber #\${m.chamberId}</p>
                      </div>
                    </div>
                    <span class="clay-badge badge-mint">\${m.type.toUpperCase()}</span>
                  </div>

                  <div style="background:#f7f4ed; padding:0.75rem; border-radius:1rem; border:1px solid #ebdccb; font-size:0.8rem;">
                    <strong style="color:#5f6d72; display:block; margin-bottom:0.25rem;">PHYSICAL PROFILE</strong>
                    <span style="font-weight:600;">\${m.getPhysicalDescription()}</span>
                  </div>

                  <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; background:#f4efe6; padding:0.75rem; border-radius:1rem; font-size:0.75rem;">
                    <div><span style="color:#5f6d72;">Step Delay:</span> <strong>\${p.stepDelayUs}µs</strong></div>
                    <div><span style="color:#5f6d72;">Microsteps:</span> <strong>1/\${p.microsteps}</strong></div>
                    <div><span style="color:#5f6d72;">Gate Hold:</span> <strong>\${p.servoGateHoldMs}ms</strong></div>
                    <div><span style="color:#5f6d72;">Accel:</span> <strong>\${p.acceleration}</strong></div>
                    <div><span style="color:#5f6d72;">Jitter:</span> <strong>\${p.vibrationJitterSteps} steps</strong></div>
                    <div><span style="color:#5f6d72;">Jam Risk:</span> <strong>\${(m.getJamRiskFactor()*100).toFixed(0)}%</strong></div>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; font-weight:700;">
                    <span>Current Inventory</span>
                    <span><strong>\${m.inventoryCount}</strong> / \${m.maxCapacity} pills</span>
                  </div>

                  <div style="display:flex; gap:0.5rem;">
                    <button class="clay-btn btn-quiet refill-btn" data-chamber="\${m.chamberId}" data-amount="5" style="flex:1; min-height:40px; font-size:0.8rem;">+5 Refill</button>
                    <button class="clay-btn btn-quiet refill-btn" data-chamber="\${m.chamberId}" data-amount="10" style="flex:1; min-height:40px; font-size:0.8rem;">+10 Refill</button>
                    <button class="clay-btn btn-mint open-dispense-modal-btn" data-chamber="\${m.chamberId}" style="flex:1.5; min-height:40px; font-size:0.85rem;" \${state.telemetry.trayOccupied ? 'disabled' : ''}>Dispense 1</button>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    function renderSchedule() {
      return \`
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h2 style="font-size:1.5rem; font-weight:900;">Daily Dose Timeline</h2>
              <p style="font-size:0.875rem; color:#5f6d72; font-weight:600;">Dispenses 1 pill at a time on schedule; triggers unclaimed reminder if dose is not picked up.</p>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <span class="clay-badge badge-mint">Auto-Dose Engine: Active</span>
              <button class="clay-btn btn-butter" id="sim-due-btn" style="min-height:38px; font-size:0.8rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Test Auto-Dose
              </button>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            \${state.schedules.map(s => {
              const med = state.medicines.find(m => m.chamberId === s.chamberId);
              return \`
                <div class="surface-clay" style="padding:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                  <div style="display:flex; align-items:center; gap:1rem;">
                    <div style="background:#f4efe6; border:1px solid #ebdccb; border-radius:1rem; padding:0.5rem 0.85rem; text-align:center;">
                      <div style="font-weight:900; font-size:1.2rem;">\${s.time}</div>
                      <div style="font-size:0.65rem; font-weight:700; color:#5f6d72;">\${parseInt(s.time.split(':')[0]) < 12 ? 'AM' : 'PM'}</div>
                    </div>
                    <div>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <strong style="font-size:1.05rem;">\${s.label}</strong>
                        <span class="clay-badge \${s.status === 'taken' ? 'badge-mint' : s.status === 'unclaimed_alert' ? 'badge-danger' : s.status === 'dispensed' ? 'badge-butter' : 'badge-quiet'}">\${s.status === 'unclaimed_alert' ? '⚠️ UNCLAIMED ALARM' : s.status}</span>
                      </div>
                      <div style="font-size:0.8rem; color:#5f6d72; font-weight:600;">Chamber #\${s.chamberId} • \${med ? med.name + ' (' + med.dosage + ')' : ''}</div>
                    </div>
                  </div>
                  <div>
                    \${s.status === 'taken' ? \`
                      <span class="clay-badge badge-mint" style="padding:0.4rem 0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        Dose Retrieved
                      </span>
                    \` : s.status === 'dispensed' || s.status === 'unclaimed_alert' ? \`
                      <button class="clay-btn btn-mint" id="ack-pickup-btn" style="min-height:42px; font-size:0.85rem;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        Confirm Taken
                      </button>
                    \` : \`
                      <button class="clay-btn btn-mint open-dispense-modal-btn" data-chamber="\${s.chamberId}" style="min-height:42px; font-size:0.85rem;" \${state.telemetry.trayOccupied ? 'disabled' : ''}>
                        Dispense 1 Pill
                      </button>
                    \`}
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    function renderSimulator() {
      return \`
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h2 style="font-size:1.5rem; font-weight:900;">Virtual Hardware Diagnostic Simulator</h2>
              <p style="font-size:0.875rem; color:#5f6d72; font-weight:600;">Interactive SVG stepper rotor, servo trapdoor, IR beam break, and piezo tone generator.</p>
            </div>
            <span class="clay-badge \${state.telemetry.jamDetected ? 'badge-danger' : 'badge-mint'}">
              \${state.telemetry.jamDetected ? '⚠️ StallGuard Jammed' : '✓ Hardware Nominal (12.1V)'}
            </span>
          </div>

          <div class="grid-2">
            <!-- Left: SVG Schematic -->
            <div class="surface-clay" style="padding:1.5rem; display:flex; flex-direction:column; align-items:center;">
              <h3 style="font-size:1rem; font-weight:900; align-self:flex-start; margin-bottom:0.75rem;">Carousel Rotor & Chute Cross-Section</h3>
              <div class="rotor-container" style="width:100%;">
                <svg viewBox="0 0 400 400" class="rotor-svg" id="simulator-svg">
                  <!-- Outer Housing -->
                  <circle cx="200" cy="180" r="140" fill="#f0ebe0" stroke="#d8cfbe" stroke-width="4" />
                  <circle cx="200" cy="180" r="125" fill="#fcf9f2" stroke="#ebdccb" stroke-width="2" />
                  <!-- Fixed Chute Exit Marker -->
                  <path d="M 175 305 L 225 305 L 210 330 L 190 330 Z" fill="#7dcbbe" stroke="#5cb8a8" stroke-width="2" />
                  <text x="200" y="322" text-anchor="middle" font-size="10" font-weight="bold" fill="#1b3d36">CHUTE EXIT</text>

                  <!-- Stepper Rotor Group -->
                  <g id="svg-rotor-group" transform="rotate(\${state.telemetry.stepperAngleDeg}, 200, 180)">
                    <circle cx="200" cy="180" r="110" fill="#ffffff" stroke="#ded4c3" stroke-width="3" />
                    <!-- 8 Slots -->
                    <circle cx="253" cy="127" r="16" fill="#7dcbbe" stroke="#fff" stroke-width="2" /><text x="253" y="131" text-anchor="middle" font-size="11" font-weight="900">C1</text>
                    <circle cx="253" cy="233" r="16" fill="#f0b7a0" stroke="#fff" stroke-width="2" /><text x="253" y="237" text-anchor="middle" font-size="11" font-weight="900">C2</text>
                    <circle cx="147" cy="233" r="16" fill="#f6e7a9" stroke="#fff" stroke-width="2" /><text x="147" y="237" text-anchor="middle" font-size="11" font-weight="900">C3</text>
                    <circle cx="147" cy="127" r="16" fill="#8ec5e8" stroke="#fff" stroke-width="2" /><text x="147" y="131" text-anchor="middle" font-size="11" font-weight="900">C4</text>
                    <!-- Center Motor Shaft -->
                    <circle cx="200" cy="180" r="24" fill="#5f6d72" stroke="#2f383b" stroke-width="3" />
                    <line x1="200" y1="180" x2="200" y2="162" stroke="#fff" stroke-width="3" stroke-linecap="round" />
                  </g>

                  <!-- Angle Readout -->
                  <rect x="155" y="15" width="90" height="26" rx="13" fill="#ffffff" stroke="#ebdccb" stroke-width="1.5" />
                  <text id="svg-angle-text" x="200" y="32" text-anchor="middle" font-size="12" font-weight="800">\${state.telemetry.stepperAngleDeg}° ROTOR</text>

                  <!-- Lower Chute & Servo Gate -->
                  <line x1="170" y1="315" x2="170" y2="385" stroke="#88969b" stroke-width="3" />
                  <line x1="230" y1="315" x2="230" y2="385" stroke="#88969b" stroke-width="3" />
                  <!-- Servo Flap -->
                  <g id="svg-servo-group" transform="translate(170, 345) rotate(\${state.telemetry.servoAngleDeg})">
                    <line x1="0" y1="0" x2="58" y2="0" stroke="#d4786a" stroke-width="5" stroke-linecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#2f383b" />
                  </g>

                  <!-- IR Beam Break -->
                  <rect x="155" y="360" width="12" height="10" rx="3" fill="#2f383b" />
                  <rect x="233" y="360" width="12" height="10" rx="3" fill="#2f383b" />
                  <line id="svg-ir-beam" x1="170" y1="365" x2="230" y2="365" stroke="\${state.telemetry.opticalBeamBroken ? '#e04e3a' : '#7dcbbe'}" stroke-width="\${state.telemetry.opticalBeamBroken ? '4' : '2'}" />

                  <!-- Pill in Tray -->
                  <g id="svg-pill-tray" style="display:\${state.telemetry.trayOccupied ? 'block' : 'none'};">
                    <ellipse cx="200" cy="388" rx="14" ry="7" fill="#7dcbbe" stroke="#4fa897" stroke-width="2" />
                  </g>
                </svg>
              </div>
            </div>

            <!-- Right: Manual Controls & Telemetry -->
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div class="surface-clay" style="padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
                <h3 style="font-size:1rem; font-weight:900;">Manual Actuator Testing</h3>

                <div>
                  <span style="font-size:0.75rem; font-weight:700; color:#5f6d72;">TMC2209 Stepper Jog</span>
                  <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.25rem;">
                    <button class="clay-btn btn-quiet" id="jog-m45" style="min-height:38px; font-size:0.8rem;">-45° Step</button>
                    <button class="clay-btn btn-quiet" id="jog-p45" style="min-height:38px; font-size:0.8rem;">+45° Step</button>
                    <button class="clay-btn btn-quiet" id="jog-home" style="min-height:38px; font-size:0.8rem;">Home (0°)</button>
                  </div>
                </div>

                <div>
                  <span style="font-size:0.75rem; font-weight:700; color:#5f6d72;">MG90S Servo Trapdoor</span>
                  <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem; margin-top:0.25rem;">
                    <button class="clay-btn btn-quiet" id="servo-open" style="min-height:38px; font-size:0.8rem;">Open (90°)</button>
                    <button class="clay-btn btn-quiet" id="servo-close" style="min-height:38px; font-size:0.8rem;">Close (0°)</button>
                  </div>
                </div>

                <div>
                  <span style="font-size:0.75rem; font-weight:700; color:#5f6d72;">Piezo Buzzer & Sensors</span>
                  <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.25rem;">
                    <button class="clay-btn btn-butter" id="test-chime" style="min-height:38px; font-size:0.8rem;">Chime</button>
                    <button class="clay-btn btn-danger" id="test-alarm" style="min-height:38px; font-size:0.8rem;">Alarm</button>
                    <button class="clay-btn btn-quiet" id="test-stop" style="min-height:38px; font-size:0.8rem;">Stop</button>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.5rem; margin-top:0.25rem; padding-top:0.5rem; border-top:1px solid #ebdccb;">
                  <button class="clay-btn btn-sky" id="test-drop" style="min-height:38px; font-size:0.8rem;">Test IR Drop</button>
                  <button class="clay-btn \${state.telemetry.jamDetected ? 'btn-danger' : 'btn-quiet'}" id="toggle-jam" style="min-height:38px; font-size:0.8rem;">
                    \${state.telemetry.jamDetected ? 'Clear Jam' : 'Simulate Jam'}
                  </button>
                </div>
              </div>

              <!-- Console Log -->
              <div class="surface-clay" style="padding:1rem; flex:1; display:flex; flex-direction:column; gap:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.75rem; text-transform:uppercase; color:#5f6d72;">ESP32 Serial / Telemetry Log</strong>
                  <button id="clear-logs-btn" style="border:none; background:transparent; font-size:0.75rem; font-weight:700; color:#5f6d72; cursor:pointer;">Clear</button>
                </div>
                <div class="telemetry-log" id="telemetry-log-box"></div>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    function updateSimulatorSVG() {
      const rotor = document.getElementById('svg-rotor-group');
      const angleText = document.getElementById('svg-angle-text');
      const servo = document.getElementById('svg-servo-group');
      const irBeam = document.getElementById('svg-ir-beam');
      const pillTray = document.getElementById('svg-pill-tray');

      if (rotor) rotor.setAttribute('transform', \`rotate(\${state.telemetry.stepperAngleDeg}, 200, 180)\`);
      if (angleText) angleText.textContent = \`\${state.telemetry.stepperAngleDeg}° ROTOR\`;
      if (servo) servo.setAttribute('transform', \`translate(170, 345) rotate(\${state.telemetry.servoAngleDeg})\`);
      if (irBeam) {
        irBeam.setAttribute('stroke', state.telemetry.opticalBeamBroken ? '#e04e3a' : '#7dcbbe');
        irBeam.setAttribute('stroke-width', state.telemetry.opticalBeamBroken ? '4' : '2');
      }
      if (pillTray) {
        pillTray.style.display = state.telemetry.trayOccupied ? 'block' : 'none';
      }
    }

    function renderLogs() {
      const box = document.getElementById('telemetry-log-box');
      if (!box) return;
      box.innerHTML = state.logs.map(l => {
        const color = l.level === 'error' ? '#e04e3a' : l.level === 'success' ? '#2e7d32' : '#5f6d72';
        return \`<div style="padding:0.15rem 0; border-bottom:1px solid #ebdccb40;"><span style="color:#88969b;">[\${l.time}]</span> <strong style="color:\${color};">[\${l.src}]</strong> <span>\${l.msg}</span></div>\`;
      }).join('');
    }

    function attachEvents() {
      // Tab switcher
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.addEventListener('click', (e) => {
          document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
          b.classList.add('active');
          state.activeTab = b.dataset.tab;
          render();
        });
      });

      // Mute Toggle
      const muteBtn = document.getElementById('mute-btn');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          audioMgr.muted = !audioMgr.muted;
          const textEl = document.getElementById('mute-text');
          if (textEl) textEl.innerText = audioMgr.muted ? 'Buzzer Muted' : 'Buzzer Active';
        });
      }

      // Open Modal Buttons
      document.querySelectorAll('.open-dispense-modal-btn').forEach(b => {
        b.addEventListener('click', () => {
          const ch = Number(b.dataset.chamber);
          openDispenseModal(ch);
        });
      });

      // Refill Buttons
      document.querySelectorAll('.refill-btn').forEach(b => {
        b.addEventListener('click', () => {
          const ch = Number(b.dataset.chamber);
          const amt = Number(b.dataset.amount);
          const med = state.medicines.find(m => m.chamberId === ch);
          if (med) {
            med.refill(amt);
            render();
          }
        });
      });

      // Dispense Next Button
      const dispNext = document.getElementById('dispense-next-btn');
      if (dispNext) {
        dispNext.addEventListener('click', () => {
          const nextDose = state.schedules.find(s => s.status === 'upcoming') || state.schedules[0];
          if (nextDose) openDispenseModal(nextDose.chamberId);
        });
      }

      // Simulate Scheduled Due Dose Auto-Trigger
      const simDueBtn = document.getElementById('sim-due-btn');
      if (simDueBtn) {
        simDueBtn.addEventListener('click', () => {
          const upcoming = state.schedules.find(s => s.status === 'upcoming');
          if (upcoming) {
            addLog('SCHEDULER', \`Scheduled dose '\${upcoming.label}' time reached! Auto-dispensing 1 pill...\`, 'info');
            dispensePill(upcoming.chamberId);
          } else {
            addLog('SCHEDULER', 'No upcoming dose found in schedule.', 'warn');
          }
        });
      }

      // Pickup Acknowledge
      const ackBtn = document.getElementById('ack-pickup-btn');
      if (ackBtn) ackBtn.addEventListener('click', acknowledgePickup);

      // Simulator Manual Controls
      const jm45 = document.getElementById('jog-m45');
      if (jm45) jm45.addEventListener('click', () => reverseStepper(45));
      const jp45 = document.getElementById('jog-p45');
      if (jp45) jp45.addEventListener('click', () => rotateStepper((state.telemetry.stepperAngleDeg + 45) % 360));
      const jhome = document.getElementById('jog-home');
      if (jhome) jhome.addEventListener('click', () => rotateStepper(0));

      const sOpen = document.getElementById('servo-open');
      if (sOpen) sOpen.addEventListener('click', () => setServo(90));
      const sClose = document.getElementById('servo-close');
      if (sClose) sClose.addEventListener('click', () => setServo(0));

      const tChime = document.getElementById('test-chime');
      if (tChime) tChime.addEventListener('click', () => audioMgr.playChime());
      const tAlarm = document.getElementById('test-alarm');
      if (tAlarm) tAlarm.addEventListener('click', () => audioMgr.startUnclaimedAlarm());
      const tStop = document.getElementById('test-stop');
      if (tStop) tStop.addEventListener('click', () => audioMgr.stop());

      const tDrop = document.getElementById('test-drop');
      if (tDrop) tDrop.addEventListener('click', () => {
        state.telemetry.opticalBeamBroken = true;
        updateSimulatorSVG();
        audioMgr.playChime();
        addLog('IR_BEAM', 'Manual drop test triggered. Beam break verified.', 'success');
        setTimeout(() => {
          state.telemetry.opticalBeamBroken = false;
          updateSimulatorSVG();
        }, 350);
      });

      const tJam = document.getElementById('toggle-jam');
      if (tJam) tJam.addEventListener('click', () => {
        state.telemetry.jamDetected = !state.telemetry.jamDetected;
        addLog('TMC2209', state.telemetry.jamDetected ? 'StallGuard threshold trip simulated!' : 'Jam cleared.', state.telemetry.jamDetected ? 'warn' : 'info');
        render();
      });

      const clrLogs = document.getElementById('clear-logs-btn');
      if (clrLogs) clrLogs.addEventListener('click', () => {
        state.logs = [];
        renderLogs();
      });

      if (state.activeTab === 'simulator') renderLogs();
    }

    // Initial Mount
    render();
  </script>
</body>
</html>
`;

// Write to dist/index.html
fs.writeFileSync(path.resolve(distDir, 'index.html'), productionHtml, 'utf8');
console.log('✅ Generated production bundle: dist/index.html (' + productionHtml.length + ' bytes)');

// Write to firmware/data/index.html (for LittleFS filesystem upload to ESP32-S3)
fs.writeFileSync(path.resolve(firmwareDataDir, 'index.html'), productionHtml, 'utf8');
console.log('✅ Synced LittleFS static asset: firmware/data/index.html');

console.log('🎉 Build completed successfully!');
