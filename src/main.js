const { app, BrowserWindow, Menu, contextBridge, ipcRenderer, ipcMain } = require('electron')
const path = require('node:path')
const DefaultHTML = 'front/MainPage/index.html'

app.whenReady().then(() => {
    Menu.setApplicationMenu(null)

    const win = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile(DefaultHTML)

    ipcMain.on("window-close", () => {
        win.close()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})