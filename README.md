# Smart Home IoT System

A smart home system integrated with IoT devices, allowing users to control and monitor home devices.

## Project Structure

The project is divided into 3 main parts:

### 1. Backend (NestJS)

-   Handle authentication and authorization
-   User and home management
-   IoT device management
-   WebSocket for real-time updates
-   MongoDB integration

Key features:

-   User registration/login
-   CRUD operations for homes and devices
-   Home member management
-   WebSocket for real-time monitoring
-   JWT authentication

### 2. Frontend (React + Vite)

-   User-friendly UI/UX
-   Real-time monitoring dashboard
-   Responsive design
-   State management with Context API

Key features:

-   Home and device management dashboard
-   Real-time sensor monitoring
-   Device control (lights, sensors, etc.)
-   Member management
-   Authentication and authorization

### 3. Hardware (ESP32)

IoT devices developed:

#### ESP32-CAM

-   Image capture and upload
-   Motion detection
-   MQTT integration

#### Gas Warning System

-   Gas concentration measurement
-   Temperature warning
-   Real-time monitoring
-   MQTT integration

#### LED Control

-   LED control via MQTT
-   Status reporting
-   Remote control

#### PIR Motion Sensor

-   Motion detection
-   LED indicator
-   Buzzer control
-   Configurable timeout

## Technologies Used

### Backend

-   NestJS
-   MongoDB
-   WebSocket
-   JWT Authentication
-   MQTT

### Frontend

-   React
-   Vite
-   TailwindCSS
-   Ant Design
-   React Router
-   Axios

### Hardware

-   ESP32
-   Arduino IDE
-   MQTT Protocol
-   Various sensors (PIR, Gas, Temperature)

## Installation & Running

### Backend

```bash
cd Backend
npm install
npm run start:dev
```

### Frontend

```bash
cd Frontend/my-project
npm install
npm run dev
```

### Hardware

1. Install Arduino IDE
2. Install ESP32 board library
3. Install required libraries:
    - WiFi
    - PubSubClient
    - ArduinoJson
    - ESP32Servo
    - DHT

## Key Features

1. Smart Home Management

    - Create/Edit/Delete homes
    - Member management
    - Device monitoring

2. Device Management

    - Add/Remove devices
    - Device control
    - Status monitoring

3. Security

    - Motion detection
    - Gas warning
    - Surveillance camera

4. Real-time monitoring
    - Temperature
    - Gas concentration
    - Device status

## Security

-   JWT Authentication
-   Role-based access control
-   Secure WebSocket connections
-   MQTT authentication

## Contributing

Please read [CONTRIBUTING.md] for details on our contribution process.

## License

[MIT License](LICENSE)
