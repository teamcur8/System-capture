# Echo Audio Streamer

**Smart Real-Time Call Recorder with User Authentication**

A professional desktop application built with Electron that captures and streams audio in real-time with secure user authentication and native Windows audio capture capabilities.

## 🚀 Quick Start

### For End Users
1. Download `Echo-Audio-Streamer-Setup-1.0.0.exe`
2. Run as Administrator
3. Follow the installation wizard
4. Launch the application and log in

### For Developers
```bash
# Install dependencies
npm install

# Run in development mode
npm run electron

# Build the application
npm run build-electron

# Create installer
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

## ✨ Features

### Core Functionality
- **Real-time Audio Capture** - Microphone and system audio recording
- **WebSocket Streaming** - Live audio streaming to remote servers
- **User Authentication** - Secure login with email/password
- **Native Audio Processing** - WASAPI-based audio capture for Windows
- **Professional UI** - Modern Electron-based interface

### Technical Features
- **Cross-platform Audio** - Microphone and loopback capture
- **Audio Processing** - Downsampling to 16kHz mono
- **Database Integration** - User data storage with MongoDB
- **Error Handling** - Robust error recovery and logging
- **Silent Operation** - No terminal windows during execution

## 💻 System Requirements

### For End Users
- **OS:** Windows 10 or newer (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 150MB free space
- **Network:** Internet connection for authentication and streaming
- **Permissions:** Administrator rights for installation

### For Developers
- **Node.js:** 18.0.0 or newer
- **npm:** Latest version
- **Windows SDK:** For native module compilation
- **NSIS:** For installer creation (optional)

## 📦 Installation

### End User Installation

1. **Download the Installer**
   - Get `Echo-Audio-Streamer-Setup-1.0.0.exe` (134MB)
   - Verify file integrity

2. **Run Installation**
   ```bash
   # Right-click and "Run as Administrator"
   Echo-Audio-Streamer-Setup-1.0.0.exe
   ```

3. **Follow the Wizard**
   - Accept license agreement
   - Choose installation directory (default: `C:\Program Files\Echo Audio Streamer`)
   - Wait for installation to complete
   - Choose to launch application immediately

4. **First Launch**
   - Application opens automatically
   - Enter your email and password
   - Click "Sign In" to authenticate

### Developer Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd systemCapture
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Native Modules**
   ```bash
   npm run rebuild
   ```

4. **Run Development Version**
   ```bash
   npm run electron
   ```

## 🔧 Development

### Project Structure
```
systemCapture/
├── src/                    # Source code
│   ├── main/              # Main process (Electron)
│   ├── renderer/          # Renderer process (UI)
│   ├── native/            # Native C++ modules
│   ├── database/          # Database management
│   └── preload/           # Preload scripts
├── dist/                  # Built application
│   └── win-unpacked/      # Portable version
├── build/                 # Native module builds
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── installer.nsi          # NSIS installer script
└── package.json           # Project configuration
```

### Key Components

#### Main Process (`src/main/main.js`)
- Electron application lifecycle
- IPC communication with renderer
- WebSocket connection management
- Audio capture coordination
- User authentication handling

#### Renderer Process (`src/renderer/`)
- Login interface (`pages/login.html/js`)
- Main application interface (`pages/main.html/js`)
- Real-time status updates
- User interaction handling

#### Native Modules (`src/native/`)
- **wasapi_capture.cpp** - Windows audio capture
- **binding.gyp** - Node.js addon configuration
- **index.js** - JavaScript wrapper

#### Database (`src/database/`)
- **database-manager.js** - MongoDB connection and operations
- User data persistence
- Session management

### Development Commands

```bash
# Development
npm run electron              # Run in development mode
npm run electron-dev          # Run with dev flags

# Building
npm run build-native          # Build native modules
npm run rebuild               # Rebuild all native modules
npm run build-electron        # Build with electron-builder
npm run dist                  # Create distributable

# Testing
npm run test                  # Run test suite
npm run test-mic              # Test microphone capture
npm run test-loopback         # Test system audio capture
npm run test-login            # Test authentication API
npm run test-database         # Test database connection

# Utilities
npm run clean                 # Clean build artifacts
npm run configure             # Configure native modules
npm run docs                  # Generate documentation
```

## 🏗️ Building

### Building the Application

1. **Build Native Modules**
   ```bash
   npm run rebuild
   ```

2. **Build Electron App**
   ```bash
   npm run build-electron
   ```

3. **Create Portable Version**
   ```bash
   npm run dist
   ```

### Creating the Installer

1. **Install NSIS** (if not already installed)
   - Download from: https://nsis.sourceforge.io/
   - Install with "Add to PATH" option
   - Restart computer

2. **Build Installer**
   ```bash
   E:\NSIS\makensis.exe installer.nsi
   ```

3. **Result**
   - Creates: `Echo-Audio-Streamer-Setup-1.0.0.exe`
   - Size: ~134MB
   - Ready for distribution

## 📤 Distribution

### What to Share
- **File:** `Echo-Audio-Streamer-Setup-1.0.0.exe`
- **Size:** 134MB
- **Type:** Self-contained Windows installer

### Distribution Methods
- **Email:** Attach installer file
- **Cloud Storage:** Google Drive, OneDrive, Dropbox
- **File Sharing:** WeTransfer, MediaFire
- **USB Drive:** Copy installer
- **Network Share:** Place on shared folder

### Installation Instructions for Users
1. Download the installer
2. Right-click → "Run as Administrator"
3. Follow the installation wizard
4. Application launches automatically
5. Log in with credentials

## 🏛️ Architecture

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (Electron)
- **Backend:** Node.js with Electron main process
- **Native:** C++ with Node.js addons
- **Database:** MongoDB
- **Audio:** Windows WASAPI
- **Networking:** WebSocket for real-time streaming
- **Authentication:** REST API with HTTPS

### Audio Processing Pipeline
```
Microphone/System Audio
         ↓
   WASAPI Capture
         ↓
   Native C++ Module
         ↓
   JavaScript Processing
         ↓
   Downsampling (16kHz mono)
         ↓
   WebSocket Streaming
         ↓
   Remote Server
```

### Security Features
- **HTTPS Authentication** - Secure login API
- **Context Isolation** - Electron security model
- **Input Validation** - Client and server-side validation
- **Error Handling** - Graceful failure recovery

## 🔍 Troubleshooting

### Common Issues

#### Installation Problems
**Issue:** "Access Denied" during installation
- **Solution:** Run installer as Administrator

**Issue:** "Application files are missing"
- **Solution:** Re-download the installer

**Issue:** Antivirus blocks installation
- **Solution:** Add to antivirus exclusions

#### Runtime Problems
**Issue:** Application doesn't start
- **Solution:** Check Windows version (requires Windows 10+)

**Issue:** Audio not capturing
- **Solution:** Check microphone permissions and audio drivers

**Issue:** Login fails
- **Solution:** Verify internet connection and credentials

**Issue:** WebSocket connection fails
- **Solution:** Check firewall settings and network connectivity

### Debug Mode
```bash
# Run with debug logging
npm run electron-dev

# Check logs in:
# %LOCALAPPDATA%\Echo Audio Streamer\logs\
```

### System Requirements Check
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Windows version
winver
```

## 📚 API Documentation

### Authentication API
- **Endpoint:** `https://transform.cur8.in/webservice/rest/server.php`
- **Method:** POST
- **Parameters:** email, password
- **Response:** User data with authentication status

### WebSocket Streaming
- **URL:** `wss://omrealtime.cur8.in/ws/audio-stream`
- **Protocol:** Binary audio data
- **Format:** 16kHz mono PCM
- **Authentication:** Query parameters with user data

### Database Schema
```javascript
// User Data Structure
{
  user_id: String,
  manager_id: String,
  company_id: String,
  team_id: String,
  full_name: String,
  email: String,
  region: String
}
```

## 📄 License

**Proprietary Software**

This software is proprietary and confidential. All rights reserved.

- **Copyright:** Echo Development Team
- **Version:** 1.0.0
- **Distribution:** Controlled

## 🤝 Support

### For End Users
- Check the troubleshooting section above
- Verify system requirements
- Contact support with error details

### For Developers
- Review the development documentation
- Check the API documentation
- Test with debug mode enabled

### Contact Information
- **Repository:** https://github.com/echo/audio-streamer.git
- **Issues:** https://github.com/echo/audio-streamer/issues
- **Documentation:** See `docs/` folder

---

**Echo Audio Streamer v1.0.0** - Professional Real-Time Audio Streaming Solution
