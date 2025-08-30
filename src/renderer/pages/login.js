// electron-login.js
// Login page script for the Electron application

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 [RENDERER] DOMContentLoaded event fired');
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const statusMessage = document.getElementById('statusMessage');
    const progressBar = document.getElementById('progressBar');
    const invalidCredentials = document.getElementById('invalidCredentials');

    console.log('🔍 [RENDERER] Elements found:');
    console.log('  - loginForm:', loginForm ? 'FOUND' : 'NOT FOUND');
    console.log('  - emailInput:', emailInput ? 'FOUND' : 'NOT FOUND');
    console.log('  - passwordInput:', passwordInput ? 'FOUND' : 'NOT FOUND');
    console.log('  - loginBtn:', loginBtn ? 'FOUND' : 'NOT FOUND');
    console.log('  - statusMessage:', statusMessage ? 'FOUND' : 'NOT FOUND');
    console.log('  - progressBar:', progressBar ? 'FOUND' : 'NOT FOUND');
    console.log('  - invalidCredentials:', invalidCredentials ? 'FOUND' : 'NOT FOUND');

    // Check if electronAPI is available
    console.log('🔍 [RENDERER] Checking electronAPI availability:');
    console.log('  - window.electronAPI:', window.electronAPI ? 'AVAILABLE' : 'NOT AVAILABLE');
    if (window.electronAPI) {
        console.log('  - window.electronAPI.performLogin:', typeof window.electronAPI.performLogin);
        console.log('  - window.electronAPI.closeLoginWindow:', typeof window.electronAPI.closeLoginWindow);
    }

    // Form submission handler
    loginForm.addEventListener('submit', async (e) => {
        console.log('🔍 [RENDERER] Form submit event triggered');
        e.preventDefault();
        console.log('🔍 [RENDERER] Calling handleLogin from form submit');
        await handleLogin();
    });

    // Button click handler
    loginBtn.addEventListener('click', async (e) => {
        console.log('🔍 [RENDERER] Login button clicked');
        e.preventDefault();
        console.log('🔍 [RENDERER] Calling handleLogin from button click');
        await handleLogin();
    });

    // Test button functionality
    console.log('🔍 [RENDERER] Adding test click to button');
    loginBtn.onclick = function(e) {
        console.log('🔍 [RENDERER] Button onclick triggered');
    };

    // Enter key handler
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('🔍 [RENDERER] Enter key pressed, calling handleLogin');
            handleLogin();
        }
    });

    async function handleLogin() {
        console.log('🔍 [RENDERER] handleLogin called');
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('🔍 [RENDERER] Email:', email);
        console.log('🔍 [RENDERER] Password length:', password ? password.length : 0);

        // Validate input
        if (!validateInput(email, password)) {
            console.log('❌ [RENDERER] Input validation failed');
            return;
        }

        console.log('✅ [RENDERER] Input validation passed');

        // Show loading state
        setLoadingState(true);
        showStatus('Authenticating...', 'info');
        hideInvalidCredentials();

        try {
            console.log('🔍 [RENDERER] Calling window.electronAPI.performLogin...');
            // Call the main process to handle login
            const result = await window.electronAPI.performLogin(email, password);
            console.log('🔍 [RENDERER] Login result received:', result);
            
            if (result.success) {
                console.log('✅ [RENDERER] Login successful!');
                showStatus('Welcome! Launching application...', 'success');
                loginBtn.textContent = 'Success!';
                loginBtn.style.background = '#54d88f';
                
                // Close login window after delay
                setTimeout(() => {
                    console.log('🔍 [RENDERER] Closing login window...');
                    window.electronAPI.closeLoginWindow();
                }, 1400);
            } else {
                console.log('❌ [RENDERER] Login failed:', result.error);
                showLoginError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('❌ [RENDERER] Login error:', error);
            console.error('❌ [RENDERER] Error message:', error.message);
            showLoginError(error.message || 'Connection error');
        } finally {
            console.log('🔍 [RENDERER] Setting loading state to false');
            setLoadingState(false);
        }
    }

    function validateInput(email, password) {
        console.log('🔍 [RENDERER] validateInput called with email:', email);
        console.log('🔍 [RENDERER] Password provided:', password ? 'YES' : 'NO');
        
        if (!email) {
            console.log('❌ [RENDERER] Email is empty');
            showStatus('Please enter your email address', 'error');
            emailInput.focus();
            return false;
        }

        if (!password) {
            console.log('❌ [RENDERER] Password is empty');
            showStatus('Please enter your password', 'error');
            passwordInput.focus();
            return false;
        }

        if (!email.includes('@')) {
            console.log('❌ [RENDERER] Email format invalid (no @ symbol)');
            showStatus('Please enter a valid email address', 'error');
            emailInput.focus();
            return false;
        }

        console.log('✅ [RENDERER] Input validation passed');
        return true;
    }

    function setLoadingState(loading) {
        loginBtn.disabled = loading;
        if (loading) {
            loginBtn.textContent = 'Signing In...';
            loginBtn.style.background = '#e4dbfa';
            progressBar.style.display = 'block';
        } else {
            loginBtn.textContent = 'Sign In';
            loginBtn.style.background = '#a48ae6';
            progressBar.style.display = 'none';
        }
    }

    function showStatus(message, type = 'error') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }

    function showLoginError(message) {
        if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('credentials')) {
            showInvalidCredentials();
        } else {
            showStatus(message, 'error');
        }
    }

    function showInvalidCredentials() {
        invalidCredentials.style.display = 'block';
        setTimeout(() => {
            hideInvalidCredentials();
        }, 3000);
    }

    function hideInvalidCredentials() {
        invalidCredentials.style.display = 'none';
    }

    // Forgot password handler
    window.openForgotPassword = function() {
        window.electronAPI.openForgotPassword();
    };
});
