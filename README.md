# Smart Medicine Dispenser — EE Senior Design

An automated, accessible Smart Medicine Dispenser powered by an **ESP32-S3 microcontroller** and an tactile, multi-generational **Claymorphic Touchscreen GUI**.

Designed for senior citizens and multi-generational patients, the device dispenses **1 pill at a time** using an indexing carousel, verifies drop delivery via an optical IR beam-break sensor, and provides escalating audio/visual alerts if a dispensed dose is not retrieved by the patient.

---

## 📸 Key Features & System Architecture

### 1. Tactile Claymorphic GUI System
- **Accessible Multi-Generational UI**:
  - Minimum touch target sizing $\ge 48\times 48\text{px}$ for patients with tremors or arthritis.
  - High-contrast typography with soft dark-grey `#2f383b` ink text on warm clay surfaces (`#fffdf8`).
  - Tactile specular highlights `inset 0 2px 0 rgba(255, 255, 255, 0.65)` with realistic physical button depressions (`translateY(2px)`).
  - Soothing pastel palette: **Pastel Mint** (`#7dcbbe`), **Peach** (`#f0b7a0`), **Sky** (`#8ec5e8`), and **Butter** (`#f6e7a9`).
- **Interactive Views**:
  - **Dashboard**: Next dose digital countdown clock, 4 chamber stock gauges, quick 1-pill dispense action, and an escalating **Unclaimed Pill Alert Banner** with audible buzzer beeps.
  - **Chamber Manager**: Inspects polymorphic medicine profiles (feed rate, microsteps, gate hold time, vibration jitter pulses, and jam risk) and provides stock refilling controls.
  - **Daily Schedule Timeline**: Visual chronological wheel/list for Morning, Lunch, Dinner, and Bedtime doses with taken/dispensed/unclaimed status tracking.
  - **Virtual Hardware Diagnostic Simulator**: Real-time interactive SVG animation showing the 8-slot stepper carousel rotor spinning, the servo trapdoor opening to 90°, the IR optical beam pulsing on drop, and synthesized piezo audio buzzer output.

---

### 2. Polymorphic Medicine Domain Model
Different pill shapes experience vastly different mechanics in hoppers. The polymorphic domain model calculates specialized dispense profiles for each medication:

```ts
// Base Class
abstract class Medicine {
  abstract getDispenseProfile(): DispenseProfile;
  abstract getJamRiskFactor(): number;
  abstract getPhysicalDescription(): string;
}

// Derived Polymorphic Classes:
// 1. RoundTabletMedicine: Fast 1200µs feed rate, 1/16 microstepping, 0 jitter pulses, low 3% jam risk.
// 2. OblongCapsuleMedicine: Slower 1800µs feed rate, 1/32 microstepping, 4 micro-vibration jitter pulses, extended 1400ms gate hold to prevent capsule tail pinching.
// 3. FragileScoredMedicine: Gentle 2400µs feed rate, 1/64 microstepping, soft 300 s/s² S-curve acceleration, zero reverse backlash snapping to prevent chipping.
```

---

### 3. Hardware Controller & Driver Selection

**The Challenge**: Choose a driver setup that can actuate a stepper motor, a servo motor, and a piezo buzzer simultaneously while serving a responsive GUI and background network processes on the board.

**The Solution**:
- **Microcontroller**: **ESP32-S3 (Dual-Core Xtensa LX7 @ 240MHz, 16MB Flash, 8MB PSRAM)**.
  - **Core 0 (Real-Time Hardware Task `vHardwareTask`)**: Dedicated to motor step timing, servo PWM positioning, piezo tone generation, and optical sensor ISRs. Deterministic, zero jitter, unaffected by Wi-Fi or web traffic.
  - **Core 1 (Application & Connectivity Task `vNetworkTask`)**: Runs `ESPAsyncWebServer`, WebSocket telemetry broadcaster (`/ws`), and serves the compiled Claymorphic GUI directly from LittleFS.
- **Motor Driver**: **Trinamic TMC2209 (SilentStepStick)**:
  - *StealthChop2™*: Virtually silent stepping (crucial for bedside medical devices).
  - *StallGuard4™*: Hardware sensorless load detection that catches mechanical pill jams before crushing pills or overheating the motor.
  - *CoolStep™*: Reduces motor current by up to 75% when idling.
  - *Single-Wire UART*: Allows dynamic software tuning of motor run current and microstep divisor.
- **Servo Motor**: **MG90S Micro Metal-Gear Servo**:
  - Driven directly by ESP32-S3 **LEDC PWM Channel 0** (50Hz, 1ms - 2ms). No external driver chip required.
- **Piezo Buzzer**:
  - Driven directly by ESP32-S3 **LEDC PWM Channel 1** at 2730 Hz resonant frequency. Generates gentle bedside chimes and escalating unclaimed pill warning bursts.
- **Optical Drop Sensor**:
  - IR Beam Break Sensor with active-low hardware interrupt (`FALLING` edge) verifying pill passage through the gravity chute.

---

### 4. Unclaimed Pill Reminder State Machine

Dispenses **1 pill at a time**, and escalates if not retrieved:
1. `INDEXING_MOTOR` → Stepper indexes carousel to target chamber aperture.
2. `VIBRATING` → Micro-oscillations align oblong capsules.
3. `OPENING_GATE` → Servo trapdoor opens to 90°.
4. `VERIFYING_DROP` → IR beam break detects pill fall and sounds confirm chime.
5. `CLOSING_GATE` → Servo trapdoor closes to 0°.
6. `WAITING_PICKUP` → Arms countdown timer (15s in simulation / 60s in production).
7. If the patient does **not** retrieve the pill before the timer expires, the device enters `STATE_UNCLAIMED_ALARM`:
   - Escalating 2.7kHz piezo buzzer bursts sound repeatedly.
   - Screen flashes amber/red alert banner.
   - Continues until the tray microswitch or UI button confirms pickup.

---

## 🛠️ Verification & Test Suite

The repository includes a comprehensive automated test suite testing domain logic, hardware simulation, StallGuard jam recovery, and unclaimed reminder timers:

```bash
# Run automated test suite
npm test
```

### Test Coverage Summary:
- `src/tests/domain.test.ts`: Verifies polymorphic dispense profiles, acceleration ramps, gate hold windows, jitter steps, and inventory clamping for `RoundTabletMedicine`, `OblongCapsuleMedicine`, and `FragileScoredMedicine`.
- `src/tests/schedule.test.ts`: Verifies chronological schedule ordering, upcoming dose resolution, and dynamic schedule additions/removals.
- `src/tests/hardwareService.test.ts`: Verifies end-to-end single pill dispense sequence, optical beam break detection, tray occupation, pickup acknowledgment, and StallGuard jam detection.
- `src/tests/unclaimedLogic.test.ts`: Verifies countdown expiration, transition to `unclaimed_alarm`, active buzzer pattern triggering, and silencing upon pickup.

---

## 🚀 Quickstart Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Build production web bundle for LittleFS
npm run build

# 4. Preview application locally in browser
npm run preview
# Open http://localhost:4173/ in your browser
```

---

## 📁 Repository Directory Structure

```
seniordesign/
├── package.json               # Scripts for build, test, and preview
├── tsconfig.json              # TypeScript project configuration
├── vite.config.ts             # Vite bundler configuration
├── index.html                 # Main application template
├── scripts/
│   ├── build.js               # Generates production bundle & LittleFS static files
│   ├── preview.js             # Local preview HTTP server
│   └── test_runner.js         # Automated test runner
├── dist/
│   └── index.html             # Self-contained production build (zero CDN dependency)
├── src/
│   ├── index.css              # Claymorphic CSS system, tokens & touch accessibility
│   ├── main.tsx               # Application mount entrypoint
│   ├── App.tsx                # Main view controller
│   ├── domain/
│   │   ├── Medicine.ts              # Polymorphic base class
│   │   ├── RoundTabletMedicine.ts   # Round pill profile
│   │   ├── OblongCapsuleMedicine.ts # Capsule profile with jitter
│   │   ├── FragileScoredMedicine.ts # Scored pill gentle profile
│   │   ├── ScheduleManager.ts       # Daily dose scheduler
│   │   └── index.ts
│   ├── services/
│   │   ├── IHardwareService.ts      # Hardware interface & telemetry contracts
│   │   ├── MockHardwareService.ts   # In-browser stateful simulation
│   │   ├── RealHardwareService.ts   # ESP32 REST / WebSocket client
│   │   └── AudioManager.ts          # Web Audio API piezo buzzer synth
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ClayButton.tsx       # Tactile 48px touch button
│   │   │   ├── ClayCard.tsx         # Specular highlight surface card
│   │   │   ├── ClayInput.tsx        # Inset sunken input field
│   │   │   └── ClayBadge.tsx        # Status pill badge
│   │   ├── Header.tsx               # Navigation header & mode toggles
│   │   ├── DashboardView.tsx        # Next dose, chamber stock, unclaimed alert
│   │   ├── ChamberManagerView.tsx   # Polymorphic profile viewer & refills
│   │   ├── ScheduleView.tsx         # Daily timeline & schedule manager
│   │   ├── HardwareSimulatorView.tsx# Live SVG rotor, servo, beam & manual controls
│   │   └── QuickDispenseModal.tsx   # Single pill dispensing modal pipeline
│   └── tests/
│       ├── domain.test.ts           # Domain model tests
│       ├── schedule.test.ts         # Schedule tests
│       ├── hardwareService.test.ts  # Hardware simulation tests
│       └── unclaimedLogic.test.ts   # Unclaimed alarm countdown tests
└── firmware/
    ├── platformio.ini         # PlatformIO ESP32-S3 configuration
    ├── partitions.csv         # 16MB Flash partition table (7.8MB LittleFS)
    ├── README.md              # In-depth electrical schematic & driver selection guide
    ├── include/
    │   ├── config.h           # GPIO pin map, FreeRTOS priorities, data structs
    │   ├── dispenser_engine.h # Core 0 hardware task interface
    │   └── web_server.h       # Core 1 LittleFS and WebSocket server
    ├── src/
    │   ├── main.cpp           # FreeRTOS multi-core task pinning setup
    │   ├── dispenser_engine.cpp # Motor, servo, buzzer, and unclaimed state machine
    │   └── web_server.cpp     # REST endpoints & LittleFS static file server
    └── data/
        └── index.html         # LittleFS web UI bundle
```
