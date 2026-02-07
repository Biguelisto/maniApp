async function ScrapeSearch(Query, ScrappingWindow) {
    if (!Query) { return }
    Query = encodeURIComponent(Query); // Formats query to be like the ones osu uses
    let PageURL = `https://osu.ppy.sh/home/search?mode=all&query=${Query}`
    
    await ScrappingWindow.loadURL(PageURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (async () => {
            try {
                let Beatmaps = []
                const Users = []
                const Teams = []

                const SearchCont = document.getElementsByClassName('search')[0];
                if (!SearchCont) return { Beatmaps: [] }

                const BeatmapsContainer = SearchCont.children[1]; // Get the second child (assumed container)

                const BeatmapItems = BeatmapsContainer ? BeatmapsContainer.children : [];

                for (let Beatmap of BeatmapItems) {
                    const Cover = Beatmap.children[0]; 
                    const Content = Beatmap.children[1]; 
                    
                    const BeatmapURL = Cover ? Cover.getAttribute('href') : '';
                    const BeatmapCover = Cover ? Cover.children[0]?.children[0]?.style.getPropertyValue('--bg') : '';
                    
                    if (BeatmapURL) {
                        Beatmaps.push({
                            BeatmapURL: BeatmapURL,
                            BeatmapCover: BeatmapCover,
                        });
                    }
                }

                return { Beatmaps }
            } catch (e) {
                return { error: e.message }
            }
        })()
    `)

    return Data
}

module.exports = {
    ScrapeSearch
}