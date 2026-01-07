require("dotenv").config()

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const DefaultHTML = 'front/MainPage/index.html'

if (process.env.RUN_TESTS === "true") {
    console.log("Running tests...")
    require("../tests/APITest.js")
}

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
    ipcMain.on("window-minimize", () => {
        win.minimize()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})