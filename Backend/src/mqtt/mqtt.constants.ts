// mqtt.constants.ts
export const MQTT_TOPICS = {
  //Create device
  CREATEDEVICE: 'iot/device/create',
  //Handle response device
  RESPONSEDEVICE: 'iot/device/+/response',
  //Connect device
  CONNECTDEVICE: 'iot/device/connect',
  // Sensor data (ESP32 -> Server)
  TEMPERATURE: `iot/device//temperature`,
  HUMIDITY: `iot/device//humidity`,
  GASLEVEL: `iot/device//gaslevel`,

  // Warning control (Server -> ESP32)
  WARNING_CONTROL: 'iot/warning/control',

  // Warning status (ESP32 -> Server)
  WARNING_STATUS: 'iot/warning/status',
};
