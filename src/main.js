const { app, BrowserWindow, Menu } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
    })

    win.loadFile('src/index.html')
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})