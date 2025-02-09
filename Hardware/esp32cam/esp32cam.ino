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

// HTTP Server settings
String serverName = "192.168.26.167";   
String serverPath = "/detectionwarning/upload/thietbi5";
const int serverPort = 3001;

// Device Configuration
const String DEVICE_ID = "thietbi5";
#define FLASH_PIN 4
RTC_DATA_ATTR uint32_t frameCounter = 0;

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

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);
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
    config.fb_count = 1;  // Reduced from 2 to 1 to avoid frame buffering

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed: 0x%x", err);
        ESP.restart();
    }

    // Initial camera settings
    sensor_t * s = esp_camera_sensor_get();
    s->set_contrast(s, 2);
    s->set_brightness(s, 2);
    s->set_saturation(s, 2);
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
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("Message arrived ["+String(topic)+"]"+ message);
    
    if (String(topic) == "iot/device/pir/status") {
        StaticJsonDocument<200> doc;
        if (!deserializeJson(doc, message)) {
            if (doc["status"] == "motion_detected") {
                // Clear any pending camera operations
                camera_fb_t * fb = NULL;
                esp_camera_fb_return(fb);
                
                // Small delay to ensure camera is ready
                delay(100);
                
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

String captureAndUpload() {
    String getAll;
    String getBody;
    
    // Turn on flash before capture
    digitalWrite(FLASH_PIN, HIGH);
    delay(100);  // Wait for flash to stabilize
    
    // Clear any existing frames
    camera_fb_t * fb = NULL;
    esp_camera_fb_return(fb);
    
    // Get fresh frame
    fb = esp_camera_fb_get();
    
    // Turn off flash immediately after capture
    digitalWrite(FLASH_PIN, LOW);

    if(!fb) {
        Serial.println("Camera capture failed");
        return "Camera capture failed";
    }

    String filename = "esp32-cam-" + String(millis()) + ".jpg";

    if (httpClient.connect(serverName.c_str(), serverPort)) {
        String boundary = "Vuxpn";
        String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"" + 
                     filename + "\"\r\nContent-Type: image/jpeg\r\n\r\n";
        String tail = "\r\n--" + boundary + "--\r\n";

        uint32_t imageLen = fb->len;
        uint32_t totalLen = imageLen + head.length() + tail.length();

        httpClient.println("POST " + serverPath + " HTTP/1.1");
        httpClient.println("Host: " + serverName);
        httpClient.println("Connection: close");
        httpClient.println("Content-Length: " + String(totalLen));
        httpClient.println("Content-Type: multipart/form-data; boundary=" + boundary);
        httpClient.println();
        httpClient.print(head);

        // Send image data in smaller chunks
        uint8_t *fbBuf = fb->buf;
        const size_t BLOCK_SIZE = 1024;
        size_t fbLen = fb->len;
        
        for (size_t n=0; n<fbLen; n+=BLOCK_SIZE) {
            size_t writeSize = min(BLOCK_SIZE, fbLen - n);
            httpClient.write(fbBuf + n, writeSize);
            // Small delay to prevent buffer overflow
            delay(1);
        }
        
        httpClient.print(tail);
        
        // Release camera buffer immediately after sending
        esp_camera_fb_return(fb);
        
        // Read response
        unsigned long timeout = millis();
        while (millis() - timeout < 5000) {  // Reduced timeout to 5 seconds
            while (httpClient.available()) {
                char c = httpClient.read();
                if (c == '\n' && getAll.length() == 0) {
                    getAll = "";
                    continue;
                }
                if (c != '\r') getBody += c;
            }
            if (getBody.length() > 0) break;
            delay(1);
        }
        
        httpClient.stop();
        return getBody;
        
    } else {
        esp_camera_fb_return(fb);
        return "Connection failed: " + serverName;
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(FLASH_PIN, OUTPUT);
    digitalWrite(FLASH_PIN, LOW);

    connectWiFi();
    setupCamera();

    secureClient.setInsecure();
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
}

void loop() {
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();

    static unsigned long lastUpdate = 0;
    if (millis() - lastUpdate > 30000) {
        mqttClient.publish("iot/device/cam/status", "online");
        lastUpdate = millis();
    }
}