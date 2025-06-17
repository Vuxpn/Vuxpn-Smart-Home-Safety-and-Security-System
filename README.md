# Smart Home IoT System

A comprehensive smart home system integrated with IoT devices, mobile app, and web dashboard, allowing users to control and monitor home devices remotely.

## Project Structure

The project is divided into 4 main parts:

### 1. Backend (NestJS)

-   Handle authentication and authorization
-   User and home management
-   IoT device management
-   WebSocket for real-time updates
-   MongoDB integration
-   MQTT broker integration
-   Push notification service

Key features:

-   User registration/login with JWT
-   CRUD operations for homes and devices
-   Home member management
-   WebSocket for real-time monitoring
-   Smart lock control and logging
-   Detection history with image storage
-   Gas sensor monitoring
-   Push notifications

### 2. Frontend (React + Vite)

-   User-friendly UI/UX
-   Real-time monitoring dashboard
-   Responsive design
-   State management with Context API

Key features:

-   Home and device management dashboard
-   Real-time sensor monitoring
-   Device control (lights, sensors, smart locks)
-   Member management
-   Detection history with image gallery
-   Authentication and authorization

### 3. Mobile App (React Native + Expo)

-   Cross-platform mobile application
-   Real-time device monitoring
-   Push notifications
-   Intuitive touch interface

Key features:

-   **Authentication & User Management**

    -   Login/Register with JWT
    -   Profile management
    -   Password reset

-   **Home Management**

    -   Create and manage multiple homes
    -   Add/remove home members
    -   Switch between homes

-   **Device Control**

    -   Add new IoT devices
    -   Real-time device status monitoring
    -   Remote device control

-   **Smart Lock Features**

    -   Remote lock/unlock control
    -   Door access history
    -   Password change functionality
    -   Real-time lock status

-   **Security Camera**

    -   Motion detection alerts
    -   Image capture history
    -   Real-time camera feed
    -   Detection sensitivity settings

-   **Gas Sensor Monitoring**

    -   Real-time gas concentration
    -   Temperature monitoring
    -   Alert notifications
    -   Fan control automation

### 4. Hardware (ESP32)

IoT devices developed:

#### ESP32-CAM

-   Image capture and upload to cloud
-   Motion detection with AI
-   MQTT integration
-   LED flash control
-   Real-time streaming

#### Gas Warning System

-   MQ-2 gas sensor integration
-   Temperature and humidity monitoring (DHT22)
-   Gas concentration measurement
-   Automatic fan control
-   LED and buzzer alerts
-   MQTT real-time data transmission

#### Smart Lock System

-   **Keypad input** for password entry
-   **Remote control** via mobile app
-   **Access logging** with timestamps
-   **Emergency unlock** functionality
-   **Password management** (change/reset)

#### PIR Motion Sensor

-   Motion detection
-   LED indicator
-   Buzzer control
-   Configurable timeout
-   Integration with camera system

## Technologies Used

### Backend

-   NestJS
-   MongoDB with Mongoose
-   WebSocket (Socket.io)
-   JWT Authentication
-   MQTT (Mosquitto)
-   Cloudinary (Image storage)
-   Firebase (Push notifications)
-   Swagger API documentation

### Frontend

-   React 18
-   Vite
-   TailwindCSS
-   Ant Design
-   React Router
-   Axios
-   Chart.js for analytics

### Mobile App

-   React Native
-   Expo Framework
-   Expo Router for navigation
-   Zustand for state management
-   React Native Paper (UI components)
-   Expo Notifications
-   AsyncStorage

### Hardware

-   ESP32 microcontroller
-   Arduino IDE
-   MQTT Protocol
-   Various sensors:
    -   PIR Motion Sensor
    -   MQ-2 Gas Sensor
    -   DHT22 Temperature/Humidity
    -   ESP32-CAM module
    -   Servo motors
    -   RFID/NFC modules
    -   RGB LEDs
    -   Buzzers

## Installation & Running

### Backend

```bash
cd Backend
npm install

# Setup environment variables
cp .env.example .env
# Configure MongoDB, JWT secrets, Cloudinary, Firebase

npm run start:dev
```

### Frontend

```bash
cd Frontend/my-project
npm install
npm run dev
```

### Mobile App

```bash
cd AppMobile
npm install

# For iOS
npx pod-install ios
npx expo run:ios

# For Android
npx expo run:android
```

### Hardware

1. Install Arduino IDE
2. Install ESP32 board library
3. Install required libraries:

    - WiFi
    - PubSubClient
    - ArduinoJson
    - ESP32Servo
    - DHT sensor library
    - MFRC522 (for RFID)
    - Keypad library

4. Configure WiFi and MQTT settings in each device code
5. Upload respective codes to ESP32 devices

## Key Features

### 1. Smart Home Management

-   Create/Edit/Delete multiple homes
-   Member management with roles
-   Device monitoring and control
-   Real-time status updates

### 2. Device Management

-   **Smart Lock Control**

    -   Remote lock/unlock via app
    -   Password-based access
    -   RFID card support
    -   Access history logging
    -   Battery status monitoring
    -   Emergency unlock codes

-   **Security Camera System**

    -   Motion detection with alerts
    -   Image capture and storage
    -   Real-time monitoring
    -   Detection history with filtering
    -   Configurable sensitivity

-   **Gas Monitoring**
    -   Real-time gas concentration
    -   Temperature/humidity tracking
    -   Automatic alerts and notifications
    -   Fan control automation

### 3. Security & Safety

-   Motion detection alerts
-   Gas leak warnings
-   Surveillance camera monitoring
-   Access control logging
-   Emergency notifications

### 4. Real-time Monitoring

-   Live sensor data
-   Device status updates
-   Push notifications
-   WebSocket connections
-   MQTT real-time communication

### 5. Mobile Experience

-   Cross-platform compatibility (iOS/Android)
-   Offline capability
-   Push notifications
-   Intuitive UI/UX
-   Touch-friendly controls

## API Endpoints

### Authentication

-   `POST /auth/login` - User login
-   `POST /auth/register` - User registration
-   `POST /auth/refresh` - Refresh token

### Device Management

-   `GET /device/home/:homeId` - Get devices by home
-   `POST /device/create` - Add new device
-   `POST /device/:deviceId/connect` - Connect device
-   `DELETE /device/delete/:deviceId` - Remove device

### Smart Lock

-   `POST /smartlock/:deviceId/lock` - Lock door
-   `POST /smartlock/:deviceId/unlock` - Unlock door
-   `GET /smartlock/:deviceId/status` - Get lock status
-   `GET /smartlock/:deviceId/logs` - Get access logs
-   `POST /smartlock/:deviceId/change-password` - Change lock password

### Detection & Monitoring

-   `GET /detectionwarning/images/:deviceId` - Get detection images
-   `POST /detectionwarning/upload/:deviceId` - Upload detection image
-   `GET /gaswarning/:deviceId/data` - Get gas sensor data

## Security

-   JWT Authentication with refresh tokens
-   Role-based access control
-   Secure WebSocket connections
-   MQTT authentication
-   Password hashing (bcrypt)
-   CORS protection
-   Rate limiting
-   Input validation

## Mobile App Screenshots

### Authentication & Home Management

-   Login/Register screens
-   Home selection and creation
-   Member management

### Device Control

-   Device dashboard
-   Smart lock controls
-   Camera monitoring
-   Gas sensor readings

### Notifications & History

-   Real-time alerts
-   Detection history timeline
-   Access logs
-   Filter by date and device

## Hardware Setup Guide

### Smart Lock Wiring
