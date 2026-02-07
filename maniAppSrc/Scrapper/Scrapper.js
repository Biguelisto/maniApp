const { app, BrowserWindow, ipcMain } = require('electron')

//* Scrappers
const { ScrapeBeatmap } = require('./Resources/scrape-beatmap.js')
const { ScrapeUser } = require('./Resources/scrape-user.js')
const { ScrapeMatch } = require('./Resources/scrape-match.js')
const { ScrapeScore } = require('./Resources/scrape-score.js')
const { ScrapeSearch } = require('./Resources/scrape-search.js')




let ScrappingWindow = null
app.whenReady().then(() => {
    ScrappingWindow = new BrowserWindow({
        show: false,
        frame: false,
        sandbox: true,

        webPreferences: {
            contextIsolation: true,
            offscreen: true,
        }
    })

    ScrappingWindow.webContents.setFrameRate(240)
})



let queue = Promise.resolve()
function enqueue(fn) {
    const run = queue.then(() => fn())
    queue = run.catch(() => {}) // keep queue alive
    return run
}



//* Scrapper Wrappers
async function ScrapeBeatmapWrapped(...args) {
    return await enqueue(() => ScrapeBeatmap(...args))
}



ipcMain.handle("ScrapeUser", async (_, URL, Mode) => {
    return await ScrapeUser(URL, Mode, ScrappingWindow)
})

ipcMain.handle("ScrapeSearch", async (_, Query) => {
    return await ScrapeSearch(Query, ScrappingWindow)
})

ipcMain.handle("ScrapeBeatmap", async (_, BeatmapURL, ISBEATMAP) => {
    return await ScrapeBeatmapWrapped(BeatmapURL, ISBEATMAP, ScrappingWindow)
})

ipcMain.handle("ScrapeScore", async (_, ScoreURL, Stable) => {
    return await ScrapeScore(ScoreURL, Stable, ScrappingWindow)
})

ipcMain.handle("ScrapeMatch", async (_, MatchURL) => {
    return await ScrapeMatch(MatchURL, ScrappingWindow)
})

//! ALL URLS CAN ALSO BE IDS
//* Call example: window.Scrapper.ScrapeMatch(MatchURL / MatchID)

// TODO: Optimize a lot
// TODO: Fix occasional error: 'Cannot read properties of null (reading 'querySelector')' with ScrapeUser
// // TODO: Add score recalculation for ScrapeScore
// // TODO: ScrapeSearch

function CloseScrapper() {
    ScrappingWindow.close()
}
module.exports = {
    CloseScrapper
}