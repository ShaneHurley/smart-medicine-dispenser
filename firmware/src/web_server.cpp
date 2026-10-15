#include "web_server.h"
#include "dispenser_engine.h"

WebServerManager& WebServerManager::getInstance() {
    static WebServerManager instance;
    return instance;
}

WebServerManager::WebServerManager()
    : _server(80)
    , _ws("/ws")
    , _lastBroadcastMs(0)
{
}

void WebServerManager::begin() {
    // 1. Mount LittleFS Filesystem containing compiled Claymorphic GUI
    if (!LittleFS.begin(true)) {
        Serial.println("[WebServer] LittleFS Mount Failed!");
    } else {
        Serial.println("[WebServer] LittleFS mounted successfully.");
    }

    // 2. Setup WebSocket & Routes
    setupWebSocket();
    setupRestApi();
    setupLittleFSRoutes();

    // 3. Start Web Server
    _server.begin();
    Serial.println("[WebServer] HTTP & WebSocket Server started on Core 1 (port 80).");
}

void WebServerManager::setupLittleFSRoutes() {
    // Serve production Claymorphic bundle from LittleFS
    _server.serveStatic("/", LittleFS, "/")
           .setDefaultFile("index.html")
           .setCacheControl("max-age=600");

    _server.onNotFound([](AsyncWebServerRequest *request) {
        request->send(LittleFS, "/index.html", "text/html");
    });
}

void WebServerManager::setupRestApi() {
    // GET /api/status - Current Telemetry Snapshot
    _server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request) {
        HardwareTelemetry_t telem = DispenserEngine::getInstance().getTelemetry();

        JsonDocument doc;
        doc["timestamp"] = telem.timestampMs;
        doc["dispenseState"] = (int)telem.state;
        doc["stepperAngleDeg"] = telem.stepperAngleDeg;
        doc["stepperRunning"] = telem.stepperRunning;
        doc["servoAngleDeg"] = telem.servoAngleDeg;
        doc["opticalBeamBroken"] = telem.opticalBeamBroken;
        doc["trayOccupied"] = telem.trayOccupied;
        doc["unclaimedTimerSeconds"] = telem.unclaimedSecondsRemaining;
        doc["buzzerActive"] = telem.buzzerActive;
        doc["motorVoltage"] = telem.motorRailVoltage;
        doc["espTemperatureC"] = telem.internalTempC;
        doc["activeChamber"] = telem.activeChamber;
        doc["jamDetected"] = telem.jamDetected;

        String response;
        serializeJson(doc, response);
        request->send(200, "application/json", response);
    });

    // POST /api/dispense - Trigger Single Pill Dispense
    _server.on("/api/dispense", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
            JsonDocument doc;
            deserializeJson(doc, data, len);

            uint8_t chamberId = doc["chamberId"] | 1;
            DispenseProfile_t profile;
            profile.stepDelayUs = doc["profile"]["stepDelayUs"] | 1200;
            profile.microsteps = doc["profile"]["microsteps"] | 16;
            profile.acceleration = doc["profile"]["acceleration"] | 800;
            profile.servoGateHoldMs = doc["profile"]["servoGateHoldMs"] | 800;
            profile.vibrationJitterSteps = doc["profile"]["vibrationJitterSteps"] | 0;
            profile.reverseBacklashSteps = doc["profile"]["reverseBacklashSteps"] | 2;

            bool queued = DispenserEngine::getInstance().queueDispense(chamberId, profile);

            JsonDocument res;
            res["success"] = queued;
            res["chamberId"] = chamberId;
            res["message"] = queued ? "Singulation command queued" : "Hardware engine busy";

            String out;
            serializeJson(res, out);
            request->send(queued ? 200 : 429, "application/json", out);
        }
    );

    // POST /api/pickup - Acknowledge Pill Retrieval & Silence Alarm
    _server.on("/api/pickup", HTTP_POST, [](AsyncWebServerRequest *request) {
        DispenserEngine::getInstance().acknowledgePickup();
        request->send(200, "application/json", "{\"success\":true,\"message\":\"Pickup confirmed\"}");
    });

    // POST /api/buzzer - Manual Tone Test
    _server.on("/api/buzzer", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
            JsonDocument doc;
            deserializeJson(doc, data, len);
            String pattern = doc["pattern"] | "stop";

            BuzzerPattern_t p = BUZZER_STOP;
            if (pattern == "beep") p = BUZZER_BEEP;
            else if (pattern == "confirm") p = BUZZER_CONFIRM;
            else if (pattern == "reminder") p = BUZZER_REMINDER;
            else if (pattern == "unclaimed_alert") p = BUZZER_UNCLAIMED_ALARM;

            DispenserEngine::getInstance().commandBuzzer(p);
            request->send(200, "application/json", "{\"success\":true}");
        }
    );
}

void WebServerManager::setupWebSocket() {
    _ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
        if (type == WS_EVT_CONNECT) {
            Serial.printf("[WebSocket] Client #%u connected\n", client->id());
        } else if (type == WS_EVT_DISCONNECT) {
            Serial.printf("[WebSocket] Client #%u disconnected\n", client->id());
        }
    });

    _server.addHandler(&_ws);
}

void WebServerManager::broadcastTelemetry() {
    if (millis() - _lastBroadcastMs < 200) return; // 5Hz telemetry stream
    _lastBroadcastMs = millis();

    if (_ws.count() == 0) return;

    HardwareTelemetry_t telem = DispenserEngine::getInstance().getTelemetry();

    JsonDocument doc;
    doc["timestamp"] = telem.timestampMs;
    doc["dispenseState"] = (int)telem.state;
    doc["stepperAngleDeg"] = telem.stepperAngleDeg;
    doc["stepperRunning"] = telem.stepperRunning;
    doc["servoAngleDeg"] = telem.servoAngleDeg;
    doc["opticalBeamBroken"] = telem.opticalBeamBroken;
    doc["trayOccupied"] = telem.trayOccupied;
    doc["unclaimedTimerSeconds"] = telem.unclaimedSecondsRemaining;
    doc["buzzerActive"] = telem.buzzerActive;
    doc["motorVoltage"] = telem.motorRailVoltage;
    doc["espTemperatureC"] = telem.internalTempC;
    doc["activeChamber"] = telem.activeChamber;
    doc["jamDetected"] = telem.jamDetected;

    String jsonStr;
    serializeJson(doc, jsonStr);
    _ws.textAll(jsonStr);
}
