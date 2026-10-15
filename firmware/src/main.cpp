#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "dispenser_engine.h"
#include "web_server.h"

// FreeRTOS Task Prototypes
void vHardwareTask(void *pvParameters);
void vNetworkTask(void *pvParameters);

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n=======================================================");
    Serial.println("  SMART MEDICINE DISPENSER - EE SENIOR DESIGN");
    Serial.println("  Dual-Core ESP32-S3 Hardware Controller & Web GUI");
    Serial.println("=======================================================");

    // 1. Setup WiFi Access Point for Direct Bedside Touchscreen / Mobile Access
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP("SmartDispenser_AP", "seniordesign2026");
    IPAddress IP = WiFi.softAPIP();
    Serial.print("[WiFi] Access Point started! Connect to SSID 'SmartDispenser_AP'\n");
    Serial.print("[WiFi] Web Interface URL: http://");
    Serial.println(IP);

    // 2. Initialize Hardware Engine Subsystems
    DispenserEngine::getInstance().begin();

    // 3. Initialize Web Server & LittleFS Static Asset Serving
    WebServerManager::getInstance().begin();

    // 4. Pin Real-Time Hardware Task to Core 0 (Zero Jitter, High Priority)
    xTaskCreatePinnedToCore(
        vHardwareTask,
        "HardwareTask",
        4096,
        NULL,
        PRIORITY_HARDWARE_TASK,
        NULL,
        HARDWARE_TASK_CORE
    );

    // 5. Pin Web Server, WebSockets & Network Task to Core 1
    xTaskCreatePinnedToCore(
        vNetworkTask,
        "NetworkTask",
        8192,
        NULL,
        PRIORITY_NETWORK_TASK,
        NULL,
        NETWORK_TASK_CORE
    );

    Serial.println("[System] FreeRTOS Multi-Core Tasks pinned and running.\n");
}

void loop() {
    // Arduino loop remains idle; FreeRTOS tasks manage execution on respective cores
    vTaskDelay(pdMS_TO_TICKS(1000));
}

// -----------------------------------------------------------------------------
// CORE 0: Real-Time Hardware Actuation Task
// -----------------------------------------------------------------------------
void vHardwareTask(void *pvParameters) {
    Serial.println("[Core 0] Hardware Task loop started.");
    for (;;) {
        DispenserEngine::getInstance().hardwareTaskLoop();
        vTaskDelay(pdMS_TO_TICKS(10)); // 100Hz hardware poll rate
    }
}

// -----------------------------------------------------------------------------
// CORE 1: Asynchronous Web Server & WebSocket Telemetry Task
// -----------------------------------------------------------------------------
void vNetworkTask(void *pvParameters) {
    Serial.println("[Core 1] Network Task loop started.");
    for (;;) {
        WebServerManager::getInstance().broadcastTelemetry();
        vTaskDelay(pdMS_TO_TICKS(50)); // 20Hz network tick
    }
}
