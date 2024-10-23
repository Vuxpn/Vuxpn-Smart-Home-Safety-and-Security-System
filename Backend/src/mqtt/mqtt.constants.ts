// mqtt.constants.ts
export const MQTT_TOPICS = {
  //Connect device
  DEVICE: 'iot/device/gas/connect',
  // Sensor data (ESP32 -> Server)
  TEMPERATURE: 'iot/temperature',
  HUMIDITY: 'iot/humidity',
  GASLEVEL: 'iot/gaslevel',

  // Warning control (Server -> ESP32)
  WARNING_CONTROL: 'iot/warning/control',

  // Warning status (ESP32 -> Server)
  WARNING_STATUS: 'iot/warning/status',
};
