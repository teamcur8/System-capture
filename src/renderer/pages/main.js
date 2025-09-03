// electron-renderer.js
// Renderer process script for the desktop application

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    const micStatus = document.getElementById('mic-status');
    const systemStatus = document.getElementById('system-status');
    const websocketStatus = document.getElementById('websocket-status');
    const streamingStatus = document.getElementById('streaming-status');
    
    const micText = document.getElementById('mic-text');
    const systemText = document.getElementById('system-text');
    const websocketText = document.getElementById('websocket-text');
    const streamingText = document.getElementById('streaming-text');
    
    // Simplified UI: no chunks or logs

    // Button event listeners
    startBtn.addEventListener('click', async () => {
        try {
            startBtn.disabled = true;
            // simplified: no log
            await window.electronAPI.startStreaming();
            // Don't re-enable start button here - let status update handle it
        } catch (error) {
            console.error('Failed to start streaming:', error);
            startBtn.disabled = false; // Re-enable only on error
        }
    });

    stopBtn.addEventListener('click', async () => {
        try {
            stopBtn.disabled = true;
            // simplified: no log
            await window.electronAPI.stopStreaming();
            // Don't re-enable stop button here - let status update handle it
        } catch (error) {
            console.error('Failed to stop streaming:', error);
            stopBtn.disabled = false; // Re-enable only on error
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            logoutBtn.disabled = true;
            // simplified: no log
            await window.electronAPI.logout();
        } catch (error) {
            console.error('Failed to logout:', error);
        } finally {
            logoutBtn.disabled = false;
        }
    });

    // Removed reconnect and test DB controls from UI

    // IPC event listeners
    window.electronAPI.onStatusUpdate((event, status) => {
        updateStatus(status);
    });

    window.electronAPI.onChunkUpdate((event, chunks) => {
        updateChunks(chunks);
    });

    // Logs removed

    // Error log UI removed

    // Helper functions
    function updateStatus(status) {
        console.log('DEBUG: updateStatus called with:', status);
        
        if (status.mic !== undefined) {
            if (status.mic) {
                micStatus.className = 'status-card active';
                micText.textContent = 'Active';
                if (status.micChannels && status.micRate) {
                    micText.textContent = `Active (${status.micChannels}ch, ${status.micRate}Hz)`;
                }
            } else {
                micStatus.className = 'status-card inactive';
                micText.textContent = 'Inactive';
            }
        }

        if (status.system !== undefined) {
            if (status.system) {
                systemStatus.className = 'status-card active';
                systemText.textContent = 'Active';
                if (status.systemChannels && status.systemRate) {
                    systemText.textContent = `Active (${status.systemChannels}ch, ${status.systemRate}Hz)`;
                }
            } else {
                systemStatus.className = 'status-card inactive';
                systemText.textContent = 'Inactive';
            }
        }

        if (status.websocket !== undefined) {
            switch (status.websocket) {
                case 'connected':
                    websocketStatus.className = 'status-card active';
                    websocketText.textContent = 'Echo connected';
                    break;
                case 'connecting':
                    websocketStatus.className = 'status-card';
                    websocketText.textContent = 'Echo connecting...';
                    break;
                case 'disconnected':
                    websocketStatus.className = 'status-card inactive';
                    websocketText.textContent = 'Echo disconnected';
                    break;
                case 'error':
                    websocketStatus.className = 'status-card inactive';
                    websocketText.textContent = 'Echo error';
                    break;
            }
        }

        if (status.streaming !== undefined) {
            console.log('DEBUG: Updating streaming status:', status.streaming);
            if (status.streaming) {
                streamingStatus.className = 'status-card active';
                streamingText.textContent = 'Active';
                startBtn.disabled = true;
                stopBtn.disabled = false;
                console.log('DEBUG: Start button disabled, Stop button enabled');
            } else {
                streamingStatus.className = 'status-card inactive';
                streamingText.textContent = 'Inactive';
                startBtn.disabled = false;
                stopBtn.disabled = true;
                console.log('DEBUG: Start button enabled, Stop button disabled');
            }
        }
    }

    function updateChunks() { /* removed */ }

    // addLog removed

    // Initialize status and user info
    async function initializeStatus() {
        try {
            const status = await window.electronAPI.getStatus();
            updateStatus(status);
            // chunks removed
            
            // Get and display user information
            const userInfo = await window.electronAPI.getUserInfo();
            if (userInfo) {
                document.getElementById('userName').textContent = `Welcome, ${userInfo.full_name}!`;
                document.getElementById('userEmail').textContent = userInfo.email;
            }
        } catch (error) {
            addLog('Failed to get initial status: ' + error.message, 'error');
        }
    }

    // Function to manually check and fix button states
    async function checkButtonStates() {
        try {
            const status = await window.electronAPI.getStatus();
            console.log('DEBUG: Manual status check:', status);
            
            if (status.streaming) {
                startBtn.disabled = true;
                stopBtn.disabled = false;
                console.log('DEBUG: Fixed buttons - streaming is active');
            } else {
                startBtn.disabled = false;
                stopBtn.disabled = true;
                console.log('DEBUG: Fixed buttons - streaming is inactive');
            }
        } catch (error) {
            console.error('DEBUG: Error checking button states:', error);
        }
    }

    // Add a manual refresh button state function that can be called
    window.checkButtonStates = checkButtonStates;

    // Initialize on load
    initializeStatus();

    // Removed tip

    // Periodic button state check (every 2 seconds)
    setInterval(() => {
        checkButtonStates();
    }, 2000);
});
