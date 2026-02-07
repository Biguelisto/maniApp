//! BeatmapIDs ONLY WORK IF ISBEATMAP IS ON
async function ScrapeBeatmap(BeatmapURL, ISBEATMAP, ScrappingWindow) {
    if (!BeatmapURL) { return }
    if (!String(BeatmapURL).match('https://')) { // Not an URL -> Assumes it is an ID
        if (ISBEATMAP) {
            BeatmapURL = `https://osu.ppy.sh/beatmaps/${BeatmapURL}`
        } else {
            BeatmapURL = `https://osu.ppy.sh/beatmapsets/${BeatmapURL}`
        }
    }

    await ScrappingWindow.loadURL(BeatmapURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (async () => {
            try {
                // Lazy-Load
                // const Interval = 20
                // function sleep(ms) {
                //     return new Promise(r => setTimeout(r, ms))
                // }

                // for (let i = 1; i <= 7; i++) {
                //     window.scrollTo({top: i * 800})
                //     await sleep(40)
                // }





                // Essentials
                const Containers = document.querySelectorAll('.beatmapset-header__details-text-link')
                const Name = Containers[0].innerText
                const Artist = Containers[1].innerText
                const Status = document.querySelector('.beatmapset-status.beatmapset-status--show').innerText
                const HasFilm = document.querySelector('.fas.fa-film') != null
                const Description = document.querySelector('.bbcode.bbcode--normal-line-height').innerText
                const BackgroundCover = document.querySelector('.beatmapset-cover.beatmapset-cover--full').style.getPropertyValue('--bg')


                // Audio
                const AudioContainer = document.querySelector('.beatmapset-stats')
                const AudioURL = AudioContainer.querySelector('button').getAttribute('data-audio-url')


                // Creator
                const CreatorContainer = document.querySelector('.beatmapset-mapping')
                const CreatorCard = CreatorContainer.querySelector('a')
                const Creator = {
                    Name: CreatorContainer.querySelector('div').querySelector('a').innerText,
                    Avatar: CreatorCard.querySelector('span').style.backgroundImage,
                    UserURL: CreatorCard.getAttribute('href')
                }


                // Version Mapper
                const VersionContainer = document.querySelector('.beatmapset-header__diff-name')
                const Version = VersionContainer.childNodes[0].textContent.trim()
                const MapperCard = VersionContainer.querySelector('a')
                let VersionMapper = {}
                if (MapperCard) {
                    VersionMapper = {
                        Name: MapperCard.innerText,
                        UserURL: MapperCard.getAttribute('href')
                    }
                } else {
                    VersionMapper = {
                        Name: Creator.Name,
                        UserURL: Creator.UserURL
                    }
                }
                
                let VersionMode = document.querySelector('.beatmap-icon.beatmap-icon--beatmapset').querySelector('i').className
                VersionMode = VersionMode.split('-')
                VersionMode = VersionMode[VersionMode.length - 1]


                // Stats
                const AllStatsContainer = document.querySelectorAll('.beatmap-basic-stats__entry')
                const Stats = {
                    Length: AllStatsContainer[0].querySelector('span').innerText,
                    BPM: Number(AllStatsContainer[1].querySelector('span').innerText),
                    CircleCount: Number(AllStatsContainer[2].querySelector('span').innerText),
                    SliderCount: Number(AllStatsContainer[3].querySelector('span').innerText),
                }


                // Other Versions
                const VersionsContainer = document.querySelector('.beatmapset-beatmap-picker')
                const Versions = []
                for (let Child of VersionsContainer.children) {
                    let Href = Child.getAttribute('href')
                    const BeatmapID = Href.split('/')[1]

                    Versions.push(BeatmapID)
                }

                return { AudioURL, Name, Artist, BackgroundCover, Version, VersionMode, VersionMapper, Status, HasFilm, Creator, Stats, Description, Versions }
            } catch {
                return
            }
        })()
    `)

    return Data
}

module.exports = {
    ScrapeBeatmap
}