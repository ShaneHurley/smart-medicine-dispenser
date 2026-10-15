#pragma once

#include <Arduino.h>

/**
 * =========================================================================
 * SMART MEDICINE DISPENSER - SYSTEM HARDWARE CONFIGURATION
 * EE Senior Design Project - ESP32-S3 Microcontroller
 * =========================================================================
 */

// Dual-Core Task Allocation
#define HARDWARE_TASK_CORE   0  // Real-time Motor, Servo, Buzzer & Sensors
#define NETWORK_TASK_CORE    1  // ESPAsyncWebServer, WebSockets & LittleFS

// FreeRTOS Task Priorities
#define PRIORITY_HARDWARE_TASK   5  // High real-time priority
#define PRIORITY_NETWORK_TASK    2  // Standard background network priority

// =========================================================================
// GPIO PIN ASSIGNMENTS
// =========================================================================

// Trinamic TMC2209 SilentStepStick (Stepper Motor Driver)
#define PIN_TMC_STEP         4   // Hardware Step pulse pin
#define PIN_TMC_DIR          5   // Direction control pin
#define PIN_TMC_EN           6   // Active-low driver enable
#define PIN_TMC_UART_TX      7   // ESP32 TX -> TMC2209 Single-wire UART
#define PIN_TMC_UART_RX      8   // ESP32 RX <- TMC2209 Single-wire UART
#define TMC_R_SENSE          0.11f  // Current sense resistor (Ohms)
#define TMC_DRIVER_ADDRESS   0b00   // MS1=GND, MS2=GND
#define TMC_STALL_THRESHOLD  64     // StallGuard4 mechanical jam threshold (0-255)

// Micro Metal-Gear 9g Servo (MG90S Trapdoor Chute Gate)
#define PIN_SERVO_PWM        9   // ESP32 PWM pin (LEDC Channel 0, 50Hz)
#define SERVO_LEDC_CHANNEL   0
#define SERVO_GATE_CLOSED    0   // Closed safety position (degrees)
#define SERVO_GATE_OPEN      90  // Fully open drop position (degrees)

// Piezo Buzzer (Audio Reminders & Unclaimed Alarms)
#define PIN_PIEZO_BUZZER     10  // ESP32 LEDC PWM output
#define BUZZER_LEDC_CHANNEL  1
#define BUZZER_RESONANT_FREQ 2730 // Resonant frequency in Hz for loud alert

// Optical Drop & Pickup Sensors
#define PIN_IR_BEAM_BREAK    11  // Optical beam-break phototransistor (Active-Low)
#define PIN_TRAY_SWITCH      12  // Mechanical microswitch or touch switch in tray (Active-Low)

// Power & Health Monitoring ADC Pins
#define PIN_ADC_MOTOR_V      1   // Voltage divider for 12V motor supply rail
#define MOTOR_V_DIVIDER_RATIO 4.03f // (10k + 3.3k) / 3.3k

// =========================================================================
// DATA STRUCTURES & PROTOCOLS
// =========================================================================

enum DispenserState_t {
    STATE_IDLE,
    STATE_INDEXING_MOTOR,
    STATE_VIBRATING,
    STATE_OPENING_GATE,
    STATE_VERIFYING_DROP,
    STATE_CLOSING_GATE,
    STATE_WAITING_PICKUP,
    STATE_UNCLAIMED_ALARM,
    STATE_JAMMED,
    STATE_ERROR
};

enum BuzzerPattern_t {
    BUZZER_STOP,
    BUZZER_BEEP,
    BUZZER_CONFIRM,
    BUZZER_REMINDER,
    BUZZER_UNCLAIMED_ALARM,
    BUZZER_JAM_ERROR
};

struct DispenseProfile_t {
    uint32_t stepDelayUs;         // Delay between microsteps (feed speed)
    uint16_t microsteps;          // TMC2209 microstep divisor (16, 32, 64)
    uint32_t acceleration;        // Steps / s^2 ramp
    uint32_t servoGateHoldMs;     // Gate hold open duration for pill to clear
    uint8_t  vibrationJitterSteps;// Jitter oscillations for capsule tumbling prevention
    uint8_t  reverseBacklashSteps;// Reverse steps to clear mechanical backlash
};

struct DispenseCommand_t {
    uint8_t chamberId;            // 1 to 4
    DispenseProfile_t profile;    // Polymorphic actuation parameters
    bool isDiagnosticTest;        // Diagnostic vs normal dose
};

struct HardwareTelemetry_t {
    uint32_t timestampMs;
    DispenserState_t state;
    float stepperAngleDeg;
    bool stepperRunning;
    uint8_t servoAngleDeg;
    bool opticalBeamBroken;
    bool trayOccupied;
    uint16_t unclaimedSecondsRemaining;
    bool buzzerActive;
    BuzzerPattern_t buzzerPattern;
    float motorRailVoltage;
    float internalTempC;
    uint8_t activeChamber;
    bool jamDetected;
};
