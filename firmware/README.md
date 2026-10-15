# Smart Medicine Dispenser - Firmware Architecture & Driver Selection

**Electrical Engineering Senior Design Project**  
*Microcontroller: Espressif ESP32-S3 (Dual-Core Xtensa LX7 @ 240MHz, 16MB Flash, 8MB PSRAM)*

---

## 1. Hardware Driver & Controller Selection Rationale

### Core Problem
The automated dispenser must:
1. Drive a **precision stepper motor** to index a carousel or auger for single-pill singulation.
2. Drive a **micro servo motor** to actuate a security chute trapdoor.
3. Drive an **audio piezo buzzer** to sound dose reminders and escalating unclaimed pill alarms.
4. Run an interactive **touchscreen GUI / Web interface** and background networking process simultaneously on the same board without motor stutter or UI lag.

---

### Comparison of Motor Drivers

| Driver | Stepping Noise | Stall / Jam Detection | Heat Dissipation | Control Interface | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trinamic TMC2209** | **Virtually Silent** (StealthChop2™) | **Hardware Sensorless** (StallGuard4™) | **Low** (CoolStep™ + 0.17Ω RDSon) | STEP/DIR + Single-Wire UART | **SELECTED (Best for Medical)** |
| **TI DRV8825** | High audible whine | None (requires physical microswitch) | High (requires large heatsink) | STEP/DIR only | Sub-optimal |
| **Allegro A4988** | Loud ticking/whistle | None | High (hot during hold) | STEP/DIR only | Poor bedside UX |
| **L298N Dual H-Bridge**| Extreme noise | None | Massive heat drop (~2V drop) | 4 GPIOs, inefficient | Obsolete |

### Why the Trinamic TMC2209 was Chosen
1. **StealthChop2™ (Silent Operation)**: Essential for a bedside medical device. Traditional drivers (A4988/DRV8825) emit a high-frequency whistle and mechanical buzz that can wake sleeping patients or create anxiety. The TMC2209 is virtually noiseless.
2. **StallGuard4™ (Sensorless Jam Detection)**: If an oblong capsule or odd-shaped pill wedges against the chamber wall, the motor load spikes. StallGuard4 senses the back-EMF change and fires an interrupt in microseconds, cutting motor current and initiating an automated reverse un-jam cycle before crushing the pill or overheating the motor.
3. **Single-Wire UART Configuration**: Motor run current (e.g. 600mA), hold current (e.g. 100mA), and microstep resolution (1/16 to 1/64) are configured dynamically by the ESP32 in software—no screwdriver potentiometer adjustments required.

---

### Servo & Buzzer Driver Architecture
- **Servo Motor (MG90S Micro Metal-Gear)**: Does **not** require an external driver IC. It is actuated directly by the ESP32-S3 using the hardware **LEDC (LED Control PWM)** peripheral on GPIO 9 at 50Hz (1.0ms = 0° closed, 2.0ms = 90° open).
- **Piezo Buzzer**: Controlled directly by a dedicated ESP32-S3 **LEDC Channel** on GPIO 10. Hardware timer generation produces resonant square-wave audio frequencies (2730 Hz resonant peak, 880Hz pleasant chimes, or melodic sequences) with zero CPU overhead.

---

## 2. Dual-Core FreeRTOS Task Allocation

To guarantee that the web GUI and background Wi-Fi processes never cause stepper step loss or timing jitter:

```
+--------------------------------------------------------------------------------+
|                                ESP32-S3 DUAL-CORE                              |
+---------------------------------------+----------------------------------------+
|       CORE 0: Real-Time Hardware       |      CORE 1: Connectivity & GUI        |
+---------------------------------------+----------------------------------------+
| - FreeRTOS Task: vHardwareTask (Prio 5)| - FreeRTOS Task: vNetworkTask (Prio 2) |
| - TMC2209 STEP / DIR pulse timing     | - ESPAsyncWebServer (Port 80)          |
| - MG90S Servo PWM positioning (50Hz)  | - LittleFS static asset file serving   |
| - Piezo Buzzer tone synthesis (LEDC)  | - WebSocket telemetry stream (/ws)     |
| - Optical Beam-Break ISR (FALLING)    | - REST API endpoints (/api/dispense)   |
| - Unclaimed Pill reminder watchdog    | - SoftAP Wi-Fi beacon (192.168.4.1)    |
+---------------------------------------+----------------------------------------+
                                     |
                          [ FreeRTOS Queue & Mutex ]
                                     |
               Core 1 enqueues dispense commands to Core 0
               Core 0 posts 20Hz telemetry snapshots to Core 1
```

---

## 3. Unclaimed Pill Reminder State Machine

The dispenser is designed so that pills are dispensed **1 at a time**, and if the patient does not pick up the dispensed dose, the device escalates:

```
[ IDLE ]
   │
   ▼ (Dispense Triggered)
[ INDEXING CAROUSEL ]  ───(StallGuard Jam?)──► [ JAM RECOVERY: Reverse 15° ]
   │
   ▼
[ MICRO-VIBRATION JITTER ] (For oblong capsules)
   │
   ▼
[ OPEN SAFETY GATE (90°) ]
   │
   ▼
[ OPTICAL BEAM BREAK ] ──► IR Beam confirms pill drop into tray
   │
   ▼
[ CLOSE GATE (0°) ]
   │
   ▼
[ WAITING FOR PICKUP ] ──► Arms Unclaimed Countdown Timer (60s in production)
   │
   ├──────────────────────────────┐
   │ (Microswitch in tray closed) │ (Timer expires; pill remains in tray)
   ▼                              ▼
[ PICKUP CONFIRMED ]      [ STATE_UNCLAIMED_ALARM ]
- Tray cleared            - Escalating 2730Hz Piezo Buzzer alarm bursts
- Dose marked 'Taken'     - Flashing Amber/Red Claymorphic alert banner
- Buzzer silenced         - Continues until tray switch or UI acknowledge
```

---

## 4. GPIO Pin Assignments

| Subsystem | Signal Name | ESP32-S3 GPIO | Notes |
| :--- | :--- | :--- | :--- |
| **TMC2209** | STEP | GPIO 4 | Hardware step pulses |
| **TMC2209** | DIR | GPIO 5 | Direction (HIGH = CW, LOW = CCW) |
| **TMC2209** | EN | GPIO 6 | Active-LOW driver enable |
| **TMC2209** | UART_TX | GPIO 7 | Single-wire UART communication |
| **TMC2209** | UART_RX | GPIO 8 | UART receive |
| **MG90S Servo** | PWM | GPIO 9 | LEDC Channel 0 (50Hz, 1ms - 2ms) |
| **Piezo Buzzer**| PWM | GPIO 10 | LEDC Channel 1 (Audio tones) |
| **IR Beam Sensor**| SENSE | GPIO 11 | Optical drop interrupter (Active-LOW, ISR) |
| **Tray Switch** | SENSE | GPIO 12 | Physical pickup switch (Active-LOW pullup) |
| **ADC Sensor** | VMOT_SENSE | GPIO 1 | 12V motor supply voltage divider |

---

## 5. Power Supply Architecture

1. **12V DC Input (2A Wall Adapter)**:
   - Powers the NEMA 17 Stepper motor through TMC2209 `VMOT` (filtered by 100µF low-ESR electrolytic capacitor).
2. **5V Rail (MP1584 or LM2596 Buck Regulator)**:
   - Powers the MG90S metal-gear servo.
   - Powers the 5V active/passive piezo buzzer.
3. **3.3V Rail (AMS1117-3.3 LDO on ESP32 Dev Board)**:
   - Powers ESP32-S3 MCU, TMC2209 `VIO` logic rail, and IR optical sensor.

---

## 6. How to Build & Flash Firmware

1. Install [PlatformIO IDE](https://platformio.org/) or CLI.
2. Build firmware binary:
   ```bash
   pio run
   ```
3. Upload LittleFS filesystem (containing the compiled React Claymorphic UI):
   ```bash
   pio run --target uploadfs
   ```
4. Flash firmware onto the ESP32-S3:
   ```bash
   pio run --target upload
   ```
5. Connect your touchscreen or phone to Wi-Fi SSID **`SmartDispenser_AP`** (Password: `seniordesign2026`) and navigate to `http://192.168.4.1/`.
