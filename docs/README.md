# Echo - Smart Real-Time Call Recorder

A professional desktop application for real-time audio streaming with user authentication, built with Electron and native Windows audio capture.

## 🎯 Features

- **Real-time Audio Streaming**: Capture and stream microphone and system audio simultaneously
- **User Authentication**: Secure login system with MongoDB integration
- **Professional UI**: Modern, responsive desktop interface
- **Native Performance**: C++ addon for low-latency Windows audio capture (WASAPI)
- **WebSocket Communication**: Real-time streaming to remote servers
- **Cross-platform**: Built with Electron for Windows, macOS, and Linux support

## 📁 Project Structure

```
systemCapture/
├── src/
│   ├── main/                    # Electron main process
│   │   └── main.js             # Main electron process
│   │
│   ├── renderer/               # Electron renderer process
│   │   ├── pages/
│   │   │   ├── main.html       # Main application page
│   │   │   ├── main.js         # Main page script
│   │   │   ├── login.html      # Login page
│   │   │   └── login.js        # Login page script
│   │   └── styles/
│   │       └── main.css        # Application styles
│   │
│   ├── preload/                # Preload scripts
│   │   ├── main-preload.js     # Main window preload
│   │   └── login-preload.js    # Login window preload
│   │
│   ├── database/               # Database management
│   │   └── database-manager.js # MongoDB manager
│   │
│   ├── native/                 # Native C++ addon
│   │   ├── index.js           # Native addon interface
│   │   ├── wasapi_capture.cpp # WASAPI audio capture
│   │   └── binding.gyp        # Build configuration
│   │
│   └── assets/                 # Static assets
│       ├── logo.png           # Application logo
│       └── logo.ico           # Application icon
│
├── scripts/                    # Build and utility scripts
│   ├── audio-streamer.js      # CLI audio streaming
│   ├── realtime-ws-stream.js  # Real-time streaming
│   └── test/                  # Test scripts
│       ├── test-mic-only.js
│       ├── test-mic-loopback.js
│       └── test-login-api.js
│
├── docs/                       # Documentation
│   ├── README.md              # This file
│   ├── API.md                 # API documentation
│   ├── SETUP.md               # Setup instructions
│   └── TROUBLESHOOTING.md     # Troubleshooting guide
│
├── build/                      # Native addon build
│   └── Release/
│       └── wasapi_capture.node
│
├── dist/                       # Build outputs
├── node_modules/               # Dependencies
├── package.json               # Project configuration
└── .gitignore                 # Git ignore file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (for native addon compilation)
- **Visual Studio Build Tools** (Windows)
- **MongoDB** (for user data storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd systemCapture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build native addon**
   ```bash
   npm run build-native
   ```

4. **Start the application**
   ```bash
   npm run electron
   ```

## 🛠️ Development

### Available Scripts

- `npm run electron` - Start Electron application
- `npm run electron-dev` - Start in development mode
- `npm run build-native` - Build native C++ addon
- `npm run build-electron` - Build distributable
- `npm run test-mic` - Test microphone capture
- `npm run test-loopback` - Test system audio capture

### Building for Distribution

```bash
# Build Windows executable
npm run build-electron

# Build portable executable
npm run build-exe
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Set to 'development' for debug logging
- `MONGODB_URI` - MongoDB connection string
- `WS_SERVER_URL` - WebSocket server URL

### Audio Settings

The application captures audio at:
- **Sample Rate**: 16kHz (downsampled from source)
- **Channels**: Mono (converted from stereo)
- **Bit Depth**: 16-bit PCM
- **Format**: Raw binary data

## 🔐 Authentication

The application uses a two-step authentication process:

1. **User Lookup**: Retrieves user details by email
2. **Password Verification**: Validates credentials with server

### API Endpoints

- `GET /local_learningnudges_get_user_managerid_by_email` - User lookup
- `POST /local_courses_get_user_details_data` - Password verification

## 📡 WebSocket Communication

Audio data is streamed to: `wss://omrealtime.cur8.in/ws/audio-stream`

### URL Parameters

- `user_id` - User email
- `manager_id` - Manager ID
- `company_id` - Company ID
- `team_id` - Team ID
- `full_name` - User's full name

## 🗄️ Database

MongoDB is used for storing user data with the following collections:

- `users` - User authentication and profile data

### Database Schema

```javascript
{
  email: String,
  full_name: String,
  manager_id: String,
  company_id: String,
  team_id: String,
  created_at: Date,
  updated_at: Date
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Audio Capture Fails**
   - Check microphone permissions
   - Verify audio drivers are installed
   - Run `npm run test-mic` to debug

2. **Build Errors**
   - Install Visual Studio Build Tools
   - Ensure Python is in PATH
   - Run `npm run build-native`

3. **WebSocket Connection Issues**
   - Check network connectivity
   - Verify server URL is correct
   - Check authentication credentials

### Performance Optimization

- **Memory Usage**: Application typically uses 100-300MB RAM
- **CPU Usage**: Audio processing uses 5-15% CPU
- **Network**: Streaming uses ~64kbps per audio stream

## 📝 API Documentation

See [API.md](API.md) for detailed API documentation.

## 🔧 Setup Guide

See [SETUP.md](SETUP.md) for detailed setup instructions.

## 🆘 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

---

**Echo - Smart Real-Time Call Recorder**  
Version: 1.0.0  
Built with ❤️ using Electron and Node.js
