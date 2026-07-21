require("dotenv").config()

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const fs = require("fs")
const DefaultHTML = 'maniApp/MainPage/index.html'



// Running other files
// const { CloseScrapper } = require("./scrapper/scrapper.js")
const { CloseScrapper } = require("./scrapper/scrapper")





if (process.env.RUN_TESTS === "true") {
    console.log("=========")
    const folderPath = path.join(__dirname, "Tests")

    fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.js'))
        .forEach(file => {
            const { Do } = require(path.join(folderPath, file))
            if (Do()) {
                console.log("Test", file, "success")
                return
            }
            console.log("Test", file, "failed")
    })

    console.log("=========")
}





app.whenReady().then(() => {
    Menu.setApplicationMenu(null)

    const win = new BrowserWindow({
        show: true,
        width: 900,
        height: 600,
        frame: false,
        thickFrame: true,
        titleBarStyle: 'hidden',
        roundedCorners: true,
        useContentSize: true,
        title: "Maniapp",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile(DefaultHTML)
    const isDev = !app.isPackaged

    let SharedDebounce = false
    if (isDev) {
        win.webContents.openDevTools({ mode: "detach" })
    }

    ipcMain.on("window-close", () => {
        win.close()
    })
    ipcMain.on("window-minimize", () => {
        win.minimize()
    })

    let isMaximized = false
    ipcMain.on("window-maximize", () => {
        if (SharedDebounce) { return }
        SharedDebounce = true
        setTimeout(() => {
            SharedDebounce = false
        }, 100)

        isMaximized = win.isMaximized()
        if (isMaximized) {
            win.unmaximize()
            return
        }
        win.maximize()
    })
    

    win.addListener("closed", () => {
        CloseScrapper()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { // Darwin = MacOS
        app.quit()
    }
})