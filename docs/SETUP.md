# Setup Guide - Echo Audio Streamer

This guide will walk you through setting up the Echo Audio Streamer application on your system.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v16.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (v3.7 or higher)
   - Download from: https://www.python.org/
   - Verify installation: `python --version`
   - Ensure Python is added to PATH

3. **Visual Studio Build Tools** (Windows only)
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Install "Build Tools for Visual Studio"
   - Include "C++ build tools" and "Windows 10 SDK"

4. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud service)

### System Requirements

- **OS**: Windows 10/11 (primary), macOS 10.14+, Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Audio**: Working microphone and speakers/headphones
- **Network**: Stable internet connection

## 🚀 Installation Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd systemCapture
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build Native Addon

```bash
npm run build-native
```

**Note**: This step requires Visual Studio Build Tools on Windows.

### Step 4: Configure Environment

Create a `.env` file in the root directory:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/echo
WS_SERVER_URL=wss://omrealtime.cur8.in/ws/audio-stream
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

**MongoDB Atlas:**
- Create account at https://www.mongodb.com/atlas
- Create cluster and get connection string
- Update `MONGODB_URI` in `.env`

### Step 6: Test Installation

```bash
# Test microphone capture
npm run test-mic

# Test system audio capture
npm run test-loopback

# Test login API
npm run test-login
```

### Step 7: Start Application

```bash
npm run electron
```

## 🔧 Configuration

### Audio Settings

The application automatically configures audio capture:

- **Sample Rate**: 16kHz (downsampled from source)
- **Channels**: Mono (converted from stereo)
- **Bit Depth**: 16-bit PCM
- **Buffer Size**: Optimized for low latency

### Network Configuration

- **WebSocket Server**: `wss://omrealtime.cur8.in/ws/audio-stream`
- **API Server**: `https://transform.cur8.in/webservice/rest/server.php`
- **Timeout**: 30 seconds for connections

### Database Configuration

**MongoDB Connection String Format:**
```
mongodb://[username:password@]host[:port]/database
```

**Example:**
```
mongodb://localhost:27017/echo
mongodb+srv://user:pass@cluster.mongodb.net/echo
```

## 🧪 Testing

### Audio Tests

1. **Microphone Test**
   ```bash
   npm run test-mic
   ```
   - Records 30 seconds of microphone audio
   - Saves to `test-mic-output.wav`
   - Checks audio levels and microphone indicator

2. **System Audio Test**
   ```bash
   npm run test-loopback
   ```
   - Records 30 seconds of system audio
   - Saves to `test-loopback-output.wav`
   - Verifies loopback capture functionality

3. **Combined Test**
   ```bash
   npm run test-combined
   ```
   - Tests both microphone and system audio
   - Verifies simultaneous capture

### API Tests

1. **Login API Test**
   ```bash
   npm run test-login
   ```
   - Tests user authentication
   - Verifies API endpoints
   - Checks response formats

2. **Database Test**
   ```bash
   npm run test-database
   ```
   - Tests MongoDB connection
   - Verifies user data storage
   - Checks data retrieval

## 🐛 Troubleshooting

### Common Setup Issues

1. **Node-gyp Build Fails**
   ```bash
   # Install Windows Build Tools
   npm install --global windows-build-tools

   # Or use node-gyp directly
   npm install -g node-gyp
   node-gyp rebuild
   ```

2. **Python Not Found**
   ```bash
   # Set Python path
   npm config set python python3

   # Or specify Python version
   npm config set python python3.9
   ```

3. **MongoDB Connection Fails**
   ```bash
   # Check MongoDB service
   sudo systemctl status mongod

   # Start MongoDB manually
   sudo systemctl start mongod
   ```

4. **Audio Capture Issues**
   - Check microphone permissions
   - Verify audio drivers
   - Test with system audio settings

### Performance Optimization

1. **Reduce Memory Usage**
   - Close unnecessary applications
   - Increase system RAM if possible
   - Monitor with Task Manager

2. **Improve Audio Quality**
   - Use high-quality microphone
   - Ensure stable internet connection
   - Close background audio applications

3. **Network Optimization**
   - Use wired connection when possible
   - Check firewall settings
   - Verify DNS resolution

## 📱 Platform-Specific Setup

### Windows

1. **Install Visual Studio Build Tools**
   - Download from Microsoft
   - Include C++ build tools
   - Add to PATH

2. **Audio Configuration**
   - Enable "Stereo Mix" in audio settings
   - Set microphone as default device
   - Configure privacy settings

### macOS

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Audio Permissions**
   - Grant microphone access in System Preferences
   - Enable audio input monitoring

### Linux

1. **Install Build Dependencies**
   ```bash
   sudo apt-get install build-essential python3
   ```

2. **Audio Configuration**
   - Install PulseAudio or ALSA
   - Configure audio devices
   - Set up loopback capture

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure connection strings
   - Rotate API keys regularly

2. **Network Security**
   - Use HTTPS/WSS connections
   - Implement proper authentication
   - Monitor network traffic

3. **Data Protection**
   - Encrypt sensitive data
   - Implement access controls
   - Regular security audits

## 📞 Support

If you encounter issues during setup:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review error logs in the application
3. Test individual components
4. Contact support team

---

**Next Steps:**
- Read the [API Documentation](API.md)
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Start developing with the application
