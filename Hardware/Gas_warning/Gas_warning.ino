#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <string.h>
#include <ESP32Servo.h>
#include "DHT.h"
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <esp_wifi.h>
#include <esp_system.h>
// Button define
#define button1 15
#define button2 13
boolean button1State = HIGH;
boolean button2State = HIGH;
bool btn;

// DHT define
#define DHTTYPE DHT11   // DHT 11
#define DHTPIN 18
DHT dht(DHTPIN, DHTTYPE);

// Sensor khi gas va canh bao
#define sensor 34
#define buzzer 21   
boolean canhbao = 0;
int canhbaoState = 0;

// Define LED
#define LED 5
int button = 0;

//Define warning
bool warningState = false;
bool messageControl = false;

//Define warning value
float gasWarning = 80;
float temperatureWarning = 50;

//Fan dc
#define FAN_PIN 32 
bool fanControl = false;

//Flag mqtt
bool mqttControl = false;

// Connect wifi
const char *ssid = "Vuxpn";
const char *password = "12345678";

// MQTT Broker
const char *mqtt_broker = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const char *mqtt_username = "vuphan";
const char *mqtt_password = "Vu15102003@";
const int mqtt_port = 8883;

//Sub topic
const char *topic = "iot/security-home";
const char *topic_warning_control = "iot/warning/control/";  // Topic để nhận lệnh điều khiển LED
const char *topic_warning_status = "iot/warning/status/thietbi4";    // Topic để gửi trạng thái LED
const char *topic_connect_device = "iot/device/gas/connect"; //Topic nhận yêu cầu kết nối


//macAddress
String macAddress = "thietbi4";

// String getMacAddress() {
  // uint8_t mac[6];
  // esp_err_t err = esp_wifi_get_mac(WIFI_IF_STA, mac);
  // if (err != ESP_OK) {
  //   return "Error getting MAC address";
  // }

  // String macStr = "";
  // for (int i = 0; i < 6; i++) {
  //   macStr += String(mac[i], HEX);
  //   if (i < 5) macStr += ":";
  // }
  // return macStr;
  // uint8_t mac[6];
  // WiFi.macAddress(mac);
  // char macStr[18];
  // snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
  //          mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  // return String(macStr);
  // Serial.println(WiFi.macAddress());
//   String macAddress = "1A-2B-3C-4D-5F-6E";
//   return macAddress;
 
// }


WiFiClientSecure espClient;
PubSubClient client(espClient);
bool isConnected = true;
unsigned long lastReadingTime = 0;
const long readingInterval = 5000; // Read every 5 seconds

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

// Add new constants for timing
const unsigned long MQTT_PUBLISH_INTERVAL = 5000;  // 5 seconds
const unsigned long SENSOR_READ_INTERVAL = 5000;   // 5 seconds
unsigned long lastMqttPublish = 0;
unsigned long lastSensorRead = 0;

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
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
//------------Connect to MQTT Broker-----------------------------
void reconnect() {
  if (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID = "ESPClient-" + String(random(0xffff), HEX);
    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)){
      Serial.println("connected");
      client.subscribe(("iot/device/create/" + macAddress).c_str());
      client.subscribe(("iot/device/connect/" + macAddress).c_str());
      client.subscribe(("iot/device/disconnect/" + macAddress).c_str());
      client.subscribe(("iot/device/warning/control/"+ macAddress).c_str());
      client.subscribe(("iot/warning/change/"+ macAddress).c_str());
      client.subscribe(("iot/warning/fan/"+ macAddress).c_str());
      
      client.publish(topic_warning_status, warningState ? "ON" : "OFF");
    } else {
      Serial.printf("failed, rc=%d\n", client.state());
      delay(5000);
    }
    }
    
  }

//-----Call back Method for Receiving MQTT massage---------
void callback(char* topic, byte* payload, unsigned int length) {
  //String deviceMac = getMacAddress();
  String incommingMessage = "";
  for(int i=0; i<length;i++) incommingMessage += (char)payload[i]; //chuyển payload thành chuỗi
  Serial.println("Message arrived ["+String(topic)+"]"+incommingMessage);

  StaticJsonDocument<200> doc;
  deserializeJson(doc, incommingMessage);


  // 
  if (String(topic).startsWith("iot/device/create/" + macAddress)) {
    handleVerification(doc);
  } else if (String(topic).startsWith("iot/device/connect/" + macAddress)) {
    handleConnect(doc);
  } else if (String(topic).startsWith("iot/device/disconnect/" + macAddress)) {
    handleDisconnect(doc);
    } else if (String(topic).startsWith("iot/device/warning/control/" + macAddress)) {
      handleWarning(doc);
  }else if(String(topic).startsWith("iot/warning/change/" + macAddress)){
    handleWarningValue(doc);
  }else if(String(topic).startsWith("iot/warning/fan/" + macAddress)){
    handleFan(doc);
  }

    // Publish LED status back
  client.publish(topic_warning_status, warningState ? "ON" : "OFF");
  }
  

//-----Method for Publishing MQTT Messages---------
void publishMessage(const char* topic, String payload, boolean retained){
  if(client.publish(topic,payload.c_str(),true))
    Serial.println("Message published ["+String(topic)+"]: "+payload);
}

void handleVerification(const JsonDocument& doc) {
  String receivedDeviceId = doc["data"]["deviceId"];

  if (receivedDeviceId == macAddress) {
    String responseTopic = "iot/device/" + macAddress + "/response";
    StaticJsonDocument<200> response;
    response["verified"] = true;
    response["deviceId"] = macAddress;

    String responseMessage;
    serializeJson(response, responseMessage);
    publishMessage(responseTopic.c_str(), responseMessage, true);
  }
}

void handleConnect(const JsonDocument& doc) {
  String receivedDeviceId = doc["data"]["deviceId"];

  if (receivedDeviceId == macAddress) {
    isConnected = true;
    String responseTopic = "iot/device/" + macAddress + "/connect/response";
    StaticJsonDocument<200> response;
    response["connected"] = true;
    response["deviceId"] = macAddress;

    String responseMessage;
    serializeJson(response, responseMessage);
    publishMessage(responseTopic.c_str(), responseMessage, true);
  }
}

void handleDisconnect(const JsonDocument& doc) {
  String receivedDeviceId = doc["data"]["deviceId"];

  if (receivedDeviceId == macAddress) {
    isConnected = false;
    String responseTopic = "iot/device/" + macAddress + "/disconnect/response";
    StaticJsonDocument<200> response;
    response["disconnected"] = true;
    response["deviceId"] = macAddress;

    String responseMessage;
    serializeJson(response, responseMessage);
    publishMessage(responseTopic.c_str(), responseMessage, true);
  }
}
void handleWarning(const JsonDocument& doc) {
  //String deviceMac = getMacAddress();
  String deviceId = doc["data"]["deviceId"];
  String state = doc["data"]["state"];
  
   //Debug
    Serial.print("Warning Command: ");
    Serial.println(state);
    Serial.println(deviceId);

    if (deviceId == macAddress && isConnected == true) {
        // Check message control warning
        if (state == "On" || state == "ON" || state == "on" || state == "1") {
            warningState = true;
            messageControl = true;
            digitalWrite(LED, HIGH);
            digitalWrite(buzzer, HIGH);
            Serial.println("Warning turned ON via MQTT");
        }
        else if (state == "Off" || state == "OFF" || state == "off" || state == "0") {
            warningState = false; 
            messageControl = false;
            digitalWrite(LED, LOW);
            digitalWrite(buzzer, LOW);
            Serial.println("Warning turned OFF via MQTT");
        }
    }
    

}

void handleWarningValue(const JsonDocument& doc){
  String deviceId = doc["data"]["deviceId"];
  if(deviceId == macAddress && isConnected == true){
    gasWarning = doc["data"]["gasValue"];
    temperatureWarning = doc["data"]["temValue"];
    Serial.println("gasWarning Value: " + String(gasWarning));
    Serial.println("temperatureWarning Value: " + String(temperatureWarning));
  }
}

void handleFan(const JsonDocument& doc) {
  //String deviceMac = getMacAddress();
  String deviceId = doc["data"]["deviceId"];
  String state = doc["data"]["state"];
  
   //Debug
    Serial.print("Warning Command: ");
    Serial.println(state);
    Serial.println(deviceId);

    if (deviceId == macAddress && isConnected == true) {
        // Check message control warning
        if (state == "On" || state == "ON" || state == "on" || state == "1") {
           fanControl = true;
           messageControl = true;
            digitalWrite(FAN_PIN, HIGH);
            Serial.println("Fan turned ON via MQTT");
        }
        else if (state == "Off" || state == "OFF" || state == "off" || state == "0") {
            fanControl = false;
            messageControl = false;
            digitalWrite(FAN_PIN, LOW);
            Serial.println("Fan turned OFF via MQTT");
        }
    }
    

}

void setup() {
  // Debug console
  Serial.begin(115200); 
  //String mac = getMacAddress();
  Serial.println("Mac:"+macAddress);
  while(!Serial) delay(1);
  // Pin modes
  pinMode(LED, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  pinMode(FAN_PIN, OUTPUT);
  // Initialize DHT sensor
  dht.begin();
  // Connecting to a Wi-Fi network
  setup_wifi();
  //connecting to a mqtt broker
  espClient.setInsecure();
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);
}


void warning() {
  if(!messageControl){
    if (canhbao == 1) {
    digitalWrite(buzzer, HIGH);
    digitalWrite(LED, HIGH);
    canhbaoState = 1;
  } else {
    digitalWrite(buzzer, LOW);
    digitalWrite(LED, LOW);
    canhbaoState = 0;
  }
  }
}


void GASLevel() {
  static int lastValue = 0;
  static float lastTemp = 0;
  
  int value = map(analogRead(sensor), 0, 4095, 0, 100);
  float t = dht.readTemperature();
  
  // Only publish if values changed significantly or publish interval reached
  if (abs(value - lastValue) >= 2 || abs(t - lastTemp) >= 0.5 || 
      (millis() - lastMqttPublish) >= MQTT_PUBLISH_INTERVAL) {
    
    if (isConnected) {
      DynamicJsonDocument doc(128);  // Reduced size
      doc["gaslevel"] = value;
      String mqtt_message;
      serializeJson(doc, mqtt_message);
      publishMessage("iot/device/gaslevel/thietbi4", mqtt_message, true);
    }
    
    lastValue = value;
    lastTemp = t;
    lastMqttPublish = millis();
  }

  // Warning control logic
  if (!messageControl && (value >= gasWarning || t >= temperatureWarning)) {
    digitalWrite(buzzer, HIGH);
    digitalWrite(LED, HIGH);
    digitalWrite(FAN_PIN, HIGH);
  } else if (!messageControl && canhbao == 0) {
    digitalWrite(buzzer, LOW);
    digitalWrite(LED, LOW);
    if (!fanControl) {
      digitalWrite(FAN_PIN, LOW);
    }
  }
}

void loop() {
  client.loop();  // Handle MQTT messages first
  
  unsigned long currentMillis = millis();
  
  // Check MQTT connection
  if (!client.connected()) {
    reconnect();
    return;  // Start fresh after reconnection
  }
  
  // Read sensors at regular intervals
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    
    if (!isnan(h) && !isnan(t) && isConnected) {
      // Publish temperature and humidity
      StaticJsonDocument<64> doc;  // Smaller document size
      String message;
      
      doc["humidity"] = h;
      serializeJson(doc, message);
      publishMessage("iot/device/humidity/thietbi4", message, true);
      
      doc.clear();
      doc["temperature"] = t;
      serializeJson(doc, message);
      publishMessage("iot/device/temperature/thietbi4", message, true);
      
      Serial.printf("Humidity: %.1f%% Temperature: %.1fC\n", h, t);
    }
    
    GASLevel();
    lastSensorRead = currentMillis;
  }
  
  // Handle buttons without delay
  handleButtons();
}

// New function to handle buttons
void handleButtons() {
  // Button 1
  bool currentButton1State = digitalRead(button1);
  if (currentButton1State == LOW && button1State == HIGH) {
    button1State = LOW;
  } else if (currentButton1State == HIGH) {
    button1State = HIGH;
  }
  
  // Button 2
  bool currentButton2State = digitalRead(button2);
  if (currentButton2State == LOW && button2State == HIGH) {
    canhbao = !canhbao;
    warning();
    button2State = LOW;
  } else if (currentButton2State == HIGH) {
    button2State = HIGH;
  }
}
