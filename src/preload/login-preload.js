const { contextBridge, ipcRenderer } = require('electron');

console.log('🔍 [PRELOAD] Login preload script loaded');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    performLogin: (email, password) => {
        console.log('🔍 [PRELOAD] performLogin called with email:', email);
        return ipcRenderer.invoke('perform-login', email, password);
    },
    closeLoginWindow: () => {
        console.log('🔍 [PRELOAD] closeLoginWindow called');
        return ipcRenderer.invoke('close-login-window');
    },
    openForgotPassword: () => {
        console.log('🔍 [PRELOAD] openForgotPassword called');
        return ipcRenderer.invoke('open-forgot-password');
    }
});

console.log('🔍 [PRELOAD] electronAPI exposed to renderer');
