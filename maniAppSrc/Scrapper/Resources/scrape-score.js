//! Scores are plays done in single-player!!!
//! Stable argument makes the necessary recalculations for score and accuracy to transform data back to osu!stable ruleset
//* Please don't use this one, its just unreliable
async function ScrapeScore(ScoreURL, Stable, ScrappingWindow) {
    if (!ScoreURL) { return }
    if (!String(ScoreURL).match('https://')) { // Not an URL -> Assumes it is an ScoreID
        ScoreURL = `https://osu.ppy.sh/scores/${ScoreURL}`
    }

    await ScrappingWindow.loadURL(ScoreURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (async () => {
            try {
                const Score = Number(document.querySelector('.score-player__score').innerText.replace(',', ''))
                const AchievedRank = document.querySelector('.score-dial__layer.score-dial__layer--grade').innerText
                const PlayedAt = document.querySelector('.score-player__row.score-player__row--player').childNodes[3].innerText

                const StatContainer = document.querySelector('.score-stats__group.score-stats__group--stats')
                const AllStats = StatContainer.querySelectorAll('.score-stats__stat-row')
                const Accuracy = AllStats[1].innerText
                
                let MaxCombo = AllStats[3].innerText
                MaxCombo = MaxCombo.replace(',', '')
                MaxCombo = Number(MaxCombo.slice(0, MaxCombo.length - 1))

                const PP = Number(AllStats[5].innerText)

                let LazerGlobalRanking = document.querySelector('.score-player__rank.score-player__rank--value').innerText
                LazerGlobalRanking = LazerGlobalRanking.replace(',', '')
                LazerGlobalRanking = Number(LazerGlobalRanking.slice(1, LazerGlobalRanking.length))

                const Judgment = {
                    Perfect: Number(AllStats[7].innerText.replace(',', '')),
                    Great: Number(AllStats[9].innerText.replace(',', '')),
                    Good: Number(AllStats[11].innerText.replace(',', '')),
                    Ok: Number(AllStats[13].innerText.replace(',', '')),
                    Meh: Number(AllStats[15].innerText.replace(',', '')),
                    Miss: Number(AllStats[17].innerText.replace(',', '')),
                }


                // Mods
                const ModContainer = document.querySelector('.score-player__mods')
                const Mods = []
                for (let Child of ModContainer.children) {
                    const ModFullName = Child.title
                    let Shortened = Child.querySelector('div').className
                    Shortened = Shortened.slice(Shortened.length - 2, Shortened.length)

                    const Mod = {
                        FullName: ModFullName,
                        Shortened: Shortened,
                    }
                    Mods.push(Mod)
                }

                
                // User
                const UserCard = document.querySelector('.user-card__card')
                const UserName = UserCard.querySelector('.user-card__username.u-ellipsis-pre-overflow')
                const User = {
                    Name: UserName.innerText,
                    UserURL: UserName.getAttribute('href'),
                }


                // Beatmap
                const BeatmapName = document.querySelector('.score-beatmap__link-plain')
                const VersionContainer = document.querySelector('.beatmap-list-item__version')
                const Beatmap = {
                    BeatmapName: BeatmapName.innerText.slice(0, BeatmapName.innerText.length - BeatmapName.children[0].innerText.length - 1), // -1 to remove the space
                    Artist: BeatmapName.innerText.slice(BeatmapName.innerText.length - BeatmapName.children[0].innerText.length + 3, BeatmapName.innerText.length), // +3 to remove the 'by'
                    BeatmapURL: BeatmapName.getAttribute('href'),
                    Version: VersionContainer.querySelector('.beatmap-list-item__version-link').innerText,

                    Mappers: {}
                }
                const MappersList = VersionContainer.querySelector('.beatmap-list-item__mapper')
                for (let Child of MappersList.children) {
                    Beatmap.Mappers[Child.innerText] = Child.getAttribute('href')
                }


                // Mode
                const ModeContainer = document.querySelector('.beatmap-list-item__col.beatmap-list-item__col--icon').querySelector('span')
                let Mode = ModeContainer.className.split('-')
                Mode = Mode[Mode.length - 1]

                return { User, Beatmap, Mode, PlayedAt, AchievedRank, Score, Accuracy, MaxCombo, PP, LazerGlobalRanking, Judgment, Mods }
            } catch {
                return
            }
        })()
    `)

    // If not lazer then change accuracy and score

    return Data
}

module.exports = {
    ScrapeScore
}