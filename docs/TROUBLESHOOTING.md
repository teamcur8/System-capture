# Troubleshooting Guide - Echo Audio Streamer

This guide helps you resolve common issues with the Echo Audio Streamer application.

## 🔍 Quick Diagnosis

### Check Application Status

1. **View Logs**: Check the application log for error messages
2. **Test Components**: Run individual test scripts
3. **Check System Resources**: Monitor CPU, memory, and network usage

### Common Error Patterns

- **Audio Issues**: Microphone not working, system audio not captured
- **Network Issues**: WebSocket disconnections, API failures
- **Build Issues**: Native addon compilation failures
- **Performance Issues**: High CPU usage, memory leaks

## 🎤 Audio Issues

### Microphone Not Working

**Symptoms:**
- Microphone status shows "Inactive"
- No audio being captured
- Microphone indicator not showing

**Solutions:**

1. **Check Microphone Permissions**
   ```bash
   # Windows: Check Privacy Settings
   Settings > Privacy & Security > Microphone
   
   # macOS: Check System Preferences
   System Preferences > Security & Privacy > Microphone
   ```

2. **Test Microphone Hardware**
   ```bash
   # Run microphone test
   npm run test-mic
   ```

3. **Check Audio Drivers**
   - Update audio drivers
   - Restart audio service
   - Check device manager

4. **Verify Audio Settings**
   ```javascript
   // Check audio device in application
   // Look for error messages in console
   ```

### System Audio Not Capturing

**Symptoms:**
- System audio status shows "Inactive"
- No loopback audio being captured
- Audio from applications not detected

**Solutions:**

1. **Enable Stereo Mix (Windows)**
   ```
   Right-click speaker icon > Recording devices
   Right-click in empty space > Show disabled devices
   Enable "Stereo Mix"
   ```

2. **Check Audio Output**
   - Ensure audio is playing through speakers/headphones
   - Test with different applications
   - Verify audio levels

3. **Test Loopback Capture**
   ```bash
   npm run test-loopback
   ```

4. **Alternative Audio Capture**
   ```javascript
   // Try different audio capture methods
   // Check for WASAPI errors
   ```

### Audio Quality Issues

**Symptoms:**
- Poor audio quality
- Audio distortion
- High latency

**Solutions:**

1. **Optimize Audio Settings**
   - Use higher sample rates if supported
   - Adjust buffer sizes
   - Check audio processing settings

2. **Reduce System Load**
   - Close unnecessary applications
   - Disable audio enhancements
   - Use dedicated audio interface

3. **Network Optimization**
   - Use wired connection
   - Check bandwidth usage
   - Optimize WebSocket settings

## 🌐 Network Issues

### WebSocket Connection Problems

**Symptoms:**
- WebSocket status shows "Disconnected"
- Connection timeouts
- Frequent disconnections

**Solutions:**

1. **Check Network Connectivity**
   ```bash
   # Test server connectivity
   ping omrealtime.cur8.in
   
   # Test WebSocket endpoint
   curl -I https://omrealtime.cur8.in
   ```

2. **Firewall Configuration**
   - Allow application through firewall
   - Check antivirus settings
   - Configure network security

3. **Proxy Settings**
   ```javascript
   // Configure proxy if needed
   const ws = new WebSocket(url, {
     proxy: 'http://proxy-server:port'
   });
   ```

4. **Connection Retry Logic**
   ```javascript
   // Implement exponential backoff
   // Add connection health checks
   ```

### API Authentication Failures

**Symptoms:**
- Login failures
- "Invalid credentials" errors
- API timeout errors

**Solutions:**

1. **Verify API Endpoints**
   ```bash
   # Test API connectivity
   curl https://transform.cur8.in/webservice/rest/server.php
   ```

2. **Check Credentials**
   - Verify email and password
   - Check account status
   - Test with known working credentials

3. **API Rate Limiting**
   - Implement request throttling
   - Add retry logic
   - Check API quotas

4. **Network Timeouts**
   ```javascript
   // Increase timeout values
   const timeout = 30000; // 30 seconds
   ```

## 🔧 Build Issues

### Native Addon Compilation Failures

**Symptoms:**
- `node-gyp` build errors
- Missing dependencies
- Python not found errors

**Solutions:**

1. **Install Build Dependencies**
   ```bash
   # Windows
   npm install --global windows-build-tools
   
   # macOS
   xcode-select --install
   
   # Linux
   sudo apt-get install build-essential python3
   ```

2. **Configure Python**
   ```bash
   # Set Python path
   npm config set python python3
   
   # Or specify version
   npm config set python python3.9
   ```

3. **Clean and Rebuild**
   ```bash
   # Clean build artifacts
   npm run clean
   
   # Rebuild native addon
   npm run build-native
   ```

4. **Check Node.js Version**
   ```bash
   # Ensure compatible Node.js version
   node --version
   # Should be v16 or higher
   ```

### Electron Build Issues

**Symptoms:**
- Electron app won't start
- Missing dependencies
- Path resolution errors

**Solutions:**

1. **Reinstall Dependencies**
   ```bash
   # Remove node_modules
   rm -rf node_modules
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall
   npm install
   ```

2. **Check File Paths**
   - Verify file locations
   - Update import paths
   - Check case sensitivity

3. **Electron Version Compatibility**
   ```bash
   # Check Electron version
   npm list electron
   
   # Update if needed
   npm update electron
   ```

## ⚡ Performance Issues

### High CPU Usage

**Symptoms:**
- System becomes laggy
- High CPU utilization
- Application freezes

**Solutions:**

1. **Optimize Audio Processing**
   ```javascript
   // Reduce audio buffer sizes
   // Implement audio compression
   // Use Web Workers for processing
   ```

2. **Memory Management**
   ```javascript
   // Implement garbage collection
   // Clear unused references
   // Monitor memory usage
   ```

3. **Reduce Logging**
   ```javascript
   // Disable debug logging in production
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug info');
   }
   ```

4. **Optimize UI Updates**
   ```javascript
   // Throttle UI updates
   // Use requestAnimationFrame
   // Implement virtual scrolling
   ```

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes
- System slowdown

**Solutions:**

1. **Monitor Memory Usage**
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     const memUsage = process.memoryUsage();
     console.log('Memory usage:', memUsage);
   }, 30000);
   ```

2. **Clean Up Resources**
   ```javascript
   // Close WebSocket connections
   // Stop audio capture
   // Clear intervals and timeouts
   ```

3. **Event Listener Management**
   ```javascript
   // Remove event listeners
   element.removeEventListener('event', handler);
   
   // Use weak references
   const weakRef = new WeakRef(element);
   ```

## 🗄️ Database Issues

### MongoDB Connection Problems

**Symptoms:**
- Database connection failures
- User data not saved
- Authentication errors

**Solutions:**

1. **Check MongoDB Service**
   ```bash
   # Check service status
   sudo systemctl status mongod
   
   # Start service
   sudo systemctl start mongod
   ```

2. **Verify Connection String**
   ```javascript
   // Check MongoDB URI format
   const uri = 'mongodb://localhost:27017/echo';
   
   // Test connection
   await client.connect();
   ```

3. **Network Connectivity**
   ```bash
   # Test MongoDB connection
   mongo mongodb://localhost:27017/echo
   
   # Check firewall settings
   sudo ufw status
   ```

4. **Authentication Issues**
   ```javascript
   // Check credentials
   // Verify database permissions
   // Test with different user
   ```

## 🔒 Security Issues

### Authentication Failures

**Symptoms:**
- Login not working
- Session timeouts
- Permission denied errors

**Solutions:**

1. **Check API Tokens**
   ```javascript
   // Verify API token validity
   // Check token expiration
   // Refresh tokens if needed
   ```

2. **SSL/TLS Issues**
   ```javascript
   // Check certificate validity
   // Configure SSL options
   // Handle certificate errors
   ```

3. **CORS Issues**
   ```javascript
   // Configure CORS headers
   // Handle preflight requests
   // Check origin validation
   ```

## 📱 Platform-Specific Issues

### Windows Issues

1. **Audio Driver Problems**
   - Update audio drivers
   - Check Windows audio settings
   - Disable audio enhancements

2. **Permission Issues**
   - Run as administrator
   - Check UAC settings
   - Configure app permissions

3. **Path Issues**
   - Use Windows path separators
   - Check file permissions
   - Verify file existence

### macOS Issues

1. **Audio Permissions**
   - Grant microphone access
   - Enable audio input monitoring
   - Check privacy settings

2. **Code Signing**
   - Sign application with developer certificate
   - Handle notarization
   - Configure entitlements

### Linux Issues

1. **Audio System**
   - Configure PulseAudio/ALSA
   - Set up audio devices
   - Check audio permissions

2. **Package Dependencies**
   - Install required packages
   - Update system packages
   - Check library versions

## 🛠️ Debugging Tools

### Application Logs

```javascript
// Enable debug logging
process.env.DEBUG = '*';

// Add custom logging
console.log('Debug info:', data);
```

### Performance Monitoring

```javascript
// Monitor CPU usage
const startUsage = process.cpuUsage();
// ... perform operation
const endUsage = process.cpuUsage(startUsage);

// Monitor memory usage
const memUsage = process.memoryUsage();
```

### Network Debugging

```bash
# Monitor network traffic
netstat -an | grep :443

# Test WebSocket connection
wscat -c wss://omrealtime.cur8.in/ws/audio-stream
```

## 📞 Getting Help

### Before Contacting Support

1. **Collect Information**
   - Application logs
   - System specifications
   - Error messages
   - Steps to reproduce

2. **Test Components**
   - Run individual test scripts
   - Check system resources
   - Verify network connectivity

3. **Check Documentation**
   - Review setup guide
   - Check API documentation
   - Search existing issues

### Support Channels

- **GitHub Issues**: Create detailed issue reports
- **Email Support**: Contact development team
- **Documentation**: Check troubleshooting guides
- **Community**: Ask in developer forums

---

**Remember**: Most issues can be resolved by following this guide. If you continue to experience problems, provide detailed information when seeking help.
