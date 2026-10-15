#pragma once

#include "config.h"
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/semphr.h>

class DispenserEngine {
public:
    static DispenserEngine& getInstance();

    // FreeRTOS initialization and lifecycle
    void begin();
    void hardwareTaskLoop();

    // Commands invoked from Core 1 Web Server
    bool queueDispense(uint8_t chamberId, const DispenseProfile_t& profile);
    void acknowledgePickup();
    void commandBuzzer(BuzzerPattern_t pattern);
    void commandServo(uint8_t angleDeg);
    void commandMotorStep(int16_t deltaDeg);
    void simulateJamFault(bool enable);

    // Telemetry Snapshot
    HardwareTelemetry_t getTelemetry();

    // ISR for optical drop detection
    void handleBeamBreakISR();

private:
    DispenserEngine();
    ~DispenserEngine() = default;

    // Hardware low-level actuations
    void initGPIO();
    void initTMC2209();
    void initServo();
    void initBuzzer();
    
    void rotateStepperDeg(float targetDeg, uint32_t stepDelayUs);
    void performVibrationJitter(uint8_t jitterCount);
    void setServoAngle(uint8_t angleDeg);
    void updateBuzzerPattern(BuzzerPattern_t pattern);
    void checkUnclaimedTimeout();

    // FreeRTOS sync primitives
    QueueHandle_t _commandQueue;
    SemaphoreHandle_t _telemetryMutex;
    HardwareTelemetry_t _telemetry;

    // State tracking
    uint32_t _unclaimedDeadlineMs;
    uint32_t _unclaimedTimeoutDurationMs;
    bool _isJamSimulated;
};
