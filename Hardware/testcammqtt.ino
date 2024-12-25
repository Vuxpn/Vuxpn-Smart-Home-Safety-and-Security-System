#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <string.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <esp_wifi.h>
#include <esp_system.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "esp_camera.h"

// WiFi credentials
const char* ssid = "vuxpn";
  const char* password = "12345678";

// MQTT Broker settings
const char *mqtt_broker = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const char *mqtt_username = "vuphan";
const char *mqtt_password = "Vu15102003@";
const int mqtt_port = 8883;

// HTTP Server settings
String serverName = "192.168.247.167";   
String serverPath = "/detectionwarning/upload/abc1";
const int serverPort = 3001;

//macAddress
String macAddress = "espcam1";

// PIR and LED pins
const int led = 5;
const int motionSensor = 27;

//Led cam
#define FLASH_LED_PIN 4

// Timer variables
int timeSeconds = 10;
unsigned long now = millis();
unsigned long lastTrigger = 0;
boolean startTimer = false;
boolean motion = false;

// Add timing constants
const unsigned long MQTT_RECONNECT_INTERVAL = 5000;  // 5 seconds
const unsigned long MOTION_CHECK_INTERVAL = 1000;    // 1 second
unsigned long lastMqttReconnectAttempt = 0;
unsigned long lastMotionCheck = 0;

// MQTT client setup
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// HTTP client for camera
WiFiClient httpClient;

// Camera pins
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

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void setup_camera() {
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

  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; //FRAMESIZE_ + QVGA|CIF|VGA|SVGA|XGA|SXGA|UXGA
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    delay(1000);
    ESP.restart();
  }
}

void mqtt_reconnect() {
  unsigned long currentMillis = millis();
  
  if (!mqttClient.connected() && 
      (currentMillis - lastMqttReconnectAttempt >= MQTT_RECONNECT_INTERVAL)) {
    Serial.print("Attempting MQTT connection...");
    String clientID = "ESPClient-" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      // Consolidate subscriptions
      const char* topics[] = {
        "iot/device/pir/sensitive",
        "iot/device/pir/timeout",
        "iot/device/camera"
      };
      
      for (const char* topic : topics) {
        mqttClient.subscribe(topic);
      }
    }
    
    lastMqttReconnectAttempt = currentMillis;
  }
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  String incomingMessage = "";
  for(int i = 0; i < length; i++) {
    incomingMessage += (char)payload[i];
  }
  Serial.println("Message arrived ["+String(topic)+"]"+incomingMessage);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, incomingMessage);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  if (String(topic).startsWith("iot/device/pir/timeout")) {
    handleTimeout(doc);
  }
  else if(String(topic).startsWith("iot/device/camera")){
    handleCamera(doc);
  }
}

void handleTimeout(const JsonDocument& doc) {
  if (doc.containsKey("data") && doc["data"].containsKey("timeout")) {
    int newTimeout = doc["data"]["timeout"].as<int>();
    if (newTimeout > 0) {
      timeSeconds = newTimeout;
      Serial.print("Timeout updated to: ");
      Serial.println(timeSeconds);
      
      StaticJsonDocument<100> confirmDoc;
      confirmDoc["status"] = "success";
      confirmDoc["timeout"] = timeSeconds;
      String confirmPayload;
      serializeJson(confirmDoc, confirmPayload);
      publishMessage("iot/device/pir/timeout/status", confirmPayload, true);
    }
  }
}

void handleCamera(const JsonDocument& doc){
  String confirm = doc["data"]["confirm"];
  if(confirm == "on"){
    sendPhoto();
  }
}

void publishMessage(const char* topic, String payload, boolean retained) {
  if(mqttClient.publish(topic, payload.c_str(), retained))
    Serial.println("Message published ["+String(topic)+"]: "+payload);
}

String sendPhoto() {
  String getBody;
  camera_fb_t * fb = NULL;
  
  // Turn on flash
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(100);  // Minimal delay for flash to take effect
  
  // Get camera frame buffer
  fb = esp_camera_fb_get();
  digitalWrite(FLASH_LED_PIN, LOW);
  
  if (!fb) {
    Serial.println("Camera capture failed");
    return "Camera capture failed";
  }

  if (httpClient.connect(serverName.c_str(), serverPort)) {
    // Prepare HTTP headers
    String head = "--Vuxpn\r\nContent-Disposition: form-data; name=\"image\"; "
                 "filename=\"esp32-cam.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--Vuxpn--\r\n";
    
    uint32_t imageLen = fb->len;
    uint32_t totalLen = imageLen + head.length() + tail.length();
    
    // Send HTTP headers
    httpClient.println("POST " + serverPath + " HTTP/1.1");
    httpClient.println("Host: " + serverName);
    httpClient.println("Content-Length: " + String(totalLen));
    httpClient.println("Content-Type: multipart/form-data; boundary=Vuxpn");
    httpClient.println();
    httpClient.print(head);
    
    // Send image data in chunks
    uint8_t *fbBuf = fb->buf;
    const size_t bufSize = 1024;
    for (size_t n = 0; n < imageLen; n += bufSize) {
      size_t currentChunk = min(bufSize, imageLen - n);
      httpClient.write(fbBuf + n, currentChunk);
    }
    
    httpClient.print(tail);
    
    // Read response with timeout
    unsigned long responseStart = millis();
    const unsigned long responseTimeout = 5000;
    String response;
    
    while (millis() - responseStart < responseTimeout) {
      if (httpClient.available()) {
        response += httpClient.readStringUntil('\n');
      }
    }
    
    getBody = response;
    
  } else {
    getBody = "Connection to " + serverName + " failed.";
  }
  
  esp_camera_fb_return(fb);
  httpClient.stop();
  return getBody;
}

void IRAM_ATTR detectsMovement() {
  digitalWrite(led, HIGH);
  startTimer = true;
  lastTrigger = millis();
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  
  // Initialize PIR and LED
  pinMode(motionSensor, INPUT_PULLUP);
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
  attachInterrupt(digitalPinToInterrupt(motionSensor), detectsMovement, RISING);

  // Setup flash LED
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW); // Tắt đèn flash khi khởi động

  // Initialize WiFi
  setup_wifi();
  
  // Initialize Camera
  setup_camera();
  
  // Initialize MQTT
  espClient.setInsecure();
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(mqtt_callback);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Handle MQTT connection
  if (!mqttClient.connected()) {
    mqtt_reconnect();
  }
  mqttClient.loop();
  
  // Handle motion detection at regular intervals
  if (currentMillis - lastMotionCheck >= MOTION_CHECK_INTERVAL) {
    handleMotionDetection();
    lastMotionCheck = currentMillis;
  }
}

// Optimize motion detection handling
void handleMotionDetection() {
  if (digitalRead(led) == HIGH && !motion) {
    Serial.println("MOTION DETECTED!!!");
    motion = true;
    
    // Publish motion detection
    StaticJsonDocument<64> motionDoc;
    motionDoc["status"] = "motion_detected";
    String motionPayload;
    serializeJson(motionDoc, motionPayload);
    publishMessage("iot/device/pir/status", motionPayload, true);
    
    // Take and send photo
    String photoResponse = sendPhoto();
    Serial.println("Photo sent. Response: " + photoResponse);
  }
  
  // Check motion timeout
  if (startTimer && (millis() - lastTrigger > (timeSeconds * 1000))) {
    Serial.println("Motion stopped...");
    digitalWrite(led, LOW);
    startTimer = false;
    motion = false;
    
    StaticJsonDocument<64> stopDoc;
    stopDoc["status"] = "motion_stopped";
    String stopPayload;
    serializeJson(stopDoc, stopPayload);
    publishMessage("iot/device/pir/status", stopPayload, true);
  }
}