const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { startMicCapture, stopMicCapture, startLoopbackCapture, stopLoopbackCapture } = require('./index');
const WebSocket = require('ws');
const https = require('https');
const querystring = require('querystring');
const DatabaseManager = require('./database-manager');

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

const WS_URL = "wss://omrealtime.cur8.in/ws/audio-stream";
// Default user params (will be updated after login)
let USER_PARAMS = {
    user_id: "",
    manager_id: "",
    company_id: "",
    team_id: "",
    full_name: ""
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
        
        // Initialize database connection if not already connected
        if (!dbManager) {
            console.log(`DEBUG: Initializing database connection...`);
            try {
                dbManager = new DatabaseManager();
                await dbManager.connect();
            } catch (dbError) {
                console.error(`DEBUG: Database connection failed:`, dbError);
                console.log(`DEBUG: Continuing without database...`);
            }
        }

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
            }
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
                data: postData
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
                
                // Save to database
                if (dbManager) {
                    try {
                        const saveResult = await dbManager.saveUserData(email, userData);
                        if (!saveResult) {
                            console.error('Failed to save user data to database');
                            // Continue anyway, as the login was successful
                        }
                    } catch (dbError) {
                        console.error('Database save error:', dbError);
                        // Continue anyway, as the login was successful
                    }
                }
                
                // Update global user params
                USER_PARAMS = {
                    user_id: email,
                    manager_id: String(userData.manager_id || ''),
                    company_id: String(userData.company_id || ''),
                    team_id: String(userData.team_id || ''),
                    full_name: userData.full_name
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
                mainWindow.webContents.send('status-update', {
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
        mainWindow.webContents.send('error', 'Failed to start microphone capture: ' + err.message);
    }

    console.log('🎧 Starting system audio capture...');
    try {
        startLoopbackCapture((samples, ch, rate) => {
            if (!systemStarted) {
                console.log(`✅ System audio started: ${ch}ch, ${rate}Hz`);
                systemStarted = true;
                mainWindow.webContents.send('status-update', {
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
        mainWindow.webContents.send('error', 'Failed to start system audio capture: ' + err.message);
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
                mainWindow.webContents.send('chunk-update', {
                    mic: micChunkCount,
                    system: sysChunkCount
                });
            }
        } else if (source === 'system') {
            sysChunkCount++;
            if (sysChunkCount % 100 === 0) {
                mainWindow.webContents.send('chunk-update', {
                    mic: micChunkCount,
                    system: sysChunkCount
                });
            }
        }
    } catch (err) {
        console.error(`❌ Error sending ${source} chunk:`, err);
        mainWindow.webContents.send('error', `Error sending ${source} chunk: ` + err.message);
    }
}

function connectWebSocket() {
    console.log('📡 Connecting to WebSocket server...');
    mainWindow.webContents.send('log', 'Connecting to WebSocket server...');
    
    ws = new WebSocket(buildWsUrl());
    
    ws.on('open', () => {
        console.log('✅ WebSocket connected, waiting for server confirmation...');
        mainWindow.webContents.send('log', 'WebSocket connected, waiting for server confirmation...');
        mainWindow.webContents.send('status-update', { websocket: 'connecting' });
    });
    
    ws.on('message', (data) => {
        if (!wsConfirmed) {
            try {
                const msg = JSON.parse(data);
                if (msg.status === 'connected') {
                    wsConfirmed = true;
                    console.log('✅ Server confirmed connection. Starting audio captures...');
                    mainWindow.webContents.send('log', 'Server confirmed connection. Starting audio captures...');
                    mainWindow.webContents.send('status-update', { websocket: 'connected' });
                    startAudioCaptures();
                    streaming = true;
                    console.log('🎯 STREAMING STARTED! Audio is being sent to server.');
                    mainWindow.webContents.send('log', 'STREAMING STARTED! Audio is being sent to server.');
                    mainWindow.webContents.send('status-update', { streaming: true });
                }
            } catch (e) {
                console.log('📨 Received message:', data.toString());
                mainWindow.webContents.send('log', 'Received message: ' + data.toString());
            }
        }
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        mainWindow.webContents.send('log', 'WebSocket connection closed');
        mainWindow.webContents.send('status-update', { websocket: 'disconnected' });
        if (streaming) {
            console.log('⚠️ Connection lost. Use "reconnect" to try again.');
            mainWindow.webContents.send('log', 'Connection lost. Use reconnect to try again.');
            streaming = false;
            wsConfirmed = false;
            mainWindow.webContents.send('status-update', { streaming: false });
        }
    });
    
    ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
        mainWindow.webContents.send('error', 'WebSocket error: ' + err.message);
        mainWindow.webContents.send('status-update', { websocket: 'error' });
        if (streaming) {
            console.log('⚠️ Connection error. Use "reconnect" to try again.');
            mainWindow.webContents.send('log', 'Connection error. Use reconnect to try again.');
            streaming = false;
            wsConfirmed = false;
            mainWindow.webContents.send('status-update', { streaming: false });
        }
    });
}

function stopStreaming() {
    console.log('🛑 Stopping streaming...');
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('log', 'Stopping streaming...');
    }
    streaming = false;
    
    try {
        stopMicCapture();
        console.log('✅ Microphone stopped');
        mainWindow.webContents.send('log', 'Microphone stopped');
        micStarted = false;
        mainWindow.webContents.send('status-update', { mic: false });
    } catch (err) {
        console.error('❌ Error stopping microphone:', err);
        mainWindow.webContents.send('error', 'Error stopping microphone: ' + err.message);
    }
    
    try {
        stopLoopbackCapture();
        console.log('✅ System audio stopped');
        mainWindow.webContents.send('log', 'System audio stopped');
        systemStarted = false;
        mainWindow.webContents.send('status-update', { system: false });
    } catch (err) {
        console.error('❌ Error stopping system audio:', err);
        mainWindow.webContents.send('error', 'Error stopping system audio: ' + err.message);
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ status: 'disconnect' }));
        ws.close();
    }
    
    console.log('✅ Streaming stopped');
    mainWindow.webContents.send('log', 'Streaming stopped');
    mainWindow.webContents.send('status-update', { streaming: false });
}

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 450,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'electron-login-preload.js')
        },
        title: 'Echo - Smart Real Time Call Recorder',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        resizable: false,
        show: false,
        frame: true,
        center: true
    });

    loginWindow.loadFile('electron-login.html');

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
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'electron-preload.js')
        },
        title: 'Echo - Audio Streamer v1.0',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        resizable: true,
        show: false
    });

    mainWindow.loadFile('electron-renderer.html');

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
    try {
        const result = await performLogin(email, password);
        return result;
    } catch (error) {
        console.error('Login IPC error:', error);
        return { success: false, error: 'Login failed' };
    }
});

ipcMain.handle('close-login-window', async () => {
    if (loginWindow) {
        loginWindow.close();
        createMainWindow();
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
            mainWindow.webContents.send('log', 'Streaming resumed!');
            mainWindow.webContents.send('status-update', { streaming: true });
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
    mainWindow.webContents.send('log', 'Reconnecting...');
    if (ws) {
        ws.close();
    }
    wsConfirmed = false;
    streaming = false;
    micChunkCount = 0;
    sysChunkCount = 0;
    mainWindow.webContents.send('status-update', { 
        streaming: false, 
        websocket: 'disconnected',
        mic: false,
        system: false
    });
    mainWindow.webContents.send('chunk-update', { mic: 0, system: 0 });
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
            full_name: ""
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
