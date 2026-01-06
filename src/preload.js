//* Setting up apis for front-end
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send("window-close")
})