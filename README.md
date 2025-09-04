# Echo Audio Streamer

**Smart Real-Time Call Recorder with User Authentication**

A professional desktop application built with **Electron** that captures and streams audio in real-time with secure user authentication and native Windows audio capture capabilities using **WASAPI**, streams via **WebSockets**, and manages user data with **MongoDB**.

## 🚀 Quick Start

### For End Users
1. Download `Echo-Audio-Streamer-Setup-1.0.0.exe`
2. Run as Administrator
3. Follow the installation wizard
4. Launch the application and log in

### For Developers
```bash
# 1. Install dependencies
npm install

# 2. Build native modules (essential for audio capture)
npm run build-native

# 3. Run in development mode
npm run electron

# 4. Build the distributable application (optional)
npm run build-electron

# 5. Create installer (optional, requires NSIS)
E:\NSIS\makensis.exe installer.nsi
```

## 📋 Table of Contents

- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Development](#-development)
- [Building](#-building)
- [Distribution](#-distribution)
- [Architecture](#-architecture)
- [Troubleshooting](#-troubleshooting)
- [API Documentation](#-api-documentation)
- [License](#-license)
- [Support](#-support)

## ✨ Features

### Core Functionality
- **Real-time Audio Capture**: Captures both microphone input and system audio (loopback) in real-time.
- **WebSocket Streaming**: Streams live audio data securely to remote servers via WebSockets.
- **User Authentication**: Provides secure login functionality with email/password, integrating with a backend authentication API.
- **Native Audio Processing**: Utilizes Windows Audio Session API (WASAPI) for high-performance, low-latency audio capture directly from the operating system.
- **Professional UI**: Features a modern and intuitive user interface built with Electron, providing a seamless desktop experience.

### Technical Features
- **Cross-platform Audio**: While WASAPI is Windows-specific, the architecture allows for potential future expansion to other platforms.
- **Audio Processing**: Includes downsampling of captured audio to 16kHz mono PCM format, optimizing for streaming efficiency.
- **Database Integration**: Stores user session data and preferences using MongoDB.
- **Error Handling**: Implements robust error recovery and logging mechanisms for stability.
- **Silent Operation**: Designed to run without intrusive terminal windows during execution.

## 💻 System Requirements

### For End Users
- **OS:** Windows 10 or newer (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 150MB free space
- **Network:** Stable internet connection for authentication and streaming
- **Permissions:** Administrator rights are required for installation

### For Developers
- **Node.js:** 18.0.0 or newer
- **npm:** Latest version
- **Windows SDK:** Required for compiling native C++ modules (e.g., Visual Studio Build Tools with Desktop development with C++ workload).
- **NSIS:** For creating the Windows installer (optional, download from [nsis.sourceforge.io](https://nsis.sourceforge.io/)).

## 📦 Installation

### End User Installation

1.  **Download the Installer**: Obtain the latest `Echo-Audio-Streamer-Setup-1.0.0.exe` from the distribution source.
2.  **Run Installation**: Right-click the installer and select "Run as Administrator" to ensure proper permissions.
3.  **Follow the Wizard**: Proceed through the installation steps, accepting the license agreement and choosing the installation directory (default: `C:\Program Files\Echo Audio Streamer`).
4.  **First Launch**: The application will open automatically after installation. Enter your registered email and password, then click "Sign In" to authenticate.

### Developer Installation

1.  **Clone Repository**:
    ```bash
    git clone <repository-url>
    cd systemCapture
    ```
2.  **Install Dependencies**: This command installs all Node.js packages listed in `package.json`.
    ```bash
    npm install
    ```
3.  **Build Native Modules**: This step is crucial for the WASAPI audio capture functionality. It compiles the C++ addon for your specific Node.js and Electron environment.
    ```bash
    npm run build-native
    ```
    *Ensure you have the [Windows SDK / Visual Studio Build Tools](#-system-requirements) installed for this step to succeed.*
4.  **Run Development Version**: Launches the Electron application in development mode, allowing for live changes and debugging.
    ```bash
    npm run electron
    ```

## 🔧 Development

### Project Structure
The project follows a standard Electron application structure, separating main and renderer processes, and organizing native modules and utilities.

```
systemCapture/
├── src/                    # Main source code directory
│   ├── main/              # Electron Main Process code (Node.js environment)
│   │   └── main.js        # Main entry point, handles app lifecycle, IPC, WebSockets, auth
│   ├── renderer/          # Electron Renderer Process code (Browser environment)
│   │   ├── pages/         # HTML and JavaScript for UI pages (login, main app)
│   │   └── styles/        # CSS stylesheets for the UI
│   ├── native/            # Native C++ modules and their JavaScript wrappers
│   │   ├── wasapi_capture.cpp # C++ implementation of WASAPI audio capture
│   │   ├── binding.gyp    # Node-GYP configuration for compiling the C++ module
│   │   └── index.js       # JavaScript wrapper for the native module, handles loading
│   ├── database/          # Database management logic
│   │   └── database-manager.js # Handles MongoDB connection and user data persistence
│   └── preload/           # Preload scripts for secure IPC communication
│       ├── login-preload.js # Preload script for the login window
│       └── main-preload.js  # Preload script for the main application window
├── dist/                  # Output directory for built Electron applications
│   └── win-unpacked/      # Contains the portable version of the application
├── build/                 # Build artifacts, including compiled native modules and icons
│   └── icon.ico           # Application icon generated from logo.png
├── scripts/               # Utility scripts for various development tasks
│   ├── audio-streamer.js  # Script for standalone audio streaming (if applicable)
│   ├── generate-ico.js    # Script to generate icon.ico from logo.png
│   └── realtime-ws-stream.js # Script for real-time WebSocket streaming (if applicable)
├── docs/                  # Project documentation
├── installer.nsi          # NSIS installer script for creating the setup.exe
└── package.json           # Project metadata, dependencies, and npm scripts
```

### Key Components

#### Main Process (`src/main/main.js`)
The Electron Main Process runs in a Node.js environment and acts as the application's backend. It is responsible for:
-   Managing the Electron application lifecycle (e.g., app ready, window-all-closed).
-   Creating and managing `BrowserWindow` instances (login and main windows).
-   Handling Inter-Process Communication (IPC) with the renderer processes.
-   Establishing and managing WebSocket connections for audio streaming.
-   Coordinating native audio capture (microphone and system audio).
-   Handling user authentication logic and interacting with the database.

#### Renderer Process (`src/renderer/`)
The Electron Renderer Process runs in a browser-like environment and is responsible for the application's user interface.
-   Renders the HTML pages (`login.html`, `main.html`).
-   Manages user interactions and UI state.
-   Communicates with the Main Process via IPC to request data or trigger actions (e.g., login, start/stop streaming).

#### Native Modules (`src/native/`)
This directory contains the platform-specific C++ code for high-performance audio capture and its Node.js binding.
-   **`wasapi_capture.cpp`**: Implements the core audio capture logic using the Windows Audio Session API (WASAPI). It directly interfaces with Windows audio devices for efficient microphone and loopback capture.
-   **`binding.gyp`**: A configuration file used by `node-gyp` to compile the C++ source code into a Node.js addon (`.node` file).
-   **`index.js`**: A JavaScript wrapper that loads the compiled native module (`wasapi_capture.node`) and exposes its functions (e.g., `startMicCapture`, `startLoopbackCapture`) to the rest of the Node.js application. It includes logic to load the module correctly in both development and packaged environments.

#### Database (`src/database/database-manager.js`)
Manages the application's interaction with the MongoDB database.
-   Handles connection to the MongoDB server.
-   Provides functions for user data persistence and session management.

#### Preload Scripts (`src/preload/`)
These scripts run before the renderer process's web content loads, but after the global objects are available. They are crucial for securely exposing Node.js APIs to the renderer process without enabling `nodeIntegration` in the renderer, enhancing security through Context Isolation.

### Development Commands

-   `npm install`: Installs all project dependencies (Node.js modules).
-   `npm run rebuild`: Rebuilds all native modules for the current Node.js environment.
-   `npm run clean`: Removes build artifacts.
-   `npm run configure`: Configures native modules using `node-gyp`.
-   `npm run build`: Builds native modules.
-   `npm run build-native`: Specifically navigates to `src/native` and rebuilds the WASAPI native module. This is the recommended way to ensure the audio capture module is compiled correctly.
-   `npm run build-exe`: Uses `pkg` to build a standalone executable from `scripts/audio-streamer.js` (separate from Electron build).
-   `npm run start`: Runs `scripts/realtime-ws-stream.js` (likely a standalone WebSocket streaming script).
-   `npm run test`: Runs the project's test suite.
-   `npm run test-mic`: Tests microphone capture functionality.
-   `npm run test-loopback`: Tests system audio capture functionality.
-   `npm run test-login`: Tests the authentication API.
-   `npm run test-database`: Tests the database connection.
-   `npm run electron`: Runs the Electron application in development mode.
-   `npm run electron-dev`: Runs the Electron application in development mode with additional development flags (e.g., opening DevTools).
-   `npm run build-electron`: Uses `electron-builder` to package the Electron application into a distributable format (e.g., portable `.exe`).
-   `npm run generate-icon`: Generates the `build/icon.ico` file from `src/assets/logo.png` for use in the application and installer.
-   `npm run dist`: Creates the final distributable package, typically including the portable `.exe` and preparing for installer creation.
-   `npm run docs`: Placeholder command, indicates documentation is in the `docs/` folder.

## 🏗️ Building

### Building the Application

The application can be built into a portable executable using `electron-builder`. This process embeds all necessary files, including the native module and application icon.

1.  **Ensure Native Modules are Built**: Before building the Electron app, make sure the native WASAPI module is compiled.
    ```bash
    npm run build-native
    ```
2.  **Build Electron App**: This command packages the application into a portable `.exe` file. The `build/icon.ico` will be embedded into the executable.
    ```bash
    npm run build-electron
    ```
    *Result*: A portable executable (e.g., `Echo-Audio-Streamer-Portable-1.0.0.exe`) will be created in the `dist/` directory.

### Creating the Installer

A Windows installer (`.exe`) can be created using NSIS (Nullsoft Scriptable Install System). This installer will bundle the portable Electron application and provide a guided installation experience.

1.  **Install NSIS**: If not already installed, download and install NSIS from [nsis.sourceforge.io](https://nsis.sourceforge.io/). Ensure "Add to PATH" is selected during installation.
2.  **Generate Application Icon**: Ensure `build/icon.ico` exists, as it's used by the installer for its icon and desktop shortcuts.
    ```bash
    npm run generate-icon
    ```
3.  **Build Installer**: Execute the NSIS script.
    ```bash
    E:\NSIS\makensis.exe installer.nsi
    ```
    *Result*: A self-contained Windows installer (e.g., `Echo-Audio-Streamer-Setup-1.0.0.exe`) will be created in the project root directory.

## 📤 Distribution

### What to Share
-   **Installer**: `Echo-Audio-Streamer-Setup-1.0.0.exe` (recommended for end-users)
-   **Portable Version**: `Echo-Audio-Streamer-Portable-1.0.0.exe` (located in `dist/`, for advanced users or testing)

### Distribution Methods
-   Email, Cloud Storage (Google Drive, OneDrive, Dropbox), File Sharing services (WeTransfer), USB Drive, Network Share.

### Installation Instructions for Users
1.  Download the installer (`Echo-Audio-Streamer-Setup-1.0.0.exe`).
2.  Right-click the installer and select "Run as Administrator".
3.  Follow the on-screen instructions in the installation wizard.
4.  The application will launch automatically upon successful installation.
5.  Log in with your credentials.

## 🏛️ Architecture

### Technology Stack
-   **Frontend:** HTML5, CSS3, JavaScript (Electron Renderer Process)
-   **Backend:** Node.js (Electron Main Process)
-   **Native:** C++ with Node.js addons (WASAPI for Windows audio)
-   **Database:** MongoDB (for user data persistence)
-   **Audio:** Windows WASAPI (Windows Audio Session API)
-   **Networking:** WebSocket (for real-time audio streaming), HTTPS (for authentication API)
-   **Authentication:** REST API

### Overall Application Flow
```
+-------------------+       +-------------------+       +-------------------+
|   User Login      |       |   Main Window     |       |   Audio Capture   |
| (Login Window)    |       | (Main Window)     |       | (Native Module)   |
+-------------------+       +-------------------+       +-------------------+
        |                           ^       |                   ^
        | (Credentials)             |       | (Start/Stop)      |
        v                           |       |                   |
+-------------------+       +-------------------+       +-------------------+
| Authentication    |<----->|   Main Process    |<----->| WebSocket Stream  |
| API (HTTPS)       |       | (Electron Backend)|       | (Remote Server)   |
+-------------------+       +-------------------+       +-------------------+
        |                           ^       |
        | (User Data)               |       | (Audio Data)
        v                           |       |
+-------------------+               +-------------------+
|   MongoDB         |               |   Renderer Process|
| (User Data Storage)|               | (UI Display)      |
+-------------------+               +-------------------+
```

### Authentication Flow
```
+-------------------+
|   User Enters     |
| Email & Password  |
| (Login Window)    |
+-------------------+
        |
        | 1. IPC: 'perform-login'
        v
+-------------------+
|   Main Process    |
| (main.js)         |
+-------------------+
        |
        | 2. HTTPS Request (User Lookup)
        v
+-------------------+
| Authentication    |
| API (transform.cur8.in)|
+-------------------+
        |
        | 3. HTTPS Request (Password Verify)
        v
+-------------------+
| Authentication    |
| API (transform.cur8.in)|
+-------------------+
        |
        | 4. Response (User Data)
        v
+-------------------+
|   Main Process    |
| (main.js)         |
+-------------------+
        |
        | 5. Save User Data (MongoDB)
        v
+-------------------+
|   Database        |
| (database-manager.js)|
+-------------------+
        |
        | 6. IPC: 'login-success' / 'login-fail'
        v
+-------------------+
|   Login Window    |
| (login.js)        |
+-------------------+
        |
        | 7. Close Login Window, Open Main Window
        v
+-------------------+
|   Main Window     |
| (main.js)         |
+-------------------+
```

### Audio Processing Pipeline
```
Microphone/System Audio (WASAPI)
         ↓
   Native C++ Module (wasapi_capture.cpp)
         ↓
   JavaScript Wrapper (src/native/index.js)
         ↓
   Main Process (src/main/main.js)
         ↓
   Downsampling (16kHz mono PCM)
         ↓
   WebSocket Streaming
         ↓
   Remote Server
```

### Security Features
-   **HTTPS Authentication**: All authentication API calls are made over HTTPS for secure credential transmission.
-   **Context Isolation**: Electron's security feature that prevents the renderer process from directly accessing Node.js APIs, enhancing security. Preload scripts are used for secure communication.
-   **Input Validation**: Implemented on both client and server sides to prevent common vulnerabilities.
-   **Error Handling**: Graceful error handling and logging to prevent crashes and aid debugging.

## 🔍 Troubleshooting

### Common Issues

#### Installation Problems
-   **Issue:** "Access Denied" during installation.
    -   **Solution:** Right-click the installer and select "Run as Administrator".
-   **Issue:** "Application files are missing" or installer corrupted.
    -   **Solution:** Re-download the installer from a reliable source.
-   **Issue:** Antivirus software blocks installation or execution.
    -   **Solution:** Temporarily disable your antivirus or add the application to its exclusion list.

#### Runtime Problems
-   **Issue:** Application doesn't start or crashes immediately.
    -   **Solution:** Ensure your operating system is Windows 10 or newer (64-bit). Check system logs for more details.
-   **Issue:** Audio not capturing (microphone or system audio).
    -   **Solution:**
        -   Verify microphone permissions in Windows privacy settings.
        -   Ensure audio drivers are up to date.
        -   Check if another application is exclusively using the audio device.
-   **Issue:** Login fails.
    -   **Solution:**
        -   Verify your internet connection.
        -   Double-check your email and password for typos.
        -   Ensure the authentication server is reachable.
-   **Issue:** WebSocket connection fails or streaming is interrupted.
    -   **Solution:**
        -   Check your internet connection.
        -   Verify firewall settings are not blocking the WebSocket connection (port 443 for WSS).
        -   Ensure the WebSocket server (`wss://devreal.darwix.ai`) is operational.
        -   Try the "Reconnect" button in the application.
-   **Issue:** MongoDB connection error (e.g., `ETIMEDOUT`).
    -   **Solution:** This indicates a problem connecting to the MongoDB server.
        -   Verify network connectivity to `3.111.215.244` on port `27017`.
        -   Ensure the MongoDB server is running and accessible from your network.
        -   Check for any firewall rules blocking outbound connections to the MongoDB server.

### Debug Mode
To get more detailed logs and debug information, run the application in development mode with dev flags:
```bash
npm run electron-dev
```
Logs can typically be found in: `%LOCALAPPDATA%\Echo Audio Streamer\logs\`

### System Requirements Check
You can verify your system's environment:
```bash
node --version   # Check Node.js version
npm --version    # Check npm version
winver           # Check Windows version
```

## 📚 API Documentation

### Authentication API
-   **Endpoint:** `https://transform.cur8.in/webservice/rest/server.php`
-   **Method:** POST (for password verification), GET (for user lookup)
-   **Parameters:** `email`, `password` (for POST), `wstoken`, `wsfunction`, `moodlewsrestformat`, `email` (for GET)
-   **Response:** User data with authentication status.

### WebSocket Streaming
-   **URL:** `wss://devreal.darwix.ai/ws/audio-stream`
-   **Protocol:** Binary audio data
-   **Format:** 16kHz mono PCM
-   **Authentication:** Query parameters appended to the URL with user data (`user_id`, `manager_id`, `company_id`, `team_id`, `full_name`, `region`).

### Database Schema
```javascript
// User Data Structure stored in MongoDB
{
  user_id: String,    // User's email
  manager_id: String, // ID of the user's manager
  company_id: String, // ID of the user's company
  team_id: String,    // ID of the user's team
  full_name: String,  // Full name of the user
  email: String,      // User's email address
  region: String      // User's region (e.g., "east")
}
```

## 📄 License

**Proprietary Software**

This software is proprietary and confidential. All rights reserved.

-   **Copyright:** Echo Development Team
-   **Version:** 1.0.0
-   **Distribution:** Controlled

## 🤝 Support

### For End Users
-   Refer to the [Troubleshooting](#-troubleshooting) section for common issues.
-   Verify your system meets the [System Requirements](#-system-requirements).
-   Contact support with detailed error descriptions if issues persist.

### For Developers
-   Review the [Development](#-development) and [Building](#-building) sections.
-   Consult the [API Documentation](#-api-documentation).
-   Utilize [Debug Mode](#debug-mode) for in-depth analysis.

### Contact Information
-   **Repository:** [https://github.com/echo/audio-streamer.git](https://github.com/echo/audio-streamer.git)
-   **Issues:** [https://github.com/echo/audio-streamer/issues](https://github.com/echo/audio-streamer/issues)
-   **Documentation:** See the `docs/` folder for additional documentation.

---

**Echo Audio Streamer v1.0.0** - Professional Real-Time Audio Streaming Solution
Solution
Solution