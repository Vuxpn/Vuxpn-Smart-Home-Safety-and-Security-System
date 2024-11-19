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

  //detection device
  DETECTION_CHANGE_TIME: 'iot/device/detection/timeout',
  DETECTION_CHANGE_MODE: 'iot/device/detection/mode',
};
