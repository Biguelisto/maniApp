require("dotenv").config()

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const DefaultHTML = 'front/MainPage/index.html'



// Running other files
const { CloseScrapper } = require("./scrapper/scrapper.js")




if (process.env.RUN_TESTS === "true") {
    console.log("Running tests...")
    require("../tests/apitest.js")
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null)

    const win = new BrowserWindow({
        show: true,
        width: 900,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile(DefaultHTML)
    const isDev = !app.isPackaged

    if (isDev) {
        win.webContents.openDevTools({ mode: "detach" })
    }

    ipcMain.on("window-close", () => {
        win.close()
    })
    ipcMain.on("window-minimize", () => {
        win.minimize()
    })

    win.addListener("closed", () => {
        CloseScrapper()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})