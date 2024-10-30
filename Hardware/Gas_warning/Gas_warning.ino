
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

//Flag mqtt
bool mqttControl = false;

// Connect wifi
const char *ssid = "vuxpn";
const char *password = "12345678";

// MQTT Broker
const char *mqtt_broker = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const char *mqtt_username = "vuphan";
const char *mqtt_password = "Vu15102003@";
const int mqtt_port = 8883;

//Sub topic
const char *topic = "iot/security-home";
const char *topic_warning_control = "iot/warning/control/";  // Topic để nhận lệnh điều khiển LED
const char *topic_warning_status = "iot/warning/status";    // Topic để gửi trạng thái LED
const char *topic_connect_device = "iot/device/gas/connect"; //Topic nhận yêu cầu kết nối


//macAddress
String macAddress = "1A-2B-3C-4D-5F-6E";

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
bool isConnected = false;
unsigned long lastReadingTime = 0;
const long readingInterval = 5000; // Read every 5 seconds

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

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
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID =  "ESPClient-";
    clientID += String(random(0xffff),HEX);
    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      //String deviceMac = getMacAddress();
      //Sub topic
      client.subscribe(("iot/device/create/" + macAddress).c_str());
      client.subscribe(("iot/device/connect/" + macAddress).c_str());
      client.subscribe(("iot/device/disconnect/" + macAddress).c_str());
      client.subscribe(("iot/device/warning/control/"+ macAddress).c_str());
      // Gửi trạng thái LED hiện tại
      client.publish(topic_warning_status, warningState ? "ON" : "OFF");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
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
  }else if(String(topic).startsWith("iot/warning/change"+ macAddress)){
      handleWarningValue(doc);
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
  // DynamicJsonDocument doc(1024);
  // deserializeJson(doc, incommingMessage); 
  // const char* connect = doc["data"]["deviceId"];
  // const char* command = doc["data"]["state"];
  // Serial.print("Warning Command: ");
  // Serial.println(command);     
  // Serial.println(connect);
  // if(strcmp(connect, macAddress) == 0){
  //   //Check message control warning       
  //   if(strcmp(command, "On") == 0 || strcmp(command, "ON") == 0 || strcmp(command, "on") == 0 || strcmp(command, "1") == 0) {         
  //     warningState = true;         
  //     messageControl = true;         
  //     digitalWrite(LED, HIGH);         
  //     digitalWrite(buzzer, HIGH);         
  //     Serial.println("Warning turned ON via MQTT");    
  // }else{
  //   if(strcmp(command, "Off") == 0 || strcmp(command, "OFF") == 0 || strcmp(command, "off") == 0 || strcmp(command, "0") == 0) {         
  //     warningState = false;         
  //     messageControl = false;         
  //     digitalWrite(LED, LOW);         
  //     digitalWrite(buzzer, LOW);         
  //     Serial.println("Warning turned OFF via MQTT");     
  // }
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
  string deviceId = doc["data"]["deviceId"];
  if(deviceId = macAddress){
    gasWarning = doc["data"]["gasValue"];
    temperatureWarning = doc["data"]["temValue"];
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
  int value = analogRead(sensor);
  float t = dht.readTemperature();
  value = map(value, 0, 4095, 0, 100); 
  //Blynk.virtualWrite(V4, value);
  Serial.println(value);
  //publish gas level
  DynamicJsonDocument doc(1024);
  doc["gaslevel"]= value;
  char mqtt_message[128];
  serializeJson(doc,mqtt_message);
  if(isConnected){
    publishMessage("iot/device/gaslevel", mqtt_message, true);
  }
  delay(5000);

  if(!messageControl){
    if (value >= gasWarning || t >= temperatureWarning) {
    digitalWrite(buzzer, HIGH);
    digitalWrite(LED, HIGH);
    digitalWrite(FAN_PIN, HIGH);
  } else {
    if (canhbao == 0 ) {
      digitalWrite(buzzer, LOW);
      digitalWrite(LED, LOW);
      digitalWrite(FAN_PIN, LOW);
    }
  }
  }
  
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  GASLevel();
  // Blynk.run();
  client.loop();
  // Read Temp
  float t = dht.readTemperature();
  // Read Humi
  float h = dht.readHumidity();
  // Check isRead ?
  if (isnan(h) || isnan(t)) {
    delay(500);
    Serial.println("Failed to read from DHT sensor!\n");
    return;
  }
  if(isConnected){
      //gửi độ ẩm
    DynamicJsonDocument hdoc(1024);
    hdoc["humidity"]=h;
    char hum_message[128];
    serializeJson(hdoc,hum_message);
    publishMessage("iot/device/humidity", hum_message, true);

    ///gửi nhiệt độ
    DynamicJsonDocument tdoc(1024);
    tdoc["temperature"]=t;
    char tem_message[128];
    serializeJson(tdoc,tem_message);
    publishMessage("iot/device/temperature", tem_message, true);
  
  }
  Serial.print("\n");
  Serial.print("Humidity: " + String(h) + "%");
  Serial.print("\t");
  Serial.print("Temperature:" + String(t) + " C");
  Serial.print("\t");
  delay(5000);
  // Button điều khiển cửa
  if (digitalRead(button1) == LOW) {
    if (button1State == HIGH) {
      button1State = LOW; // Cập nhật trạng thái button1
      delay(100);
    }
  } else {
    button1State = HIGH;
  }

  // Button điều khiển cảnh báo
    if (digitalRead(button2) == LOW) {
      if (button2State == HIGH) {
        canhbao = !canhbao; // Đảo trạng thái cảnh báo
        warning();
        button2State = LOW; // Cập nhật trạng thái button2
        delay(100);
      }
    } else {
      button2State = HIGH;
    }

  delay(200);


}
