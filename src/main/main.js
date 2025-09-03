const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { startMicCapture, stopMicCapture, startLoopbackCapture, stopLoopbackCapture } = require('../native/index');
const WebSocket = require('ws');
const https = require('https');
const querystring = require('querystring');
const DatabaseManager = require('../database/database-manager');

// Global state
let loginWindow = null;
let mainWindow = null;
let ws = null;
let wsConfirmed = false;
let micStarted = false;
let systemStarted = false;
let streaming = false;
let micChunkCount = 0;
let sysChunkCount = 0;
let userData = null;
let dbManager = null;

// Helper function to safely send messages to renderer
function sendToRenderer(channel, data) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send(channel, data);
    }
}

const WS_URL = "wss://devreal.darwix.ai/ws/audio-stream";
// Default user params (will be updated after login)
let USER_PARAMS = {
    user_id: "",
    manager_id: "",
    company_id: "",
    team_id: "",
    full_name: "",
    region: "east"
};

function buildWsUrl() {
    const params = new URLSearchParams(USER_PARAMS).toString();
    return `${WS_URL}?${params}`;
}

function makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`DEBUG: Making HTTPS request to: ${url}`);
        console.log(`DEBUG: Request options:`, options);
        
        const req = https.request(url, options, (res) => {
            console.log(`DEBUG: Response status: ${res.statusCode}`);
            console.log(`DEBUG: Response headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`DEBUG: Response data: ${data}`);
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    console.log(`DEBUG: Failed to parse JSON, returning raw data`);
                    resolve(data);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`DEBUG: Request error:`, err);
            reject(err);
        });

        // Apply timeout if provided, default 8000ms
        const timeoutMs = typeof options.timeout === 'number' ? options.timeout : 8000;
        req.setTimeout(timeoutMs, () => {
            console.error(`DEBUG: Request timeout after ${timeoutMs}ms`);
            req.destroy(new Error('ETIMEDOUT'));
        });

        if (options.data) {
            console.log(`DEBUG: Writing data: ${options.data}`);
            req.write(options.data);
        }
        req.end();
    });
}

function extractFullNameFromEmail(email) {
    try {
        if (!email || !email.includes('@')) {
            return "User";
        }
        
        // Get username part before @
        const username = email.split('@')[0];
        
        // Replace separators with spaces
        const cleanUsername = username.replace(/[._-]/g, ' ');
        
        // Split into parts and clean
        const parts = cleanUsername.split(' ')
            .map(part => part.replace(/[^a-zA-Z]/g, ''))
            .filter(part => part.length > 0)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
        
        return parts.length > 0 ? parts.join(' ') : "User";
    } catch (e) {
        return "User";
    }
}

async function fetchUserDetails(email) {
    try {
        const url = "https://transform.cur8.in/webservice/rest/server.php";
        const params = {
            "wstoken": "55d122d76ce0b08e792ce0d4f680b1d2",
            "wsfunction": "local_learningnudges_get_user_managerid_by_email",
            "moodlewsrestformat": "json",
            "email": email
        };
        
        const fullUrl = `${url}?${querystring.stringify(params)}`;
        const result = await makeHttpsRequest(fullUrl);
        
        if (result && Array.isArray(result) && result.length > 0) {
            return result[0];
        }
        return null;
    } catch (e) {
        console.error('Error fetching user details:', e);
        return null;
    }
}

async function performLogin(email, password) {
    try {
        console.log(`DEBUG: Starting login for email: ${email}`);
        
        // First API call - Authentication (using the same function as Python)
        const authUrl = "https://transform.cur8.in/webservice/rest/server.php";
        const authParams = {
            "wstoken": "55d122d76ce0b08e792ce0d4f680b1d2",
            "wsfunction": "local_learningnudges_get_user_managerid_by_email",
            "moodlewsrestformat": "json",
            "email": email
        };

        // Build the full URL with query parameters
        const fullAuthUrl = `${authUrl}?${querystring.stringify(authParams)}`;
        console.log(`DEBUG: Full auth URL: ${fullAuthUrl}`);

        // Make GET request (same as Python)
        const authResult = await makeHttpsRequest(fullAuthUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Echo-Desktop-App/1.0'
            },
            timeout: 8000
        });

        console.log(`DEBUG: User lookup result type: ${typeof authResult}`);
        console.log(`DEBUG: User lookup result:`, authResult);
        
        if (authResult && Array.isArray(authResult) && authResult.length > 0) {
            console.log(`DEBUG: User found, now verifying password...`);
            const userData = authResult[0];
            
            // Now we need to verify the password with a separate API call
            // Let's try the original authentication function
            const verifyUrl = "https://transform.cur8.in/webservice/rest/server.php";
            const verifyParams = {
                "wstoken": "55d122d76ce0b08e792ce0d4f680b1d2",
                "wsfunction": "local_courses_get_user_details_data",
                "moodlewsrestformat": "json"
            };
            
            const fullVerifyUrl = `${verifyUrl}?${querystring.stringify(verifyParams)}`;
            const postData = querystring.stringify({
                "u_email": email,
                "u_password": password
            });
            
            console.log(`DEBUG: Verifying password with: ${fullVerifyUrl}`);
            console.log(`DEBUG: Post data: ${postData}`);
            
            const verifyResult = await makeHttpsRequest(fullVerifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'Echo-Desktop-App/1.0'
                },
                data: postData,
                timeout: 8000
            });
            
            console.log(`DEBUG: Password verification result:`, verifyResult);
            
            if (verifyResult && Array.isArray(verifyResult) && verifyResult.length > 0) {
                console.log(`DEBUG: Password verification successful`);
                
                // Merge user data from both calls
                const verifiedUserData = verifyResult[0];
                userData.team_id = userData.teamid || verifiedUserData.team_id;
                userData.manager_id = userData.managerid || verifiedUserData.manager_id;
                userData.company_id = userData.companyid || verifiedUserData.company_id;
                
                // Handle full name
                let fullName = userData.full_name;
                if (!fullName || ['', 'None', 'null', '0', 'NULL'].includes(String(fullName).trim())) {
                    fullName = extractFullNameFromEmail(email);
                }
                userData.full_name = String(fullName || 'User').trim() || 'User';
                
                // Add email to user data
                userData.email = email;
                
                // Save to database (deferred connect after successful auth)
                try {
                    if (!dbManager) {
                        dbManager = new DatabaseManager();
                        await dbManager.connect();
                    }
                    const saveResult = await dbManager.saveUserData(email, userData);
                    if (!saveResult) {
                        console.error('Failed to save user data to database');
                    }
                } catch (dbError) {
                    console.error('Database save error (non-fatal):', dbError);
                }
                
                // Update global user params
                USER_PARAMS = {
                    user_id: email,
                    manager_id: String(userData.manager_id || ''),
                    company_id: String(userData.company_id || ''),
                    team_id: String(userData.team_id || ''),
                    full_name: userData.full_name,
                    region: 'east'
                };
                
                // Store user data globally
                global.userData = userData;
                
                return { success: true, userData };
            } else {
                console.log(`DEBUG: Password verification failed`);
                return { success: false, error: 'Invalid credentials' };
            }
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return { success: false, error: 'Connection error' };
        } else if (error.code === 'ETIMEDOUT') {
            return { success: false, error: 'Connection timeout' };
        } else {
            return { success: false, error: 'Login failed' };
        }
    }
}

function downsampleBuffer(buffer, inChannels, inRate, outChannels = 1, outRate = 16000) {
    // Convert stereo to mono (average channels)
    let samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.length / 2);
    if (inChannels === 2 && outChannels === 1) {
        const mono = new Int16Array(samples.length / 2);
        for (let i = 0; i < mono.length; i++) {
            mono[i] = ((samples[i * 2] + samples[i * 2 + 1]) / 2) | 0;
        }
        samples = mono;
    }
    // Downsample (simple decimation)
    if (inRate !== outRate) {
        const factor = inRate / outRate;
        const outLen = Math.floor(samples.length / factor);
        const down = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
            down[i] = samples[Math.floor(i * factor)];
        }
        samples = down;
    }
    return Buffer.from(samples.buffer);
}

function startAudioCaptures() {
    console.log('🎙️ Starting microphone capture...');
    try {
        startMicCapture((samples, ch, rate) => {
            if (!micStarted) {
                console.log(`✅ Microphone started: ${ch}ch, ${rate}Hz`);
                micStarted = true;
                sendToRenderer('status-update', {
                    mic: true,
                    micChannels: ch,
                    micRate: rate
                });
            }
            if (wsConfirmed && streaming) {
                sendChunk('mic', Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength), ch, rate);
            }
        }, -1);
        console.log('✅ Microphone capture initiated');
    } catch (err) {
        console.error('❌ Failed to start microphone capture:', err);
        sendToRenderer('error', 'Failed to start microphone capture: ' + err.message);
    }

    console.log('🎧 Starting system audio capture...');
    try {
        startLoopbackCapture((samples, ch, rate) => {
            if (!systemStarted) {
                console.log(`✅ System audio started: ${ch}ch, ${rate}Hz`);
                systemStarted = true;
                sendToRenderer('status-update', {
                    system: true,
                    systemChannels: ch,
                    systemRate: rate
                });
            }
            if (wsConfirmed && streaming) {
                sendChunk('system', Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength), ch, rate);
            }
        }, -1);
        console.log('✅ System audio capture initiated');
    } catch (err) {
        console.error('❌ Failed to start system audio capture:', err);
        sendToRenderer('error', 'Failed to start system audio capture: ' + err.message);
    }
}

function sendChunk(source, chunk, ch, rate) {
    try {
        // Downsample to mono 16kHz 16bit
        const buf = downsampleBuffer(chunk, ch, rate, 1, 16000);
        
        // Send as binary data
        ws.send(buf);
        
        if (source === 'mic') {
            micChunkCount++;
            if (micChunkCount % 100 === 0) {
                sendToRenderer('chunk-update', {
                    mic: micChunkCount,
                    system: sysChunkCount
                });
            }
        } else if (source === 'system') {
            sysChunkCount++;
            if (sysChunkCount % 100 === 0) {
                sendToRenderer('chunk-update', {
                    mic: micChunkCount,
                    system: sysChunkCount
                });
            }
        }
    } catch (err) {
        console.error(`❌ Error sending ${source} chunk:`, err);
        sendToRenderer('error', `Error sending ${source} chunk: ` + err.message);
    }
}

function connectWebSocket() {
    console.log('📡 Connecting to WebSocket server...');
    sendToRenderer('log', 'Connecting to WebSocket server...');
    
    ws = new WebSocket(buildWsUrl());
    
    ws.on('open', () => {
        console.log('✅ WebSocket connected, waiting for server confirmation...');
        sendToRenderer('log', 'WebSocket connected, waiting for server confirmation...');
        sendToRenderer('status-update', { websocket: 'connecting' });
    });
    
    ws.on('message', (data) => {
        if (!wsConfirmed) {
            try {
                const msg = JSON.parse(data);
                if (msg.status === 'connected') {
                    wsConfirmed = true;
                    console.log('✅ Server confirmed connection. Starting audio captures...');
                    sendToRenderer('log', 'Server confirmed connection. Starting audio captures...');
                    sendToRenderer('status-update', { websocket: 'connected' });
                    startAudioCaptures();
                    streaming = true;
                    console.log('🎯 STREAMING STARTED! Audio is being sent to server.');
                    sendToRenderer('log', 'STREAMING STARTED! Audio is being sent to server.');
                    sendToRenderer('status-update', { streaming: true });
                }
            } catch (e) {
                console.log('📨 Received message:', data.toString());
                sendToRenderer('log', 'Received message: ' + data.toString());
            }
        }
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        sendToRenderer('log', 'WebSocket connection closed');
        sendToRenderer('status-update', { websocket: 'disconnected' });
        // Ensure UI reflects devices are inactive when socket closes
        micStarted = false;
        systemStarted = false;
        sendToRenderer('status-update', { mic: false, system: false });
        if (streaming) {
            console.log('⚠️ Connection lost. Use "reconnect" to try again.');
            sendToRenderer('log', 'Connection lost. Use reconnect to try again.');
            streaming = false;
            wsConfirmed = false;
            sendToRenderer('status-update', { streaming: false });
        }
    });
    
    ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
        sendToRenderer('error', 'WebSocket error: ' + err.message);
        sendToRenderer('status-update', { websocket: 'error' });
        if (streaming) {
            console.log('⚠️ Connection error. Use "reconnect" to try again.');
            sendToRenderer('log', 'Connection error. Use reconnect to try again.');
            streaming = false;
            wsConfirmed = false;
            sendToRenderer('status-update', { streaming: false });
        }
    });
}

function stopStreaming() {
    console.log('🛑 Stopping streaming...');
    sendToRenderer('log', 'Stopping streaming...');
    streaming = false;
    
    try {
        stopMicCapture();
        console.log('✅ Microphone stopped');
        sendToRenderer('log', 'Microphone stopped');
        sendToRenderer('status-update', { mic: false });
        micStarted = false;
    } catch (err) {
        console.error('❌ Error stopping microphone:', err);
        sendToRenderer('error', 'Error stopping microphone: ' + err.message);
    }
    
    try {
        stopLoopbackCapture();
        console.log('✅ System audio stopped');
        sendToRenderer('log', 'System audio stopped');
        sendToRenderer('status-update', { system: false });
        systemStarted = false;
    } catch (err) {
        console.error('❌ Error stopping system audio:', err);
        sendToRenderer('error', 'Error stopping system audio: ' + err.message);
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ status: 'disconnect' }));
        ws.close();
    }
    
    console.log('✅ Streaming stopped');
    sendToRenderer('log', 'Streaming stopped');
    // Ensure all statuses are reflected as inactive
    sendToRenderer('status-update', { streaming: false, mic: false, system: false, websocket: 'disconnected' });
}

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 450,
        height: 700,
        icon: 'E:\\EChoo\\testingEcho\\systemCapture\\build\\icon.ico',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/login-preload.js')
        },
        title: 'Echo - Smart Real Time Call Recorder',
        resizable: false,
        show: false,
        frame: true,
        center: true
    });

    loginWindow.loadFile(path.join(__dirname, '../renderer/pages/login.html'));
    loginWindow.setMenu(null);

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
    });

    loginWindow.on('closed', () => {
        loginWindow = null;
        if (!mainWindow) {
            app.quit();
        }
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'E:\\EChoo\\testingEcho\\systemCapture\\build\\icon.ico',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/main-preload.js')
        },
        title: 'Echo - Audio Streamer v1.0',
        resizable: true,
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/pages/main.html'));
    mainWindow.setMenu(null);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (!loginWindow) {
            app.quit();
        }
    });
}

// Login IPC handlers
ipcMain.handle('perform-login', async (event, email, password) => {
    console.log('🔍 [IPC] perform-login called with email:', email);
    console.log('🔍 [IPC] Password length:', password ? password.length : 0);
    
    try {
        console.log('🔍 [IPC] Calling performLogin function...');
        const result = await performLogin(email, password);
        console.log('🔍 [IPC] performLogin result:', result);
        return result;
    } catch (error) {
        console.error('❌ [IPC] Login IPC error:', error);
        console.error('❌ [IPC] Error stack:', error.stack);
        return { success: false, error: 'Login failed' };
    }
});

ipcMain.handle('close-login-window', async () => {
    console.log('🔍 [IPC] close-login-window called');
    if (loginWindow) {
        console.log('🔍 [IPC] Closing login window and creating main window');
        loginWindow.close();
        createMainWindow();
    } else {
        console.log('❌ [IPC] loginWindow is null!');
    }
});

ipcMain.handle('open-forgot-password', async () => {
    const forgotPasswordUrl = "https://transform.cur8.in/login/forgot_password.php";
    await shell.openExternal(forgotPasswordUrl);
});

// Main app IPC handlers
ipcMain.handle('start-streaming', async () => {
    if (!streaming) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectWebSocket();
        } else {
            streaming = true;
            sendToRenderer('log', 'Streaming resumed!');
            sendToRenderer('status-update', { streaming: true });
        }
    }
    return { success: true };
});

ipcMain.handle('stop-streaming', async () => {
    if (streaming) {
        stopStreaming();
    }
    return { success: true };
});

ipcMain.handle('reconnect', async () => {
    console.log('🔄 Reconnecting...');
    sendToRenderer('log', 'Reconnecting...');
    if (ws) {
        ws.close();
    }
    wsConfirmed = false;
    streaming = false;
    micChunkCount = 0;
    sysChunkCount = 0;
    sendToRenderer('status-update', { 
        streaming: false, 
        websocket: 'disconnected',
        mic: false,
        system: false
    });
    sendToRenderer('chunk-update', { mic: 0, system: 0 });
    setTimeout(connectWebSocket, 1000);
    return { success: true };
});

ipcMain.handle('get-status', async () => {
    return {
        mic: micStarted,
        system: systemStarted,
        websocket: wsConfirmed ? 'connected' : (ws ? 'connecting' : 'disconnected'),
        streaming: streaming,
        micChunks: micChunkCount,
        systemChunks: sysChunkCount
    };
});

ipcMain.handle('get-user-info', async () => {
    try {
        // If we have user data in memory, return it
        if (global.userData) {
            return global.userData;
        }
        
        // If we have a database connection, try to get from database
        if (dbManager) {
            // We need the email to get user data from database
            // For now, return null if no user data in memory
            return null;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
});

ipcMain.handle('test-database', async () => {
    try {
        if (!dbManager) {
            dbManager = new DatabaseManager();
        }
        
        const connected = await dbManager.testConnection();
        return { success: connected };
    } catch (error) {
        console.error('Database test error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('logout', async () => {
    try {
        // Stop streaming if active
        if (streaming) {
            stopStreaming();
        }
        
        // Clear user data
        global.userData = null;
        USER_PARAMS = {
            user_id: "",
            manager_id: "",
            company_id: "",
            team_id: "",
            full_name: "",
            region: "east"
        };
        
        // Close database connection
        if (dbManager) {
            await dbManager.closeConnection();
            dbManager = null;
        }
        
        // Close main window and show login
        if (mainWindow) {
            mainWindow.close();
        }
        createLoginWindow();
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: 'Logout failed' };
    }
});

// App lifecycle
app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopStreaming();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});

app.on('before-quit', async () => {
    stopStreaming();
    
    // Close database connection
    if (dbManager) {
        await dbManager.closeConnection();
        dbManager = null;
    }
});