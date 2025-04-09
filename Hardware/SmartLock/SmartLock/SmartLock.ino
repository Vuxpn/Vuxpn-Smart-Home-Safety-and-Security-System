#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Keypad.h>
#include <EEPROM.h>
#include <ESP32Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128  
#define SCREEN_HEIGHT 64  
#define OLED_RESET    -1  
#define SCREEN_ADDRESS 0x3C  

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Mode states
enum Mode {
  MODE_NORMAL,      
  MODE_CHANGE
};
Mode mode = MODE_NORMAL;

// Constants
const char* SSID = "Vuxpn";
const char* PASSWORD = "12345678";
const char* MQTT_BROKER = "l652a6f1.ala.asia-southeast1.emqxsl.com";
const char* MQTT_USERNAME = "vuphan";
const char* MQTT_PASSWORD = "Vu15102003@";
const int MQTT_PORT = 8883;

// Pin definitions
const int SERVO_PIN = 17;
const int BUZZER_PIN = 5;
const int LED_GREEN_PIN = 15;   // Success LED
const int LED_RED_PIN = 4;     // Error LED
const int LED_YELLOW_PIN = 16;  // Processing LED


// Keypad configuration
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'D', '#', '0', '*'},
  {'C', '9', '8', '7'},
  {'B', '6', '5', '4'},
  {'A', '3', '2', '1'}
};
byte rowPins[ROWS] = {27, 14, 12, 13}; // Connect to the row pinouts of the keypad
byte colPins[COLS] = {32, 33, 25, 26}; // Connect to the column pinouts of the keypad

//System parameter
const int PASSWORD_LENGTH = 6;
const int MAX_ATTEMPTS = 5;
const unsigned long LOCKOUT_TIME = 30000; // 30s timeout after 5 incorrect attempts
const unsigned long OPENDOOR_TIME = 30000;
const unsigned long LED_TIME = 2000; // 2s timeout turn on led
const int EEPROM_SIZE = 512;
const int PASSWORD_ADDRESS = 0;
const unsigned long STATUS_INTERVAL = 10000; // 10 giây
unsigned long lastStatusTime = 0;

// Global variables
char currentPassword[PASSWORD_LENGTH + 1] = "123456"; // Default password
char inputPassword[PASSWORD_LENGTH + 1];
int inputIndex = 0;
int failedAttempts = 0;
unsigned long lockoutTime = 0;
unsigned long opendoorTime = 0;
unsigned long ledTime = 0;
unsigned long lastActionTime = 0;
int alarmCycle = 0;
int soundState = 0;
int aPressCount = 0;
int cPressCount = 0;
boolean servoPosition = 0;
bool isChangingPassword = false;
bool isConnected = false;
bool ledState = false;
bool isSoundActive = false;
bool isLocked = true;


//MQTT Topics
const String BASE_TOPIC = "iot/device/";

//MacAddress
const String MAC_ADDRESS = "smartlock1";

//Oled void
void updateDisplay(String line1, String line2 = "");
void showDefaultScreen();
void showInputScreen();
void showCorrectPassword();
void showWrongPassword();
void showLockoutScreen();
void showChangePasswordStart();
void showOldPasswordScreen();
void showNewPasswordScreen();
void showConfirmPasswordScreen();
void showChangeSuccess();
void showConfirmFailed();


// Objects
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
Servo doorServo;
WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);

  EEPROM.begin(EEPROM_SIZE);
  
  setupOled();
  initializeHardware();
  setupWiFi();
  setupMQTT();

  // Load password from EEPROM
  loadPassword();
  Serial.println("Smart Lock System initialized");
  Serial.println(mode);
  showDefaultScreen();
}

void setupWiFi() {
  WiFi.begin(SSID, PASSWORD);
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 30000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
  } else {
    Serial.println("\nWiFi failed, retrying...");
    setupWiFi(); // Retry vô hạn
  }
}

void setupOled(){
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }
  display.clearDisplay();
  display.setTextSize(1);      
  display.setTextColor(SSD1306_WHITE);
  showDefaultScreen();   
}

void updateDisplay(String line1, String line2) {
  display.clearDisplay();
  
 
  int16_t x1 = (SCREEN_WIDTH - (line1.length() * 6)) / 2;  
  display.setCursor(x1 > 0 ? x1 : 0, 10);  
  display.println(line1);
  
 
  x1 = (SCREEN_WIDTH - (line2.length() * 6)) / 2;
  display.setCursor(x1 > 0 ? x1 : 0, 30); 
  display.println(line2);
  
  display.display();
}

void showDefaultScreen() {
  String status = isLocked ? "CUA KHOA >" : "CUA MO <";  
  updateDisplay("XIN CHAO", status);
}

void showInputScreen() {
  String inputStars = "";
  for (int i = 0; i < inputIndex; i++) {
    inputStars += "*";
  }
  updateDisplay("NHAP MAT KHAU", inputStars);
}

void showCorrectPassword() {
  updateDisplay("MAT KHAU DUNG", "MO CUA ^");  // Icon mũi tên lên
}

void showWrongPassword() {
  int remaining = MAX_ATTEMPTS - failedAttempts;
  String line2 = "CON " + String(remaining) + " LAN";
  updateDisplay("MAT KHAU SAI", line2);
}

void showLockoutScreen() {
  unsigned long elapsedTime = millis() - lockoutTime;
  unsigned long remainingTime = (LOCKOUT_TIME > elapsedTime) ? (LOCKOUT_TIME - elapsedTime) / 1000 : 0;
  String line2 = String(remainingTime) + "s";
  updateDisplay("THU LAI SAU", line2);
}

void showChangePasswordStart() {
  updateDisplay("DOI MAT KHAU", "");
  delay(1000);  
}

void showOldPasswordScreen() {
  String inputStars = "";
  for (int i = 0; i < inputIndex; i++) {
    inputStars += "*";
  }
  updateDisplay("NHAP MAT KHAU CU", inputStars);
}

void showNewPasswordScreen() {
  String inputStars = "";
  for (int i = 0; i < inputIndex; i++) {
    inputStars += "*";
  }
  updateDisplay("NHAP MAT KHAU MOI", inputStars);
}

void showConfirmPasswordScreen() {
  String inputStars = "";
  for (int i = 0; i < inputIndex; i++) {
    inputStars += "*";
  }
  updateDisplay("XAC NHAN MAT KHAU", inputStars);
}

void showChangeSuccess() {
  updateDisplay("DOI THANH CONG", "OK");  // Icon đơn giản
  delay(2000);
  showDefaultScreen();
}

void showConfirmFailed() {
  int remaining = MAX_ATTEMPTS - failedAttempts;
  String line2 = "CON " + String(remaining) + " LAN";
  updateDisplay("XAC NHAN SAI", line2);
}

// Hardware initialization
void initializeHardware() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  doorServo.attach(SERVO_PIN);
  doorServo.write(0);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
}


// MQTT setup
void setupMQTT() {
  espClient.setInsecure();
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
}

void loop() {
  maintainMQTTConnection();
  handlePassword();
  updateLED();
  updateSoundSuccess();
  updateSoundFailure();
  updateSoundAlarm();
  //Send status
  unsigned long currentTime = millis();
  if (currentTime - lastStatusTime >= STATUS_INTERVAL) {
    reportStatus();
    lastStatusTime = currentTime;
  }
}

void maintainMQTTConnection(){
  if(!client.connected()){
    reconnectMQTT();
  }
  client.loop();
}

void reconnectMQTT() {
  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 5000) return; // Giới hạn tần suất retry
  lastAttempt = millis();

  String clientId = "ESP32Client-" + String(random(0xFFFF), HEX);
  if (client.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.println("MQTT connected");
    subscribeToTopics();
  } else {
    Serial.println("MQTT connection failed");
  }
}

void subscribeToTopics() {
  client.subscribe((BASE_TOPIC + "create/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "connect/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "disconnect/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "opendoor/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "lockdoor/" + MAC_ADDRESS).c_str());
  client.subscribe((BASE_TOPIC + "changepassword/" + MAC_ADDRESS).c_str());
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
  } else if (topicStr == BASE_TOPIC + "opendoor/" + MAC_ADDRESS) {
    handleOpenDoor(doc);
  } else if (topicStr == BASE_TOPIC + "lockdoor/" + MAC_ADDRESS) {
    handleLockDoor(doc);
  } else if (topicStr == BASE_TOPIC + "changepassword/" + MAC_ADDRESS) {
    handleChangePassword(doc);
  }
}

void publishMessage(const String& topic, const String& payload) {
  if (client.publish(topic.c_str(), payload.c_str())) {
    Serial.println("Published to: " + topic);
  }
}

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

void handleOpenDoor(const JsonDocument& doc){
  if(doc["data"]["deviceId"] == MAC_ADDRESS){
    const char* password = doc["data"]["password"];
    if(strcmp(password,currentPassword) == 0){
      unlockDoor();
      failedAttempts = 0;
      ledSuccess();
      showCorrectPassword();
      delay(2000);
      showDefaultScreen();
      Serial.println("Open door request accepted via MQTT");
      StaticJsonDocument<128> response;
      response["deviceId"] = MAC_ADDRESS;
      response["status"] = "success";
      String payload;
      serializeJson(response, payload);
      publishMessage(BASE_TOPIC + MAC_ADDRESS + "/opendoor/status", payload);
  } else {
      soundFailure();
      ledError();
      failedAttempts++;
      Serial.print("Failed attempts: ");
      Serial.println(failedAttempts);
      showWrongPassword(); 
      delay(2000);
      showDefaultScreen(); 
      if (failedAttempts >= MAX_ATTEMPTS) {
        soundAlarm();
        lockoutTime = millis();
        showLockoutScreen(); 
      }

      StaticJsonDocument<128> response;
      response["deviceId"] = MAC_ADDRESS;
      response["status"] = "failed";
      response["reason"] = "incorrect_password";
      String payload;
      serializeJson(response, payload);
      publishMessage(BASE_TOPIC + MAC_ADDRESS + "/opendoor/status", payload);
    }
  }
}

void handleLockDoor(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    lockDoor();
    ledSuccess();
    showDefaultScreen(); 
    Serial.println("Lock door request accepted via MQTT");

    StaticJsonDocument<128> response;
    response["deviceId"] = MAC_ADDRESS;
    response["status"] = "success";
    String payload;
    serializeJson(response, payload);
    publishMessage(BASE_TOPIC + MAC_ADDRESS + "/lockdoor/status", payload);
  }
}

void handleChangePassword(const JsonDocument& doc) {
  if (doc["data"]["deviceId"] == MAC_ADDRESS) {
    const char* oldPassword = doc["data"]["currentPassword"];
    const char* newPassword = doc["data"]["newPassword"];
    if (strcmp(oldPassword, currentPassword) != 0) {
      Serial.println("Incorrect current password.");
      ledError();
      showWrongPassword();
      delay(2000);
      showDefaultScreen();
      //sendFailedChangePassword();
    } else {
      strcpy(currentPassword, newPassword);
      savePassword();
      Serial.print("Password changed successfully: ");
      Serial.println(currentPassword);
      ledSuccess();
      showChangeSuccess(); 
      //sendSuccessChangePassword();
    }
  }
  yield();
}

void sendFailedChangePassword() {
  StaticJsonDocument<128> doc;
  doc["deviceId"] = MAC_ADDRESS;
  doc["status"] = "failed";
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/changepass/status", payload);
}

void sendSuccessChangePassword() {
  StaticJsonDocument<128> doc;
  doc["deviceId"] = MAC_ADDRESS;
  doc["status"] = "success";
  
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/changepass/status", payload);
}

void handlePassword() {
  char key = keypad.getKey();
  if (!key){
    if (failedAttempts >= MAX_ATTEMPTS) {
      handleMaxAttempts();  
    }
    return;
  } 

  if (failedAttempts >= MAX_ATTEMPTS) {
    handleMaxAttempts();
    return;
  }

  switch (mode) {
    case MODE_NORMAL:
      handleNormalMode(key);
      break;
    case MODE_CHANGE:
      handleChangeMode(key);
      break;
  }
}

void handleNormalMode(char key) {
  if (key == '*') {
    clearInput();
    showDefaultScreen();
  } else if (key == '#') {
    verifyPassword();
  } else if (key == 'C') {
    cPressCount++;
    if (cPressCount >= 2) {
      mode = MODE_CHANGE;
      Serial.println("MODE_CHANGE");
      showChangePasswordStart();
      cPressCount = 0; 
    }
  } else if (key == 'D') {
    deletePassword();
    showInputScreen(); 
  } else if (key == 'B') {
    lockDoor();
    showDefaultScreen();
    ledSuccess();
  } else if (key == 'A') {
  } else if (inputIndex < PASSWORD_LENGTH) {
    addPassword(key); 
    showInputScreen(); 
  }
}

void resetToNormalMode() {
  mode = MODE_NORMAL;
  cPressCount = 0;
  aPressCount = 0;
  Serial.println("MODE_NORMAL");
}

void handleMaxAttempts(){
  char key = keypad.getKey();
    if(millis() - lockoutTime < LOCKOUT_TIME){
      showLockoutScreen();
      if(key != NO_KEY){
        //soundAlarm();
      }
      ledError();
      return;
    }
    else{
      failedAttempts = 0;
      Serial.println("Lockout period ended");
      showDefaultScreen();
    }
}

void clearInput(){
  inputIndex = 0;
  memset(inputPassword, 0, sizeof(inputPassword));
  Serial.println("Input cleared");
}

void verifyPassword(){
  if(strcmp(inputPassword,currentPassword) == 0){
    unlockDoor();
    //soundSuccess();
    ledSuccess();
    showCorrectPassword();
    delay(2000);
    failedAttempts = 0;
    clearInput();
    showDefaultScreen(); 
  } else{
    //soundFailure();
    ledError();
    failedAttempts++;
    Serial.print("Failed attempts: ");
    Serial.println(failedAttempts);
    showWrongPassword();
    delay(2000);
    clearInput();
    showDefaultScreen();  
    if (failedAttempts >= MAX_ATTEMPTS) {
      //soundAlarm();
      lockoutTime = millis();
    }
  }
  clearInput();
}

void deletePassword(){
  if(inputIndex > 0) {
    inputIndex--;
    inputPassword[inputIndex] = '\0';
    Serial.print("Deleted last character. Input: ");
    for (int i = 0; i < inputIndex; i++) {
      Serial.print(inputPassword[i]);
    }
    Serial.println();
  }
}

void addPassword(char key) {
  if (key >= '0' && key <= '9') { 
    inputPassword[inputIndex++] = key;
    Serial.print("Input: ");
    for (int i = 0; i < inputIndex; i++) {
      Serial.print(inputPassword[i]);
    }
    Serial.println();
  }
}



enum ChangePasswordState {
  ENTER_OLD_PASSWORD,
  ENTER_NEW_PASSWORD,
  CONFIRM_NEW_PASSWORD
};

ChangePasswordState changeState = ENTER_OLD_PASSWORD;
char newPassword[PASSWORD_LENGTH + 1];
unsigned long lastKeyTime = 0;
const unsigned long CHANGE_TIMEOUT = 30000; // 30 giây timeout

void handleChangeMode(char key) {
  if (!key) return;
  switch (changeState) {
    case ENTER_OLD_PASSWORD:
      Serial.println("Enter currentpassword: ");
      showOldPasswordScreen();
      handleOldPassword(key);
      break;
    case ENTER_NEW_PASSWORD:
      showNewPasswordScreen();
      handleNewPassword(key);
      break;
    case CONFIRM_NEW_PASSWORD:
      showConfirmPasswordScreen();
      handleConfirmPassword(key);
      break;
  }
}

void handleOldPassword(char key) {
  if (key == '*') {
    clearInput();
    resetToNormalMode();
    showDefaultScreen();
  } else if (key == '#') {
    if (strcmp(inputPassword, currentPassword) == 0) {
      clearInput();
      changeState = ENTER_NEW_PASSWORD;
      Serial.println("Verified success. Enter new password (6 digits):");
      showNewPasswordScreen();
    } else {
      soundFailure();
      ledError();
      clearInput();
      Serial.println("Incorrect current password");
      failedAttempts++;
      showWrongPassword();
      delay(2000);
      showOldPasswordScreen();
    }
  } else if (key == 'D') {
    deletePassword();
    showOldPasswordScreen(); // Cập nhật ngay khi xóa
  } else if (inputIndex < PASSWORD_LENGTH) {
    addPassword(key); // Chỉ thêm số
    showOldPasswordScreen(); // Cập nhật ngay sau khi nhập
  }
}

void handleNewPassword(char key) {
  if (key == '*') {
    clearInput();
    resetToNormalMode();
    showDefaultScreen();
  } else if (key == '#') {
    if (inputIndex == PASSWORD_LENGTH) {
      strcpy(newPassword, inputPassword);
      clearInput();
      changeState = CONFIRM_NEW_PASSWORD;
      Serial.println("Confirm new password:");
      showConfirmPasswordScreen();
    } else {
      soundFailure();
      failedAttempts++;
      Serial.println("Password must be 6 digits");
      updateDisplay("MAT KHAU CO 6 KY TU", "");
      delay(2000);
      showNewPasswordScreen();
    }
  } else if (key == 'D') {
    deletePassword();
    showNewPasswordScreen(); // Cập nhật ngay khi xóa
  } else if (inputIndex < PASSWORD_LENGTH) {
    addPassword(key); // Chỉ thêm số
    showNewPasswordScreen(); // Cập nhật ngay sau khi nhập
  }
}

void handleConfirmPassword(char key) {
  if (key == '*') {
    clearInput();
    resetToNormalMode();
    showDefaultScreen();
  } else if (key == '#') {
    if (strcmp(inputPassword, newPassword) == 0) {
      strcpy(currentPassword, newPassword);
      savePassword();
      ledSuccess();
      Serial.println("Password changed successfully");
      changeState = ENTER_OLD_PASSWORD;
      showChangeSuccess();
      clearInput();
      resetToNormalMode();
    } else {
      soundFailure();
      failedAttempts++;
      ledError();
      Serial.println("Passwords do not match");
      showConfirmFailed();
      delay(2000);
      clearInput();
      showConfirmPasswordScreen();
    }
  } else if (key == 'D') {
    deletePassword();
    showConfirmPasswordScreen(); // Cập nhật ngay khi xóa
  } else if (inputIndex < PASSWORD_LENGTH) {
    addPassword(key); // Chỉ thêm số
    showConfirmPasswordScreen(); // Cập nhật ngay sau khi nhập
  }
}


void unlockDoor() {
  if (isLocked) {
    isLocked = false;
    for (int pos = 0; pos <= 90; pos += 5) {
      doorServo.write(pos);
      delay(15);  // Đợi một chút giữa mỗi bước
    }
    soundSuccess();
    Serial.println("Door unlocked");
    sendOpenDoorLog();
  } else {
    Serial.println("Door is already unlocked");
  }
}


void lockDoor() {
  if (!isLocked) {
    Serial.println("Closing door...");
    for (int pos = 90; pos >= 0; pos -= 5) {
      doorServo.write(pos);
      delay(15);  // Đợi một chút giữa mỗi bước
    }
    isLocked = true;
    Serial.println("Door locked");
  } 
}

void sendOpenDoorLog() {
  StaticJsonDocument<256> doc;
  doc["deviceId"] = MAC_ADDRESS;
  doc["event"] = "door_opened";
  doc["timestamp"] = millis(); // Thời gian trên ESP32 (miliseconds từ lúc khởi động)
  doc["status"] = "unlocked";

  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/log", payload);
}

void reportStatus() {
  StaticJsonDocument<128> doc;
  doc["deviceId"] = MAC_ADDRESS;
  doc["locked"] = isLocked;
  doc["failedAttempts"] = failedAttempts;
  String payload;
  serializeJson(doc, payload);
  publishMessage(BASE_TOPIC + MAC_ADDRESS + "/status", payload);
}


void loadPassword() {
  // Load password from EEPROM
  char storedPassword[PASSWORD_LENGTH + 1];
  for (int i = 0; i < PASSWORD_LENGTH; i++) {
    storedPassword[i] = EEPROM.read(PASSWORD_ADDRESS + i);
  }
  storedPassword[PASSWORD_LENGTH] = '\0';
  
  // Check if stored password is valid
  bool validPassword = true;
  for (int i = 0; i < PASSWORD_LENGTH; i++) {
    if (storedPassword[i] < '0' || storedPassword[i] > '9') {
      validPassword = false;
      break;
    }
  }
  
  if (validPassword) {
    strcpy(currentPassword, storedPassword);
    Serial.println("Password loaded from EEPROM");
  } else {
    // Use default password and save to EEPROM
    savePassword();
    Serial.println("Default password set");
  }
}

void savePassword() {
  // Save password to EEPROM
  for (int i = 0; i < PASSWORD_LENGTH; i++) {
    EEPROM.write(PASSWORD_ADDRESS + i, currentPassword[i]);
  }
  EEPROM.commit();
  Serial.println("Password saved to EEPROM");
  yield();
}

void soundSuccess() {
  if (!isSoundActive) {
    isSoundActive = true;
    soundState = 0;
    lastActionTime = millis();
  }
}

void updateSoundSuccess() {
  if (!isSoundActive) return;

  unsigned long currentTime = millis();

  switch (soundState) {
    case 0:  // Phát "C5" (523 Hz) trong 100ms
      for (int i = 0; i < 52; i++) {  // 523 Hz * 0.1s ≈ 52 chu kỳ
        digitalWrite(BUZZER_PIN, HIGH);
        delayMicroseconds(955);  // 1/523/2 ≈ 955 µs
        digitalWrite(BUZZER_PIN, LOW);
        delayMicroseconds(955);
      }
      lastActionTime = currentTime;
      soundState = 1;
      break;

    case 1:  // Phát "E5" (659 Hz) trong 100ms
      if (currentTime - lastActionTime >= 100) {
        for (int i = 0; i < 66; i++) {  // 659 Hz * 0.1s ≈ 66 chu kỳ
          digitalWrite(BUZZER_PIN, HIGH);
          delayMicroseconds(759);  // 1/659/2 ≈ 759 µs
          digitalWrite(BUZZER_PIN, LOW);
          delayMicroseconds(759);
        }
        lastActionTime = currentTime;
        soundState = 2;
      }
      break;

    case 2:  // Phát "G5" (784 Hz) trong 100ms
      if (currentTime - lastActionTime >= 100) {
        for (int i = 0; i < 78; i++) {  // 784 Hz * 0.1s ≈ 78 chu kỳ
          digitalWrite(BUZZER_PIN, HIGH);
          delayMicroseconds(638);  // 1/784/2 ≈ 638 µs
          digitalWrite(BUZZER_PIN, LOW);
          delayMicroseconds(638);
        }
        lastActionTime = currentTime;
        soundState = 3;
      }
      break;

    case 3:  // Tắt âm sau 200ms
      if (currentTime - lastActionTime >= 200) {
        digitalWrite(BUZZER_PIN, LOW);
        isSoundActive = false;
        soundState = 0;
      }
      break;
  }
}

void soundFailure() {
  if (!isSoundActive) {
    isSoundActive = true;
    soundState = 0;
    lastActionTime = millis();
  }
}

void updateSoundFailure() {
  if (!isSoundActive) return;

  unsigned long currentTime = millis();

  switch (soundState) {
    case 0:  // Phát "A5" (880 Hz) trong 200ms
      for (int i = 0; i < 176; i++) {  // 880 Hz * 0.2s ≈ 176 chu kỳ
        digitalWrite(BUZZER_PIN, HIGH);
        delayMicroseconds(568);  // 1/880/2 ≈ 568 µs
        digitalWrite(BUZZER_PIN, LOW);
        delayMicroseconds(568);
      }
      lastActionTime = currentTime;
      soundState = 1;
      break;

    case 1:  // Phát "E5" (659 Hz) trong 200ms
      if (currentTime - lastActionTime >= 200) {
        for (int i = 0; i < 132; i++) {  // 659 Hz * 0.2s ≈ 132 chu kỳ
          digitalWrite(BUZZER_PIN, HIGH);
          delayMicroseconds(759);  // 1/659/2 ≈ 759 µs
          digitalWrite(BUZZER_PIN, LOW);
          delayMicroseconds(759);
        }
        lastActionTime = currentTime;
        soundState = 2;
      }
      break;

    case 2:  // Phát "C5" (523 Hz) trong 200ms
      if (currentTime - lastActionTime >= 200) {
        for (int i = 0; i < 105; i++) {  // 523 Hz * 0.2s ≈ 105 chu kỳ
          digitalWrite(BUZZER_PIN, HIGH);
          delayMicroseconds(955);  // 1/523/2 ≈ 955 µs
          digitalWrite(BUZZER_PIN, LOW);
          delayMicroseconds(955);
        }
        lastActionTime = currentTime;
        soundState = 3;
      }
      break;

    case 3:  // Tắt âm sau 300ms
      if (currentTime - lastActionTime >= 300) {
        digitalWrite(BUZZER_PIN, LOW);
        isSoundActive = false;
        soundState = 0;
      }
      break;
  }
}

void soundAlarm() {
  if (!isSoundActive) {
    isSoundActive = true;
    soundState = 0;
    alarmCycle = 0;
    lastActionTime = millis();
  }
}

void updateSoundAlarm() {
  if (!isSoundActive) return;

  unsigned long currentTime = millis();

  switch (soundState) {
    case 0:  // Phát "A5" (880 Hz) trong 100ms
      for (int i = 0; i < 88; i++) {  // 880 Hz * 0.1s ≈ 88 chu kỳ
        digitalWrite(BUZZER_PIN, HIGH);
        delayMicroseconds(568);  // 1/880/2 ≈ 568 µs
        digitalWrite(BUZZER_PIN, LOW);
        delayMicroseconds(568);
      }
      lastActionTime = currentTime;
      soundState = 1;
      break;

    case 1:  // Phát "C5" (523 Hz) trong 100ms
      if (currentTime - lastActionTime >= 100) {
        for (int i = 0; i < 52; i++) {  // 523 Hz * 0.1s ≈ 52 chu kỳ
          digitalWrite(BUZZER_PIN, HIGH);
          delayMicroseconds(955);  // 1/523/2 ≈ 955 µs
          digitalWrite(BUZZER_PIN, LOW);
          delayMicroseconds(955);
        }
        lastActionTime = currentTime;
        soundState = 2;
      }
      break;

    case 2:  // Tắt âm trong 50ms
      if (currentTime - lastActionTime >= 100) {
        digitalWrite(BUZZER_PIN, LOW);
        lastActionTime = currentTime;
        soundState = 3;
      }
      break;

    case 3:  // Nghỉ 50ms trước khi lặp lại
      if (currentTime - lastActionTime >= 50) {
        alarmCycle++;
        if (alarmCycle < 5) {
          soundState = 0;  // Quay lại phát A5
        } else {
          isSoundActive = false;
          soundState = 0;
        }
      }
      break;
  }
}

void ledSuccess(){
    digitalWrite(LED_GREEN_PIN, HIGH);  
    ledState = true;
    ledTime = millis();  
    Serial.println("Led green");
}

void ledError() {
   digitalWrite(LED_RED_PIN, HIGH);  
    ledState = true;
    ledTime = millis(); 
    Serial.println("Led red"); 
}

void ledProcess() {
   digitalWrite(LED_YELLOW_PIN, HIGH);  
    ledState = true;
    ledTime = millis();  
    Serial.println("Led yellow");
}

void updateLED() {
  if (ledState && millis() - ledTime >= LED_TIME) {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    ledState = false;
  }
}







