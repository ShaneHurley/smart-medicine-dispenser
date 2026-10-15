#pragma once

#include "config.h"
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

class WebServerManager {
public:
    static WebServerManager& getInstance();

    void begin();
    void broadcastTelemetry();

private:
    WebServerManager();
    ~WebServerManager() = default;

    void setupLittleFSRoutes();
    void setupRestApi();
    void setupWebSocket();

    AsyncWebServer _server;
    AsyncWebSocket _ws;
    uint32_t _lastBroadcastMs;
};
