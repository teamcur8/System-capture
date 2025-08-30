# API Documentation - Echo Audio Streamer

This document provides detailed information about the APIs used in the Echo Audio Streamer application.

## 🔐 Authentication API

### Base URL
```
https://transform.cur8.in/webservice/rest/server.php
```

### Authentication Token
```
wstoken: 55d122d76ce0b08e792ce0d4f680b1d2
```

## 📡 User Management APIs

### 1. Get User Details by Email

**Endpoint:** `GET /local_learningnudges_get_user_managerid_by_email`

**Purpose:** Retrieve user information and organizational details by email address.

**Parameters:**
- `wstoken` (string, required): Authentication token
- `wsfunction` (string, required): Function name
- `moodlewsrestformat` (string, required): Response format
- `email` (string, required): User's email address

**Request Example:**
```javascript
const url = "https://transform.cur8.in/webservice/rest/server.php";
const params = {
    "wstoken": "55d122d76ce0b08e792ce0d4f680b1d2",
    "wsfunction": "local_learningnudges_get_user_managerid_by_email",
    "moodlewsrestformat": "json",
    "email": "user.abcd@darwix.ai"
};

const fullUrl = `${url}?${querystring.stringify(params)}`;
```

**Response Format:**
```json
[
    {
        "managerid": "4248",
        "manageremail": "sona.k@adityabirlacapital.com",
        "teamid": "23",
        "companyid": "31",
        "calltype": "Sales-abcd"
    }
]
```

**Response Fields:**
- `managerid` (string): Manager's ID
- `manageremail` (string): Manager's email address
- `teamid` (string): Team ID
- `companyid` (string): Company ID
- `calltype` (string): Call type classification

### 2. Verify User Password

**Endpoint:** `POST /local_courses_get_user_details_data`

**Purpose:** Verify user credentials and retrieve additional user details.

**Parameters:**
- `wstoken` (string, required): Authentication token
- `wsfunction` (string, required): Function name
- `moodlewsrestformat` (string, required): Response format

**Request Body:**
```javascript
const postData = querystring.stringify({
    "u_email": "user.abcd@darwix.ai",
    "u_password": "user_password"
});
```

**Request Headers:**
```javascript
{
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Echo-Desktop-App/1.0'
}
```

**Response Format:**
```json
[
    {
        "user_id": "12345",
        "full_name": "User Abcd",
        "email": "user.abcd@darwix.ai",
        "manager_id": "4248",
        "company_id": "31",
        "team_id": "23",
        "status": "active"
    }
]
```

**Response Fields:**
- `user_id` (string): Unique user identifier
- `full_name` (string): User's full name
- `email` (string): User's email address
- `manager_id` (string): Manager's ID
- `company_id` (string): Company ID
- `team_id` (string): Team ID
- `status` (string): User account status

## 🌐 WebSocket API

### WebSocket Server
```
wss://omrealtime.cur8.in/ws/audio-stream
```

### Connection Parameters

The WebSocket URL includes query parameters for user identification:

```javascript
const wsUrl = `wss://omrealtime.cur8.in/ws/audio-stream?user_id=${user_id}&manager_id=${manager_id}&company_id=${company_id}&team_id=${team_id}&full_name=${full_name}`;
```

**URL Parameters:**
- `user_id` (string): User's email address
- `manager_id` (string): Manager's ID
- `company_id` (string): Company ID
- `team_id` (string): Team ID
- `full_name` (string): URL-encoded full name

**Example URL:**
```
wss://omrealtime.cur8.in/ws/audio-stream?user_id=user.abcd%40darwix.ai&manager_id=4248&company_id=31&team_id=23&full_name=User+Abcd
```

### WebSocket Events

#### 1. Connection Established

**Event:** `open`

**Description:** WebSocket connection is established and ready for communication.

**Client Action:** Wait for server confirmation message.

#### 2. Server Confirmation

**Event:** `message`

**Message Format:**
```json
{
    "status": "connected",
    "message": "Connection established successfully"
}
```

**Client Action:** Start audio capture and streaming after receiving confirmation.

#### 3. Audio Data Transmission

**Event:** `send`

**Data Format:** Raw binary audio data

**Specifications:**
- **Format:** 16-bit PCM
- **Sample Rate:** 16kHz
- **Channels:** Mono
- **Encoding:** Raw binary

**Example:**
```javascript
// Send audio chunk
ws.send(audioBuffer);
```

#### 4. Disconnection

**Event:** `close`

**Description:** WebSocket connection is closed.

**Client Action:** Stop audio capture and attempt reconnection if needed.

#### 5. Error Handling

**Event:** `error`

**Description:** WebSocket connection error.

**Client Action:** Log error and attempt reconnection.

## 🗄️ Database API

### MongoDB Connection

**Connection String Format:**
```
mongodb://[username:password@]host[:port]/database
```

**Example:**
```
mongodb://localhost:27017/echo
mongodb+srv://user:pass@cluster.mongodb.net/echo
```

### Database Collections

#### Users Collection

**Collection Name:** `users`

**Schema:**
```javascript
{
    email: String,           // User's email address (unique)
    full_name: String,       // User's full name
    manager_id: String,      // Manager's ID
    company_id: String,      // Company ID
    team_id: String,         // Team ID
    created_at: Date,        // Account creation timestamp
    updated_at: Date         // Last update timestamp
}
```

### Database Operations

#### 1. Save User Data

**Method:** `saveUserData(email, userData)`

**Parameters:**
- `email` (string): User's email address
- `userData` (object): User information object

**Example:**
```javascript
const userData = {
    full_name: "User Abcd",
    manager_id: "4248",
    company_id: "31",
    team_id: "23"
};

await dbManager.saveUserData("user.abcd@darwix.ai", userData);
```

#### 2. Get User Data

**Method:** `getUserData(email)`

**Parameters:**
- `email` (string): User's email address

**Returns:** User data object or null

**Example:**
```javascript
const userData = await dbManager.getUserData("user.abcd@darwix.ai");
```

#### 3. Check User Exists

**Method:** `userExists(email)`

**Parameters:**
- `email` (string): User's email address

**Returns:** Boolean indicating if user exists

**Example:**
```javascript
const exists = await dbManager.userExists("user.abcd@darwix.ai");
```

## 🎤 Audio Capture API

### Native Addon Interface

#### 1. Start Microphone Capture

**Method:** `startMicCapture(callback, duration)`

**Parameters:**
- `callback` (function): Audio data callback function
- `duration` (number): Capture duration in seconds (-1 for continuous)

**Callback Signature:**
```javascript
function(samples, channels, sampleRate) {
    // samples: Int16Array of audio data
    // channels: number of audio channels
    // sampleRate: audio sample rate in Hz
}
```

**Example:**
```javascript
const { startMicCapture } = require('./src/native');

startMicCapture((samples, ch, rate) => {
    console.log(`Mic: ${ch}ch, ${rate}Hz, ${samples.length} samples`);
    // Process audio data
}, -1);
```

#### 2. Stop Microphone Capture

**Method:** `stopMicCapture()`

**Description:** Stops microphone audio capture.

**Example:**
```javascript
const { stopMicCapture } = require('./src/native');
stopMicCapture();
```

#### 3. Start System Audio Capture

**Method:** `startLoopbackCapture(callback, duration)`

**Parameters:**
- `callback` (function): Audio data callback function
- `duration` (number): Capture duration in seconds (-1 for continuous)

**Example:**
```javascript
const { startLoopbackCapture } = require('./src/native');

startLoopbackCapture((samples, ch, rate) => {
    console.log(`System: ${ch}ch, ${rate}Hz, ${samples.length} samples`);
    // Process audio data
}, -1);
```

#### 4. Stop System Audio Capture

**Method:** `stopLoopbackCapture()`

**Description:** Stops system audio capture.

**Example:**
```javascript
const { stopLoopbackCapture } = require('./src/native');
stopLoopbackCapture();
```

## 🔧 Utility Functions

### Audio Processing

#### Downsample Buffer

**Method:** `downsampleBuffer(buffer, inChannels, inRate, outChannels, outRate)`

**Parameters:**
- `buffer` (Buffer): Input audio buffer
- `inChannels` (number): Input channel count
- `inRate` (number): Input sample rate
- `outChannels` (number): Output channel count
- `outRate` (number): Output sample rate

**Returns:** Processed audio buffer

**Example:**
```javascript
const processedBuffer = downsampleBuffer(
    audioBuffer,    // Input buffer
    2,              // Stereo input
    48000,          // 48kHz input
    1,              // Mono output
    16000           // 16kHz output
);
```

### HTTP Request Helper

**Method:** `makeHttpsRequest(url, options)`

**Parameters:**
- `url` (string): Request URL
- `options` (object): Request options

**Returns:** Promise with response data

**Example:**
```javascript
const response = await makeHttpsRequest(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: postData
});
```

## 📊 Error Handling

### HTTP Error Codes

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### WebSocket Error Codes

- `1000`: Normal closure
- `1001`: Going away
- `1002`: Protocol error
- `1003`: Unsupported data
- `1006`: Abnormal closure
- `1011`: Internal error

### Audio Error Codes

- `AUDCLNT_E_UNSUPPORTED_FORMAT`: Unsupported audio format
- `AUDCLNT_E_DEVICE_IN_USE`: Audio device in use
- `AUDCLNT_E_NOT_INITIALIZED`: Audio client not initialized

## 🔒 Security Considerations

### Authentication

- All API requests require valid `wstoken`
- Tokens should be rotated regularly
- Use HTTPS for all API communications

### Data Protection

- Encrypt sensitive data in transit
- Implement proper session management
- Validate all input data

### Network Security

- Use WSS for WebSocket connections
- Implement connection timeouts
- Monitor for suspicious activity

## 📝 Rate Limiting

### API Limits

- **Authentication API:** 100 requests per minute
- **User Management API:** 50 requests per minute
- **WebSocket Connections:** 10 concurrent connections per user

### Best Practices

- Implement exponential backoff for retries
- Cache user data when possible
- Monitor API usage and limits

## 🧪 Testing

### API Testing

```bash
# Test authentication API
npm run test-login

# Test WebSocket connection
npm run test-websocket

# Test audio capture
npm run test-mic
npm run test-loopback
```

### Mock Data

```javascript
// Sample user data for testing
const mockUserData = {
    email: "test@example.com",
    full_name: "Test User",
    manager_id: "1234",
    company_id: "5678",
    team_id: "9012"
};
```

---

**Note:** This API documentation is subject to change. Always refer to the latest version for the most up-to-date information.
