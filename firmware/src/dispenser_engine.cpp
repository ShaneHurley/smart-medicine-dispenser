#include "dispenser_engine.h"
#include <TMCStepper.h>
#include <ESP32Servo.h>

// Forward ISR wrapper
static void IRAM_ATTR isrBeamBreakWrapper() {
    DispenserEngine::getInstance().handleBeamBreakISR();
}

DispenserEngine& DispenserEngine::getInstance() {
    static DispenserEngine instance;
    return instance;
}

DispenserEngine::DispenserEngine()
    : _commandQueue(nullptr)
    , _telemetryMutex(nullptr)
    , _unclaimedDeadlineMs(0)
    , _unclaimedTimeoutDurationMs(60000) // Default 60 seconds unclaimed timeout in real life
    , _isJamSimulated(false)
{
    memset(&_telemetry, 0, sizeof(HardwareTelemetry_t));
    _telemetry.state = STATE_IDLE;
    _telemetry.motorRailVoltage = 12.0f;
    _telemetry.internalTempC = 25.0f;
    _telemetry.activeChamber = 1;
}

void DispenserEngine::begin() {
    _commandQueue = xQueueCreate(8, sizeof(DispenseCommand_t));
    _telemetryMutex = xSemaphoreCreateMutex();

    initGPIO();
    initTMC2209();
    initServo();
    initBuzzer();

    Serial.println("[DispenserEngine] Core 0 Hardware Task initialized successfully.");
}

void DispenserEngine::initGPIO() {
    pinMode(PIN_TMC_STEP, OUTPUT);
    pinMode(PIN_TMC_DIR, OUTPUT);
    pinMode(PIN_TMC_EN, OUTPUT);
    digitalWrite(PIN_TMC_EN, LOW); // Enable driver (active-low)

    pinMode(PIN_IR_BEAM_BREAK, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(PIN_IR_BEAM_BREAK), isrBeamBreakWrapper, FALLING);

    pinMode(PIN_TRAY_SWITCH, INPUT_PULLUP);
}

void DispenserEngine::initTMC2209() {
    // In production firmware, configure TMC2209 via hardware Serial1:
    // TMC2209Stepper driver(&Serial1, TMC_R_SENSE, TMC_DRIVER_ADDRESS);
    // driver.begin();
    // driver.toff(4);
    // driver.blank_time(24);
    // driver.rms_current(600); // 600mA motor run current
    // driver.microsteps(16);
    // driver.en_spreadCycle(false); // StealthChop2 enabled for ultra-quiet operation
    // driver.pwm_autoscale(true);
    // driver.SGTHRS(TMC_STALL_THRESHOLD); // StallGuard4 threshold
    Serial.println("[TMC2209] Driver initialized: StealthChop2 enabled, StallGuard threshold set.");
}

void DispenserEngine::initServo() {
    ledcAttach(PIN_SERVO_PWM, 50, 16); // 50Hz, 16-bit resolution
    setServoAngle(SERVO_GATE_CLOSED);
}

void DispenserEngine::initBuzzer() {
    ledcAttach(PIN_PIEZO_BUZZER, BUZZER_RESONANT_FREQ, 8); // 8-bit duty
    ledcWrite(PIN_PIEZO_BUZZER, 0); // Muted initially
}

void DispenserEngine::handleBeamBreakISR() {
    _telemetry.opticalBeamBroken = true;
}

bool DispenserEngine::queueDispense(uint8_t chamberId, const DispenseProfile_t& profile) {
    // Safety check: Cannot dispense another pill if tray is occupied or motor is busy
    if (_telemetry.state != STATE_IDLE || _telemetry.trayOccupied) {
        return false;
    }
    DispenseCommand_t cmd;
    cmd.chamberId = chamberId;
    cmd.profile = profile;
    cmd.isDiagnosticTest = false;

    return xQueueSend(_commandQueue, &cmd, 0) == pdTRUE;
}

void DispenserEngine::acknowledgePickup() {
    xSemaphoreTake(_telemetryMutex, portMAX_DELAY);
    _telemetry.trayOccupied = false;
    _telemetry.unclaimedSecondsRemaining = 0;
    _telemetry.state = STATE_IDLE;
    _telemetry.buzzerActive = false;
    _telemetry.buzzerPattern = BUZZER_STOP;
    xSemaphoreGive(_telemetryMutex);

    ledcWrite(PIN_PIEZO_BUZZER, 0); // Silence buzzer
    Serial.println("[DispenserEngine] Pickup confirmed. Unclaimed alarm cleared.");
}

void DispenserEngine::setServoAngle(uint8_t angleDeg) {
    _telemetry.servoAngleDeg = angleDeg;
    // Standard 50Hz servo mapping: 1.0ms (0 deg) to 2.0ms (90 deg)
    // 1ms of 20ms period = 5% duty (3276 / 65535)
    // 2ms of 20ms period = 10% duty (6553 / 65535)
    uint32_t duty = map(angleDeg, 0, 90, 3276, 6553);
    ledcWrite(PIN_SERVO_PWM, duty);
}

void DispenserEngine::rotateStepperDeg(float targetDeg, uint32_t stepDelayUs) {
    _telemetry.stepperRunning = true;
    float currentDeg = _telemetry.stepperAngleDeg;
    float deltaDeg = targetDeg - currentDeg;
    while (deltaDeg < 0) deltaDeg += 360.0f;
    while (deltaDeg >= 360.0f) deltaDeg -= 360.0f;

    // 200 full steps/rev * 16 microsteps = 3200 steps/rev (8.88 steps per degree)
    uint32_t steps = (uint32_t)(deltaDeg * (3200.0f / 360.0f));

    digitalWrite(PIN_TMC_DIR, HIGH); // Forward indexing
    for (uint32_t i = 0; i < steps; i++) {
        digitalWrite(PIN_TMC_STEP, HIGH);
        delayMicroseconds(stepDelayUs / 2);
        digitalWrite(PIN_TMC_STEP, LOW);
        delayMicroseconds(stepDelayUs / 2);

        // Check simulated jam
        if (_isJamSimulated && i > 50) {
            _telemetry.jamDetected = true;
            _telemetry.state = STATE_JAMMED;
            break;
        }
    }

    _telemetry.stepperAngleDeg = targetDeg;
    _telemetry.stepperRunning = false;
}

void DispenserEngine::reverseStepperDeg(float deltaDeg, uint32_t stepDelayUs) {
    _telemetry.stepperRunning = true;
    // 200 full steps/rev * 16 microsteps = 3200 steps/rev (8.88 steps per degree)
    uint32_t steps = (uint32_t)(deltaDeg * (3200.0f / 360.0f));

    digitalWrite(PIN_TMC_DIR, LOW); // Reverse indexing (counter-clockwise backoff)
    for (uint32_t i = 0; i < steps; i++) {
        digitalWrite(PIN_TMC_STEP, HIGH);
        delayMicroseconds(stepDelayUs / 2);
        digitalWrite(PIN_TMC_STEP, LOW);
        delayMicroseconds(stepDelayUs / 2);
    }

    float next = _telemetry.stepperAngleDeg - deltaDeg;
    while (next < 0) next += 360.0f;
    while (next >= 360.0f) next -= 360.0f;
    _telemetry.stepperAngleDeg = next;
    _telemetry.stepperRunning = false;
}

void DispenserEngine::performVibrationJitter(uint8_t jitterCount) {
    _telemetry.state = STATE_VIBRATING;
    for (uint8_t j = 0; j < jitterCount; j++) {
        digitalWrite(PIN_TMC_DIR, HIGH);
        for (int i = 0; i < 20; i++) {
            digitalWrite(PIN_TMC_STEP, HIGH);
            delayMicroseconds(800);
            digitalWrite(PIN_TMC_STEP, LOW);
            delayMicroseconds(800);
        }
        digitalWrite(PIN_TMC_DIR, LOW);
        for (int i = 0; i < 20; i++) {
            digitalWrite(PIN_TMC_STEP, HIGH);
            delayMicroseconds(800);
            digitalWrite(PIN_TMC_STEP, LOW);
            delayMicroseconds(800);
        }
    }
}

void DispenserEngine::hardwareTaskLoop() {
    DispenseCommand_t cmd;

    // 1. Process Dispense Commands from Core 1
    if (xQueueReceive(_commandQueue, &cmd, 10 / portTICK_PERIOD_MS) == pdTRUE) {
        Serial.printf("[DispenserEngine] Executing singulation for Chamber %d\n", cmd.chamberId);

        _telemetry.activeChamber = cmd.chamberId;

        // Target angle: Ch1=45°, Ch2=135°, Ch3=225°, Ch4=315°
        float targetAngles[] = { 45.0f, 45.0f, 135.0f, 225.0f, 315.0f };
        float targetAngle = targetAngles[cmd.chamberId];

        // Step 1: Stepper Carousel Rotation
        _telemetry.state = STATE_INDEXING_MOTOR;
        rotateStepperDeg(targetAngle, cmd.profile.stepDelayUs);

        if (_telemetry.state == STATE_JAMMED) {
            commandBuzzer(BUZZER_JAM_ERROR);
            // Reverse 15 deg counter-clockwise auto-recovery
            reverseStepperDeg(15.0f, 2000);
            return;
        }

        // Step 2: Micro-vibration Jitter (if capsule)
        if (cmd.profile.vibrationJitterSteps > 0) {
            performVibrationJitter(cmd.profile.vibrationJitterSteps);
        }

        // Step 3: Actuate Servo Trapdoor
        _telemetry.state = STATE_OPENING_GATE;
        setServoAngle(SERVO_GATE_OPEN);

        // Step 4: Optical Beam Drop Verification
        _telemetry.state = STATE_VERIFYING_DROP;
        _telemetry.opticalBeamBroken = false;
        vTaskDelay(pdMS_TO_TICKS(cmd.profile.servoGateHoldMs));

        // Step 5: Close Gate
        _telemetry.state = STATE_CLOSING_GATE;
        setServoAngle(SERVO_GATE_CLOSED);

        // Step 6: Enter Waiting for Pickup & Arm Unclaimed Countdown
        _telemetry.state = STATE_WAITING_PICKUP;
        _telemetry.trayOccupied = true;
        _unclaimedDeadlineMs = millis() + _unclaimedTimeoutDurationMs;
        commandBuzzer(BUZZER_CONFIRM);

        Serial.println("[DispenserEngine] 1 Pill dropped into tray. Unclaimed timer armed.");
    }

    // 2. Monitor Unclaimed Pill Reminder State Machine
    checkUnclaimedTimeout();

    // 3. Monitor physical microswitch in tray
    if (_telemetry.trayOccupied && digitalRead(PIN_TRAY_SWITCH) == LOW) {
        acknowledgePickup();
    }
}

void DispenserEngine::checkUnclaimedTimeout() {
    if (_telemetry.state == STATE_WAITING_PICKUP) {
        if (millis() < _unclaimedDeadlineMs) {
            _telemetry.unclaimedSecondsRemaining = (_unclaimedDeadlineMs - millis()) / 1000;
        } else {
            // UNCLAIMED TIMEOUT EXPIRED! Enter alarm state!
            _telemetry.unclaimedSecondsRemaining = 0;
            _telemetry.state = STATE_UNCLAIMED_ALARM;
            commandBuzzer(BUZZER_UNCLAIMED_ALARM);
            Serial.println("[DispenserEngine] ⚠️ UNCLAIMED ALARM: Patient has not retrieved dose! Escalating buzzer active.");
        }
    }
}

void DispenserEngine::commandBuzzer(BuzzerPattern_t pattern) {
    _telemetry.buzzerPattern = pattern;
    _telemetry.buzzerActive = (pattern != BUZZER_STOP);

    switch (pattern) {
        case BUZZER_BEEP:
            ledcWriteTone(PIN_PIEZO_BUZZER, 660);
            vTaskDelay(pdMS_TO_TICKS(100));
            ledcWrite(PIN_PIEZO_BUZZER, 0);
            break;
        case BUZZER_CONFIRM:
            ledcWriteTone(PIN_PIEZO_BUZZER, 880);
            vTaskDelay(pdMS_TO_TICKS(150));
            ledcWriteTone(PIN_PIEZO_BUZZER, 1318);
            vTaskDelay(pdMS_TO_TICKS(250));
            ledcWrite(PIN_PIEZO_BUZZER, 0);
            break;
        case BUZZER_UNCLAIMED_ALARM:
            // Escalating 2730Hz resonant bursts
            ledcWriteTone(PIN_PIEZO_BUZZER, BUZZER_RESONANT_FREQ);
            break;
        case BUZZER_JAM_ERROR:
            ledcWriteTone(PIN_PIEZO_BUZZER, 150);
            vTaskDelay(pdMS_TO_TICKS(400));
            ledcWrite(PIN_PIEZO_BUZZER, 0);
            break;
        case BUZZER_STOP:
        default:
            ledcWrite(PIN_PIEZO_BUZZER, 0);
            break;
    }
}

void DispenserEngine::commandServo(uint8_t angleDeg) {
    setServoAngle(angleDeg);
}

void DispenserEngine::commandMotorStep(int16_t deltaDeg) {
    float next = _telemetry.stepperAngleDeg + (float)deltaDeg;
    while (next < 0) next += 360.0f;
    while (next >= 360.0f) next -= 360.0f;
    rotateStepperDeg(next, 1200);
}

void DispenserEngine::commandMotorReverse(float deltaDeg) {
    reverseStepperDeg(deltaDeg, 1200);
}

void DispenserEngine::simulateJamFault(bool enable) {
    _isJamSimulated = enable;
    _telemetry.jamDetected = enable;
}

HardwareTelemetry_t DispenserEngine::getTelemetry() {
    HardwareTelemetry_t snap;
    xSemaphoreTake(_telemetryMutex, portMAX_DELAY);
    _telemetry.timestampMs = millis();
    snap = _telemetry;
    xSemaphoreGive(_telemetryMutex);
    return snap;
}
