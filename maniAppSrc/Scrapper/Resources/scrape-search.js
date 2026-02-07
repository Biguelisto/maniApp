//! Currently not working until i find someway to search even without an account
async function ScrapeSearch(Query, ScrappingWindow) {
    if (!Query) { return }
    Query = encodeURIComponent(Query) // Formats query to be like the ones osu uses
    let PageURL = `https://osu.ppy.sh/home/search?mode=all&query=${Query}`
    
    await ScrappingWindow.loadURL(PageURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (async () => {
            try {
                let Beatmaps = []
                const Users = []
                const Teams = []

                const SearchCont = document.querySelector('.search')

                const BeatmapsContainer = SearchCont.children[1].className
                // for (let Beatmap of BeatmapsContainer.children) {
                //     // const Audio = Beatmap.getAttribute('data-audio-url')
                //     Beatmap = Beatmap.children[0]

                //     const Cover = Beatmap.children[0]
                //     const Content = Beatmap.children[1]

                //     const Structure = {
                //         BeatmapURL: Cover.getAttribute('href'),
                //         BeatmapCover: Cover.children[0].children[0].style.getPropertyValue('--bg'),
                //         // AudioURL: Audio
                //     }
                    
                //     Beatmaps.push(Structure)
                // }
                Beatmaps = BeatmapsContainer.className

                return { Beatmaps }
            } catch (e) {
                return e
            }
        })()
    `)

    return Data
}

module.exports = {
    ScrapeSearch
}