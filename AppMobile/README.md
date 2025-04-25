# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
     npx expo start
    ```

In the output, you'll find options to open the app in a

-   [development build](https://docs.expo.dev/develop/development-builds/introduction/)
-   [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
-   [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
-   [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

-   [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
-   [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

-   [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
-   [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# SmartHomeIoT Mobile App

## Overview

SmartHomeIoT is a React Native mobile application built with Expo, TypeScript, NativeWind, and Expo Router. It enables users to manage smart home devices, monitor environmental conditions, and enhance home security. The app supports user authentication, home and device management, smart lock control, gas sensor monitoring, intrusion detection, and real-time data display (temperature, humidity, gas levels). It integrates with a backend server via RESTful APIs, using Expo Router for file-based navigation.

## Features

-   **Authentication**: Register, login, logout, and change password.
-   **Home Management**: Add, edit, and manage multiple homes with real-time data (location, temperature, humidity, gas levels).
-   **Device Management**: Add, control, and monitor devices (gas sensors, intrusion detectors, smart locks).
-   **Gas Sensor Device**: Monitor temperature, humidity, gas levels, adjust alert sensitivity, and trigger alarms/fans.
-   **Intrusion Detector**: Normal mode (lights on detection), Safe mode (alarms), view intrusion history with images and timestamps.
-   **Smart Lock**: Unlock via keypad or app, change passcode, lock/unlock remotely.
-   **UI Components**:
    -   **Home Screen**: Displays home name, real-time data, door control, notifications, and device/camera layouts.
    -   **Device Screen**: Lists devices with detailed controls based on device type.
    -   **Profile Screen**: Manage user information and settings.

## Project Structure

The app follows a modular, scalable structure with TypeScript for type safety, NativeWind for styling, and Expo Router for file-based routing.

```
safe-and-smart-home/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/
│   │   ├── home/
│   │   │   ├── index.tsx
│   │   │   ├── manage-house.tsx
│   │   │   └── house-settings.tsx
│   │   ├── devices/
│   │   │   ├── index.tsx
│   │   │   ├── add-device.tsx
│   │   │   └── [id].tsx
│   │   └── profile/
│   │       ├── index.tsx
│   │       └── edit-profile.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── assets
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx
│   │   └── PasswordInput.tsx
│   ├── devices/
│   │   ├── DeviceCard.tsx
│   │   ├── DeviceList.tsx
│   │   ├── GasDetector/
│   │   │   ├── GasDetectorCard.tsx
│   │   │   └── GasDetectorDetail.tsx
│   │   ├── IntrusionDetector/
│   │   │   ├── IntrusionDetectorCard.tsx
│   │   │   └── IntrusionDetectorDetail.tsx
│   │   └── SmartLock/
│   │       ├── SmartLockCard.tsx
│   │       └── SmartLockDetail.tsx
│   ├── home/
│   │   ├── HomeHeader.tsx
│   │   ├── HouseInfo.tsx
│   │   ├── HouseList.tsx
│   │   └── HouseForm.tsx
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── BottomTabBar.tsx
│   │   └── SafeAreaWrapper.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── constants/
│   ├── colors.ts
│   ├── icons.ts
│   ├── theme.ts
│   └── urls.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useDevice.ts
│   ├── useHouse.ts
│   └── useToast.ts
├── services/
│   ├── api.ts
│   ├── apiClient.ts
│   ├── authService.ts
│   ├── deviceService.ts
│   └── houseService.ts
├── store/
│   ├── authStore.ts
│   ├── deviceStore.ts
│   ├── houseStore.ts
│   └── index.ts
├── types/
│   ├── auth.types.ts
│   ├── device.types.ts
│   ├── house.types.ts
│   └── index.ts
├── utils/
│   ├── formatters.ts
│   ├── storage.ts
│   └── validators.ts
├── app.json
├── metro.config.js
├── babel.config.js
├── expo-env.d.ts
├── nativewind-env.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md

```

## Detailed Description

**app/**
Using Expo Router's file-based routing, this directory contains the main screens of the application:

**(auth)/**: Authentication screen group (login, register, forgot-password)
**(main)/**: Main screens after login, including:

**home/**: Main screen displaying house information and devices
**devices/**: Device management and detailed display for each device type
**profile/**: User information and settings

**components/**
Contains reusable components organized by functionality:

**auth/**: Authentication components (login, register)
**devices/**: Device display components, with subdirectories for each specific device type
**home/**: House information display components
**layout/**: Common layout components
**ui/**: Basic UI components (buttons, inputs, cards...)

**services/**
Contains API calling services:

**apiClient.ts**: Axios configuration and interceptors handling
**authService.ts**: Authentication API calls
**deviceService.ts**: Device management API calls
**houseService.ts**: Smart home management API calls

**store/**
Global state management using Zustand:

**authStore.ts**: Authentication state management
**deviceStore.ts**: Device state management
**houseStore.ts**: Smart home state management

**types/**
Contains TypeScript type definitions:

**auth.types.ts**: Authentication types
**device.types.ts**: Device types
**house.types.ts**: Smart home types

**hooks/**
Contains custom React hooks:

**useAuth.ts**: Authentication handling hook
**useDevice.ts**: Device handling hook
**useHouse.ts**: Smart home handling hook

**utils/**
Contains utility functions:

**formatters.ts**: Data formatting
**storage.ts**: Local storage handling
**validators.ts**: Data validation

## Tech Stack

-   **Expo**: For managed React Native workflow.
-   **Expo Router**: For file-based navigation.
-   **TypeScript**: For type safety and better developer experience.
-   **NativeWind**: For Tailwind CSS-like styling in React Native.
-   **Axios**: For API requests.
-   **React Context**: For state management.
-   **ESLint & Prettier**: For code linting and formatting.
-   **expo-constants**: For environment variable management.
