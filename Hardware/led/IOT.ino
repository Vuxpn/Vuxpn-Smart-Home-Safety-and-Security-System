#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <string.h>
#include <ArduinoJson.h>
#include <esp_wifi.h>
#include <esp_system.h>

const char* ssid = "Vuxpn";
const char* password = "12345678";

const char* mqtt_server = "e6b1298d0857429c89f18a2890b4f84c.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "vuphan";  //User
const char* mqtt_password = "Vu15102003@";  //Password

const int btnBedRoom = 12;
const int btnLivingRoom = 13;
const int btnKitchenRoom = 14;
const int ledBedRoom = 25;
const int ledLivingRoom = 26;
const int ledKitchenRoom = 27;
const int buttonPins[] = { btnBedRoom, btnLivingRoom, btnKitchenRoom };  // Các chân nối với nút nhấn
const int ledPins[] = { ledBedRoom, ledLivingRoom, ledKitchenRoom };     // Các chân nối với LED

bool ledStates[] = { false, false, false };      // Trạng thái của các đèn LED
bool buttonPressed[] = { false, false, false };  // Trạng thái của các nút nhấn


//macAddress
String macAddress = "thietbi6";

WiFiClientSecure espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

// Hàm kết nối Wi-Fi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Đang kết nối tới WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("Đã kết nối WiFi");
  Serial.println("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());
}


// Hàm xử lý khi nhận tin nhắn từ MQTT broker
void callback(char* topic, byte* payload, unsigned int length) {
  String incommingMessage = "";
  for(int i=0; i<length;i++) incommingMessage += (char)payload[i]; //chuyển payload thành chuỗi
  Serial.println("Message arrived ["+String(topic)+"]"+incommingMessage);

  StaticJsonDocument<200> doc;
  deserializeJson(doc, incommingMessage);

  // 
  if (String(topic).startsWith("iot/control/led/" + macAddress)) {
    handleLed(doc);
  }
}
 
//-----Method for Publishing MQTT Messages---------
void publishMessage(const char* topic, String payload, boolean retained){
  if(client.publish(topic,payload.c_str(),true))
    Serial.println("Message published ["+String(topic)+"]: "+payload);
}


void handleLed(const JsonDocument& doc) {
  String receivedDeviceId = doc["data"]["deviceId"];
  String message = doc["data"]["state"];
  if(receivedDeviceId == macAddress){
      if (message == "ledBedOn") {
      digitalWrite(ledPins[0], HIGH);
      ledStates[0] = true;
    } else if (message == "ledBedOff") {
      digitalWrite(ledPins[0], LOW);
      ledStates[0] = false;
    } else if (message == "ledLivOn") {
      digitalWrite(ledPins[1], HIGH);
      ledStates[1] = true;

    } else if (message == "ledLivOff") {
      digitalWrite(ledPins[1], LOW);
      ledStates[1] = false;

    } else if (message == "ledKitOn") {
      digitalWrite(ledPins[2], HIGH);
      ledStates[2] = true;

    } else if (message == "ledKitOff") {
      ledStates[2] = false;

      digitalWrite(ledPins[2], LOW);
    }
  }
}

// Hàm kết nối đến MQTT broker
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID = "ESPClient-";
    clientID += String(random(0xffff), HEX);
    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      client.subscribe(("iot/control/led/"+ macAddress).c_str());;
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  // Cài đặt chân của nút nhấn và LED
  for (int i = 0; i < 3; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);  // Kích hoạt điện trở pull-up cho nút nhấn
    pinMode(ledPins[i], OUTPUT);           // Đặt các chân LED là OUTPUT
    digitalWrite(ledPins[i], LOW);         // Đảm bảo đèn tắt ban đầu
  }
}

void loop() {
  client.loop();
  for (int i = 0; i < 3; i++) {
    // Kiểm tra trạng thái nút nhấn
    if (digitalRead(buttonPins[i]) == LOW) {                  // Nút nhấn được nhấn
      if (!buttonPressed[i]) {                                // Đảm bảo chỉ xử lý khi nút được nhấn lần đầu
        ledStates[i] = !ledStates[i];                         // Đổi trạng thái LED
        digitalWrite(ledPins[i], ledStates[i] ? HIGH : LOW);  // Bật/Tắt LED
        buttonPressed[i] = true;                              // Ghi nhận nút đã nhấn
      }
    } else {
      buttonPressed[i] = false;  // Đặt lại trạng thái nếu nút được nhả ra
    }
  }

  if (!client.connected()) {
    reconnect();
  }
  
}
