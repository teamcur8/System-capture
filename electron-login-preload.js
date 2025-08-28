const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    performLogin: (email, password) => ipcRenderer.invoke('perform-login', email, password),
    closeLoginWindow: () => ipcRenderer.invoke('close-login-window'),
    openForgotPassword: () => ipcRenderer.invoke('open-forgot-password')
});
