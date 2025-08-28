// electron-login.js
// Login page script for the Electron application

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const statusMessage = document.getElementById('statusMessage');
    const progressBar = document.getElementById('progressBar');
    const invalidCredentials = document.getElementById('invalidCredentials');

    // Form submission handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Enter key handler
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate input
        if (!validateInput(email, password)) {
            return;
        }

        // Show loading state
        setLoadingState(true);
        showStatus('Authenticating...', 'info');
        hideInvalidCredentials();

        try {
            // Call the main process to handle login
            const result = await window.electronAPI.performLogin(email, password);
            
            if (result.success) {
                showStatus('Welcome! Launching application...', 'success');
                loginBtn.textContent = 'Success!';
                loginBtn.style.background = '#54d88f';
                
                // Close login window after delay
                setTimeout(() => {
                    window.electronAPI.closeLoginWindow();
                }, 1400);
            } else {
                showLoginError(result.error || 'Login failed');
            }
        } catch (error) {
            showLoginError(error.message || 'Connection error');
        } finally {
            setLoadingState(false);
        }
    }

    function validateInput(email, password) {
        if (!email) {
            showStatus('Please enter your email address', 'error');
            emailInput.focus();
            return false;
        }

        if (!password) {
            showStatus('Please enter your password', 'error');
            passwordInput.focus();
            return false;
        }

        if (!email.includes('@')) {
            showStatus('Please enter a valid email address', 'error');
            emailInput.focus();
            return false;
        }

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
