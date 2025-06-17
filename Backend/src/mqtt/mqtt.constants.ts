// mqtt.constants.ts
export const MQTT_TOPICS = {
  //Create device
  CREATEDEVICE: 'iot/device/create',
  //Response verify device
  RESPONSEDEVICE: 'iot/device/+/response',
  //Connect device
  CONNECTDEVICE: 'iot/device/connect',
  //Response connect device
  RESPONSECONNECTDEVICE: 'iot/device/+/connect/response',
  //Disconnect device
  DISCONNECTDEVICE: 'iot/device/disconnect',
  //Response disconnect device
  RESPONSEDISCONNECTDEVICE: 'iot/device/+/disconnect/response',
  // Sensor data (ESP32 -> Server)
  TEMPERATURE: `iot/device/temperature`,
  HUMIDITY: `iot/device/humidity`,
  GASLEVEL: `iot/device/gaslevel`,

  // Warning control (Server -> ESP32)
  GASWARNING_CONTROL: 'iot/device/warning/control',

  // Warning status (ESP32 -> Server)
  GASWARNING_STATUS: 'iot/warning/status',
  GASWARNING_CHANGE_VALUE: 'iot/warning/change',
  GASWARNING_CONTROL_FAN: 'iot/warning/fan',

  //detection device
  UPLOAD_CONFIRMATION: 'iot/device/cam/confirm',
  CHANGE_TIME_LED: 'iot/device/pir/timeout',
  CHANGE_MODE: 'iot/device/pir/mode',
  WARNING_DETECT: 'iot/device/pir/buzzer',
  CHANGE_TIME_BUZZER: 'iot/device/pir/buzzer_duration',
  MOTION_DETECTED: 'iot/device/pir/status',

  //led Control
  LED_CONTROL: 'iot/control/led',

  //door control
  UNLOCK_DOOR: 'iot/device/opendoor',
  LOCK_DOOR: 'iot/device/lockdoor',
  CHANGE_PASS_DOOR: 'iot/device/changepassword',
  LOCK_STATUS: 'iot/device/+/status',
  DOOR_LOG: 'iot/device/+/log',
  UNLOCK_DOOR_STATUS: 'iot/device/+/opendoor/status',
  LOCK_DOOR_STATUS: 'iot/device/+/lockdoor/status',
  CHANGE_PASS_STATUS: 'iot/device/+/changepass/status',
};
