//* Setting up apis for front-end
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("titleBarAPI", {
    close: () => ipcRenderer.send("window-close"),
    minimize: () => ipcRenderer.send("window-minimize"),
})