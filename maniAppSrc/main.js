require("dotenv").config()

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const os = require("os")
const DefaultHTML = 'maniApp/MainPage/index.html'



// Running other files
// const { CloseScrapper } = require("./scrapper/scrapper.js")
const { CloseScrapper } = require("./scrapper/scrapper")
const { OsuRunning } = require("./OsuTools/osu-open.js")
const { OsuTitle } = require("./OsuTools/osu-title.js")
const { RecentReplays } = require("./OsuTools/osu-replays.js")

async function A() {
    const osuPath = path.join(
        os.homedir(),
        'AppData',
        'Local',
        'osu!',
        'Songs',
        '1748707 Aharen Reina (CV_ Inori Minase) - AHAREN HEART (TV Size)',
        'Aharen Reina (CV Inori Minase) - AHAREN HEART (TV Size) (Drum-Hitnormal) [Hard].osu'
    )

    const Title = RecentReplays(osuPath)
    console.log(Title)
}
A()




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
    if (process.platform !== 'darwin') { // Darwin = MacOS
        app.quit()
    }
})