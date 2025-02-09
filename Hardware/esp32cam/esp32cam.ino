#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "esp_camera.h"
#include "HTTPClient.h"
#include "esp_sleep.h"

// WiFi Configuration
const char* WIFI_SSID = "Vuxpn";
const char* WIFI_PASS = "12345678";

// MQTT Configuration
const char* MQTT_BROKER = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const char* MQTT_USER = "vuphan";
const char* MQTT_PASS = "Vu15102003@";
const int MQTT_PORT = 8883;

// API Configuration
const char* API_HOST = "192.168.90.167";
const int API_PORT = 3001;
const char* API_PATH = "/detectionwarning/upload/thietbi5";

// Device Configuration
const String DEVICE_ID = "thietbi5";
#define FLASH_PIN 4
RTC_DATA_ATTR uint32_t frameCounter = 0; // Persists through deep sleep

// Camera Configuration
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Global Objects
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x", err);
    ESP.restart();
  }
}

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  message.reserve(length);
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("Message arrived ["+String(topic)+"]"+ message);
  if (String(topic) == "iot/device/pir/status") {
    StaticJsonDocument<200> doc;
    if (!deserializeJson(doc, message)) {
      if (doc["status"] == "motion_detected") {
        captureAndUpload();
      }
    }
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    String clientId = "ESP32-CAM-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      mqttClient.subscribe("iot/device/pir/status");
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}

String generateFilename() {
  return String(millis()) + "-" + String(frameCounter++) + ".jpg";
}

void captureAndUpload() {
  camera_fb_t *fb = NULL;
  
  // Flash preparation
  digitalWrite(FLASH_PIN, HIGH);
  delay(50);
  
  // Capture image
  fb = esp_camera_fb_get();
  digitalWrite(FLASH_PIN, LOW);

  if (!fb || fb->len == 0) {
    Serial.println("Capture failed");
    return;
  }

  // Prepare HTTP request
  HTTPClient http;
  String url = "https://" + String(API_HOST) + ":" + String(API_PORT) + API_PATH;
  http.begin(url);
  
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("X-Device-ID", DEVICE_ID);
  http.addHeader("X-Frame-ID", String(frameCounter));

  // Send image data
  int httpCode = http.sendRequest("POST", fb->buf, fb->len);
  
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    publishUploadConfirmation(response);
  } else {
    Serial.printf("HTTP error: %s\n", http.errorToString(httpCode).c_str());
  }

  // Cleanup
  http.end();
  esp_camera_fb_return(fb);
}

void publishUploadConfirmation(String response) {
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["frame_id"] = frameCounter;
  doc["status"] = "upload_success";
  doc["server_response"] = response;

  String payload;
  serializeJson(doc, payload);
  mqttClient.publish("iot/device/cam/confirm", payload.c_str());
}

void setup() {

  Serial.begin(115200);
  delay(1000);

  // Initialize hardware
  pinMode(FLASH_PIN, OUTPUT);
  digitalWrite(FLASH_PIN, LOW);

  // Connect to WiFi
  connectWiFi();

  // Initialize camera
  setupCamera();

  // Configure MQTT
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

 
}

void loop() {

  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Add periodic status update
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 30000) {
    mqttClient.publish("iot/device/cam/status", "online");
    lastUpdate = millis();
  }
}