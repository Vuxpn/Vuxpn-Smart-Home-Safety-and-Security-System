#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Constants
const char* SSID = "Vuxpn";
const char* PASSWORD = "12345678";
const char* MQTT_BROKER = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const char* MQTT_USERNAME = "vuphan";
const char* MQTT_PASSWORD = "Vu15102003@";
const int MQTT_PORT = 8883;

// GPIO Pins
const int LED_PIN = 5;
const int MOTION_SENSOR_PIN = 27;
const int BUZZER_PIN = 21;

// MQTT Topics
const String BASE_TOPIC = "iot/device/";
const String MAC_ADDRESS = "thietbi5"; // Should use real MAC

// System parameters
const unsigned long DEBOUNCE_TIME_MS = 2000;
unsigned long ledDuration = 5000; 
unsigned long buzzerDuration = 5000; 
volatile bool motionDetected = false;
unsigned long lastTrigger = 0;

enum class SystemMode { NORMAL, SAFE };
SystemMode currentMode = SystemMode::SAFE;

// MQTT
WiFiClientSecure espClient;
PubSubClient client(espClient);
bool isConnected = false; // Added missing variable

void setup() {
  Serial.begin(115200);
  initializeHardware();
  setupWiFi();
  setupMQTT();
}

void loop() {
  maintainMQTTConnection();
  handleMotionDetection();
  updateIndicatorLED();
}

// Interrupt Service Routine
void IRAM_ATTR handleMotionInterrupt() {
    motionDetected = true;
}

// Hardware initialization
void initializeHardware() {
  pinMode(MOTION_SENSOR_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(MOTION_SENSOR_PIN), handleMotionInterrupt, RISING);
}

// WiFi setup
void setupWiFi() {
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

// MQTT setup
void setupMQTT() {
  espClient.setInsecure();
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
}

void maintainMQTTConnection() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
}

void reconnectMQTT() {
  while (!client.connected()) {
    String clientId = "ESP32Client-" + String(random(0xFFFF), HEX);
    if (client.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      subscribeToTopics();
    } else {
      delay(5000);
    }
  }
}

void subscribeToTopics() {
  client.subscribe((BASE_TOPIC + "create/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "connect/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "disconnect/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "pir/timeout/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "pir/mode/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "pir/buzzer/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "pir/buzzer_duration/" + MAC_ADDRESS).c_str());
}

// MQTT message handler
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("Message arrived ["+String(topic)+"]"+message);

  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, message)) {
    return;
  }

  String topicStr(topic);
  if (topicStr == BASE_TOPIC + "create/" + MAC_ADDRESS) {
    handleDeviceVerification(doc);
  } else if (topicStr == BASE_TOPIC + "connect/" + MAC_ADDRESS) {
    handleConnection(doc);
  } else if (topicStr == BASE_TOPIC + "disconnect/" + MAC_ADDRESS) {
    handleDisconnection(doc);
  } else if (topicStr == BASE_TOPIC + "pir/mode/" + MAC_ADDRESS) {
    handleModeChange(doc);
  } else if (topicStr == BASE_TOPIC + "pir/buzzer/" + MAC_ADDRESS) {
    handleBuzzerControl(doc);
  } else if (topicStr == BASE_TOPIC + "pir/timeout/" + MAC_ADDRESS) {
    handleTimeoutUpdate(doc);
  } else if (topicStr == BASE_TOPIC + "pir/buzzer_duration/" + MAC_ADDRESS) {
  handleBuzzerDurationUpdate(doc);
  }
}

// Motion detection handling
void handleMotionDetection() {
  if (motionDetected && (millis() - lastTrigger > DEBOUNCE_TIME_MS)) {
    lastTrigger = millis();
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Motion detected");

    if (currentMode == SystemMode::SAFE) {
      triggerSecurityActions();
    }

    // Atomic operation for shared variable
    noInterrupts();
    motionDetected = false;
    interrupts();
  }
}

void triggerSecurityActions() {
  activateBuzzer();
  sendAlertNotification();
}

void activateBuzzer() {
  tone(BUZZER_PIN, 1000, buzzerDuration);
}

void sendAlertNotification() {
  StaticJsonDocument<128> doc;
  doc["status"] = "motion_detected";
  doc["deviceId"] = MAC_ADDRESS;
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + "pir/status", payload);
}

// Utility functions
void publishMessage(const String& topic, const String& payload) {
  if (client.publish(topic.c_str(), payload.c_str())) {
    Serial.println("Published to: " + topic);
  }
}

// MQTT Handlers
void handleDeviceVerification(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    sendVerificationResponse();
  }
}

void sendVerificationResponse() {
  StaticJsonDocument<128> doc;
  doc["verified"] = true;
  doc["deviceId"] = MAC_ADDRESS;
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/response", payload);
}

void handleConnection(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    isConnected = true;
    sendConnectionStatus(true);
  }
}

void handleDisconnection(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    isConnected = false;
    sendConnectionStatus(false);
  }
}

void sendConnectionStatus(bool connected) {
  StaticJsonDocument<128> doc;
  doc[connected ? "connected" : "disconnected"] = true;
  doc["deviceId"] = MAC_ADDRESS;
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/status", payload);
}

void handleModeChange(const JsonDocument& doc) {
  if(doc["data"]["deviceId"] == MAC_ADDRESS){
    String mode = doc["data"]["mode"].as<String>();
    currentMode = (mode == "safe") ? SystemMode::SAFE : SystemMode::NORMAL;
    sendModeConfirmation();
  }
  
}

void sendModeConfirmation() {
  StaticJsonDocument<128> doc;
  doc["status"] = "mode_changed";
  doc["current_mode"] = (currentMode == SystemMode::SAFE) ? "safe" : "normal";
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + "pir/mode/status", payload);
}

void handleBuzzerControl(const JsonDocument& doc) {
  String state = doc["data"]["state"].as<String>();
  state.toLowerCase();
  
  if (state == "on" || state == "1") {
    tone(BUZZER_PIN, 1000, buzzerDuration);  // Use tone() instead of digitalWrite()
  } else {
    noTone(BUZZER_PIN);  // Stop the buzzer
  }
}

void handleTimeoutUpdate(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    ledDuration = doc["data"]["timeout"].as<unsigned long>() * 1000;
    sendTimeoutConfirmation();
  }
}

void sendTimeoutConfirmation() {
  StaticJsonDocument<128> doc;
  doc["status"] = "timeout_updated";
  doc["new_timeout"] = ledDuration / 1000;
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + "pir/timeout/status", payload);
}

void handleBuzzerDurationUpdate(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    buzzerDuration = doc["data"]["timeout"].as<unsigned long>() * 1000;
    sendBuzzerDurationConfirmation();
  }
}

void sendBuzzerDurationConfirmation() {
  StaticJsonDocument<128> doc;
  doc["status"] = "buzzer_duration_updated";
  doc["new_duration"] = buzzerDuration;
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + "pir/buzzer_duration/status", payload);
}

// LED management
void updateIndicatorLED() {
  static unsigned long lastUpdate = 0;
  if (digitalRead(LED_PIN) && (millis() - lastTrigger >= ledDuration)) {
    digitalWrite(LED_PIN, LOW);
    lastUpdate = millis();
  }
}