//* Setting up apis for front-end
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("titleBarAPI", {
    close: () => ipcRenderer.send("window-close"),
    minimize: () => ipcRenderer.send("window-minimize"),
})

contextBridge.exposeInMainWorld("Scrapper", {
    ScrapeUser: (URL, Mode) => ipcRenderer.invoke("ScrapeUser", URL, Mode),
    ScrapeSearch: (Query) => ipcRenderer. invoke("ScrapeSearch", Query),
    ScrapeBeatmap: (URL, ISBEATMAP) => ipcRenderer.invoke("ScrapeBeatmap", URL, ISBEATMAP),
    ScrapeScore: (URL, Stable) => ipcRenderer.invoke("ScrapeScore", URL, Stable),
    ScrapeMatch: (URL) => ipcRenderer.invoke("ScrapeMatch", URL)
})