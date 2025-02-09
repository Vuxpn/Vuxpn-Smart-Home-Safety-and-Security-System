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
// const char* API_HOST = "192.168.26.167";
// const int API_PORT = 3001;
// const char* API_PATH = "/detectionwarning/upload/thietbi5";

// HTTP Server settings
String serverName = " 192.168.26.167";   
String serverPath = "/detectionwarning/upload/thietbi5";
const int serverPort = 3001;

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

// HTTP client for camera
WiFiClient httpClient;

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
/*
void captureAndUpload() {
  camera_fb_t *fb = NULL;
  
  digitalWrite(FLASH_PIN, HIGH);
  delay(50);
  
  fb = esp_camera_fb_get();
  digitalWrite(FLASH_PIN, LOW);

  if (!fb || fb->len == 0) {
    Serial.println("Capture failed");
    return;
  }

  HTTPClient http;
  String url = "http://" + String(API_HOST) + ":" + String(API_PORT) + API_PATH;
  
  Serial.println("Uploading to: " + url);
  
  http.begin(url);
  
  // Change the headers to match server expectations
  http.addHeader("Content-Type", "multipart/form-data; boundary=boundary");
  
  // Create multipart form data
  String head = "--boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--boundary\r\nContent-Disposition: form-data; name=\"deviceId\"\r\n\r\n" + DEVICE_ID + "\r\n--boundary--\r\n";
  
  uint32_t imageLen = fb->len;
  uint32_t totalLen = head.length() + imageLen + tail.length();
  
  uint8_t *buffer = (uint8_t *)malloc(totalLen);
  if (!buffer) {
    Serial.println("Failed to allocate memory");
    esp_camera_fb_return(fb);
    return;
  }
  
  uint32_t pos = 0;
  // Copy head
  memcpy(buffer, head.c_str(), head.length());
  pos += head.length();
  // Copy image
  memcpy(buffer + pos, fb->buf, fb->len);
  pos += fb->len;
  // Copy tail
  memcpy(buffer + pos, tail.c_str(), tail.length());
  
  // Send the request
  int httpCode = http.POST(buffer, totalLen);
  
  free(buffer);
  
  Serial.println("HTTP Response Code: " + String(httpCode));
  
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    Serial.println("Upload successful! Response: " + response);
    publishUploadConfirmation(response);
  } else {
    Serial.printf("HTTP error code: %d\n", httpCode);
    String payload = http.getString();
    Serial.println("Error payload: " + payload);
  }

  http.end();
  esp_camera_fb_return(fb);
}
*/
String captureAndUpload() {
  String getAll;
  String getBody;
  
  // Camera stabilization
  sensor_t * s = esp_camera_sensor_get();
  s->set_contrast(s, 2);
  s->set_brightness(s, 2); 
  s->set_saturation(s, 2);
  
  // Wait for sensor to stabilize
  delay(500);
  
  // Clear previous capture buffer
  camera_fb_t * fb = NULL;
  esp_camera_fb_return(fb);
  
  // Flash control
  digitalWrite(FLASH_PIN, HIGH);
  delay(100);
  
  // Capture photo
  fb = esp_camera_fb_get();
  digitalWrite(FLASH_PIN, LOW);

  if(!fb) {
    Serial.println("Camera capture failed");
    delay(1000);
    ESP.restart();
    return "Camera capture failed";
  }

  // Generate unique filename with timestamp
  String filename = "esp32-cam-" + String(millis()) + ".jpg";

 if (httpClient.connect(serverName.c_str(), serverPort)) {
    Serial.println("Connected to server: " + serverName);
    
    String boundary = "Vuxpn";
    String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"" + 
                 filename + "\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + boundary + "--\r\n";

    uint32_t imageLen = fb->len;
    uint32_t totalLen = imageLen + head.length() + tail.length();

    // Send HTTP headers
    httpClient.println("POST " + serverPath + " HTTP/1.1");
    httpClient.println("Host: " + serverName);
    httpClient.println("Connection: close");
    httpClient.println("Content-Length: " + String(totalLen));
    httpClient.println("Content-Type: multipart/form-data; boundary=" + boundary);
    httpClient.println();
    httpClient.print(head);
    
    // Send image data in chunks
    uint8_t *fbBuf = fb->buf;
    const size_t BLOCK_SIZE = 1024;
    size_t fbLen = fb->len;
    
    for (size_t n=0; n<fbLen; n+=BLOCK_SIZE) {
      size_t writeSize = min(BLOCK_SIZE, fbLen - n);
      httpClient.write(fbBuf + n, writeSize);
    }
    
    httpClient.print(tail);
    
    // Release camera buffer
    esp_camera_fb_return(fb);
    
    // Read response with timeout
    unsigned long timeout = millis();
    while (millis() - timeout < 10000) {
      while (httpClient.available()) {
        char c = httpClient.read();
        if (c == '\n' && getAll.length() == 0) {
          getAll = "";
          continue;
        }
        if (c != '\r') getBody += c;
      }
      if (getBody.length() > 0) break;
      delay(10);
    }
    
    httpClient.stop();
    return getBody;
    
  } else {
    esp_camera_fb_return(fb);
    return "Connection failed: " + serverName;
  }
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