const { app, BrowserWindow, ipcMain } = require('electron')

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


class Queue {
    constructor(limit = 2) {
        this.limit = limit
        this.active = 0
        this.pending = []
    }

    async enqueue(fn) {
        if (this.active >= this.limit) {
            await new Promise(r => this.pending.push(r))
        }

        this.active++

        try {
            return await fn()
        } finally {
            this.active--
            if (this.pending.length) {
                this.pending.shift()()
            }
        }
    }
}

const ScrapeQueue = new Queue(5)


async function ScrapeUser(PageURL, Mode) {
    if (!PageURL) { return }
    if (!String(PageURL).match('https://')) {
        PageURL = `https://osu.ppy.sh/users/${PageURL}`
    }
    if (Mode) {
        PageURL += `/${Mode}`
    }

    return ScrapeQueue.enqueue(async () => {
        if (!PageURL || !ScrappingWindow) { return }
        await ScrappingWindow.loadURL(PageURL)

        const URL = await ScrappingWindow.webContents.getURL()
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
                    const ProfileName = document.querySelector('.profile-info__name').querySelector(':scope > span').innerText
                    const ProfilePictureURL = document.querySelector('.profile-info__avatar').querySelector(':scope > span').style.backgroundImage
                    const JoinDate = document.querySelector('.js-tooltip-time.profile-links__value').innerText
                    const TitleElement = document.querySelector('.profile-info__title')
                    let Title = null
                    if (TitleElement) {
                        Title = TitleElement.innerText
                    }

                    const DefaultGameModeElement = document.querySelector('[title="default game mode"]')
                    let DefaultGameMode = "N/A"
                    if (DefaultGameModeElement) {
                        DefaultGameMode = document.querySelector('.game-mode-link.game-mode-link--active').querySelector('.fal').className
                        DefaultGameMode = DefaultGameMode.split('-')
                        DefaultGameMode = DefaultGameMode[DefaultGameMode.length - 1]
                    }

                    const Statuses = document.querySelectorAll('.profile-links__item') 
                    let OnlineStatus = null
                    if (Statuses.length < 5) {
                        OnlineStatus = "Hidden"
                    } else {
                        OnlineStatus = Statuses[1].innerText.match("online")
                        if (OnlineStatus) {
                            OnlineStatus = "Online"
                        } else {
                            OnlineStatus = "Offline"
                        }
                    }

                    // Rankings
                    const RankingsElements = document.querySelector('.profile-detail__values')?.querySelectorAll(':scope > div')
                    const Rankings = {
                        GlobalRanking: RankingsElements[0].querySelector('.value-display__value').querySelector('div').innerText,
                        NationalRanking: RankingsElements[1].querySelector('.value-display__value').querySelector('div').innerText
                    }

                    const AllFlags = document.querySelectorAll('.profile-info__flag')

                    // Country
                    const CountryFlagElement = AllFlags[0]
                    const CountryFlagE = CountryFlagElement.querySelector('span')
                    const HREFCOUNTRY = CountryFlagElement.getAttribute('href')
                    const Country = {
                        CountryName: CountryFlagE.title,
                        CountryNameShortened: HREFCOUNTRY.slice(HREFCOUNTRY.length - 2, HREFCOUNTRY.length),
                        CountryRankings: HREFCOUNTRY
                    }


                    // Team / Clan
                    let Team = {}
                    if (AllFlags.length > 1) {
                        const TeamFlagElement = AllFlags[1]
                        const TeamFlagE = TeamFlagElement.querySelector('.flag-team')
                        const TeamFlagName = TeamFlagElement.querySelector('.profile-info__flag-text')
                        Team = {
                            TeamName: TeamFlagName.innerText,
                            TeamFlag: TeamFlagE.style.backgroundImage,
                            TeamURL: TeamFlagElement.getAttribute('href')
                        }
                    }

                    // Getting the 5 recent plays
                    // const Recent = document.querySelector('.js-sortable--page[data-page-id="recent_activity"]')
                    // const LazyLoad = Recent.querySelector('.lazy-load')
                    // while (LazyLoad.children[0].className != 'profile-extra-entries') {
                    //     await sleep(Interval)
                    // }
                    
                    // const RecentContent = LazyLoad.children[0]
                    // let RecentMaps = []
                    // for (let i = 0; i < RecentContent.children.length - 1; i++) {
                    //     const Children = RecentContent.children[i]

                    //     const Main = Children.querySelector('.profile-extra-entries__text')
                    //     const Beatmap = Main.querySelectorAll('a')[1]
                    //     const Element = {
                    //         Text: Main.innerText,
                    //         BeatmapName: Beatmap.innerText,
                    //         BeatmapLink: "https://osu.ppy.sh" + Beatmap.getAttribute("href")
                    //     }
                    //     RecentMaps.push(Element)
                    // }


                    return { ProfileName, ProfilePictureURL, JoinDate, Title, OnlineStatus, DefaultGameMode, Country, Rankings, Team }
                } catch {
                    return
                }
            })()
        `)

        // Curing data
        Data.ProfilePictureURL = Data.ProfilePictureURL.slice(5, Data.ProfilePictureURL.length - 2)
        
        let Pos = null
        let Lifelines = 1
        let LifelinePosition = URL.length
        if (Mode) { Lifelines += 1 } // If it has a mode after then its the second '/'
        for (let i = URL.length; i > 0; i--) {
            const Character = URL.slice(i - 1, i)
            if (Character == "/") {
                Lifelines -= 1
                if (Lifelines > 0) {
                    LifelinePosition = i - 1
                    continue
                }

                Pos = i
                break
            }
        }
        if (Pos) {
            Data.UserID = URL.slice(Pos, LifelinePosition)
        }

        Data.Mode = Mode
        if (!Data.Mode) {
            if (Data.DefaultGameMode != "N/A") {
                Data.Mode = Data.DefaultGameMode
            } else {
                Data.Mode = "osu"
            }
        }

        return Data
    })
}


//! Currently not working until i find someway to search even without an account
async function ScrapeSearch(Query) {
    if (!Query) { return }
    Query = encodeURIComponent(Query) // Formats query to be like the ones osu uses
    let PageURL = `https://osu.ppy.sh/home/search?mode=all&query=${Query}`
    
    return ScrapeQueue.enqueue(async() => {
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
    })
}


//! BeatmapIDs ONLY WORK IF ISBEATMAP IS ON
async function ScrapeBeatmap(BeatmapURL, ISBEATMAP) {
    if (!BeatmapURL) { return }
    if (!String(BeatmapURL).match('https://')) { // Not an URL -> Assumes it is an ID
        if (ISBEATMAP) {
            BeatmapURL = `https://osu.ppy.sh/beatmaps/${BeatmapURL}`
        } else {
            BeatmapURL = `https://osu.ppy.sh/beatmapsets/${BeatmapURL}`
        }
    }

    return ScrapeQueue.enqueue(async() => {
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
    })
}


//! Scores are plays done in single-player!!!
//! Stable argument makes the necessary recalculations for score and accuracy to transform data back to osu!stable ruleset
//* Please don't use this one, its just unreliable
async function ScrapeScore(ScoreURL, Stable) {
    if (!ScoreURL) { return }
    if (!String(ScoreURL).match('https://')) { // Not an URL -> Assumes it is an ScoreID
        ScoreURL = `https://osu.ppy.sh/scores/${ScoreURL}`
    }

    return ScrapeQueue.enqueue(async() => {
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
    })
}


//! This thing is absurdly big so beware of it.
async function ScrapeMatch(MatchURL) {
    if (!MatchURL) { return }
    if (!String(MatchURL).match('https://')) { // Assumes its ID
        MatchURL = `https://osu.ppy.sh/community/matches/${MatchURL}`
    }

    return ScrapeQueue.enqueue(async() => {
        await ScrappingWindow.webContents.loadURL(MatchURL)

        const Data = await ScrappingWindow.webContents.executeJavaScript(`
            (() => {
                try {
                    const Container = document.querySelector('.mp-history-content')
                    const HistoryItems = Container.querySelectorAll('.mp-history-content__item')

                    // Essentials
                    const Name = HistoryItems[0].innerText

                    const Games = []
                    const Events = []

                    let i = 0
                    for (let Child of HistoryItems) {
                        if (i == 0) {
                            i = 1
                            continue
                        }
                        
                        const FirstChild = Child.children[0]
                        if (!FirstChild) { continue }
                        const FirstClass = FirstChild.className

                        // Event like player joined
                        if (FirstClass.endsWith('event')) {
                            let Type = FirstChild.children[1].className
                            Type = Type.split('-')
                            Type = Type[Type.length - 1]

                            const TextElement = FirstChild.children[2]
                            let UserName = null
                            let UserURL = null
                            if (TextElement.children.length > 0) {
                                UserName = TextElement.innerText.split(' ')
                                UserName = UserName[0]
                                UserURL = TextElement.children[0].getAttribute('href')
                            }

                            const Structure = {
                                Time: FirstChild.children[0].innerText,
                                Type: Type,
                                Text: TextElement.innerText,
                                UserName: UserName,
                                UserURL: UserURL
                            }

                            Events.push(Structure)
                            continue
                        }

                        // Game / Match play
                        const BeatmapHeader = FirstChild.querySelector('.mp-history-game__header')
                        const BeatmapTexts = FirstChild.querySelector('.mp-history-game__metadata-box')
                        const Beatmap = {
                            BeatmapURL: BeatmapHeader.getAttribute('href'),
                            Title: BeatmapTexts.children[0].innerText,
                            Artist: BeatmapTexts.children[1].innerText
                        }

                        const AllScores = FirstChild.querySelectorAll('.mp-history-player-score')
                        let PlacementNumber = 0
                        const Scores = []
                        for (let Score of AllScores) {
                            PlacementNumber += 1
                            const IsTeamsVS = Score.className.match('team')
                            let TeamName = null
                            if (IsTeamsVS) {
                                TeamName = Score.children[0].style.backgroundImage
                                TeamName = TeamName.split('-')
                                TeamName = TeamName[TeamName.length - 1]
                                TeamName = TeamName.split('.')[0]
                            }

                            const UserCard = Score.children[1].children[0].children[0]
                            const FlagURL = UserCard.children[0].getAttribute('href')
                            let RankAchieved = Score.children[1].children[3].children[0].className
                            RankAchieved = RankAchieved.slice(RankAchieved.length - 1, RankAchieved.length)
                            if (RankAchieved == 'X') { RankAchieved = 'SS' }

                            const FirstRow = Score.children[1].children[2].children[0]
                            const ScoreValue = Number(FirstRow.children[2].children[1].innerText.replace(',', ''))
                            const Accuracy = FirstRow.children[1].children[1].innerText
                            const MaxCombo = Number(FirstRow.children[0].children[1].innerText.replace(',', ''))

                            const Judgement = {}
                            const SecondRow = Score.children[1].children[2].children[1]
                            for (let Child of SecondRow.children) {
                                Judgement[Child.children[0].innerText] = Number(Child.children[1].innerText.replace(',', ''))
                            }

                            const Mods = []
                            const ModsContainer = Score.children[1].children[1]
                            for (let Child of ModsContainer.children) {
                                const ModFullName = Child.title
                                let Shortened = Child.querySelector('div').className
                                Shortened = Shortened.slice(Shortened.length - 2, Shortened.length)

                                const Mod = {
                                    FullName: ModFullName,
                                    Shortened: Shortened,
                                }
                                Mods.push(Mod)
                            }

                            const UserStructure = {
                                Name: UserCard.children[1].innerText,
                                URL: UserCard.children[1].getAttribute('href'),
                                CountryShortened: FlagURL.slice(FlagURL.length - 2, FlagURL.length)
                            }

                            const Structure = {
                                Score: ScoreValue,
                                Accuracy: Accuracy,
                                MaxCombo: MaxCombo,
                                Judgement: Judgement,
                                Mods: Mods,
                                Placement: PlacementNumber,
                                User: UserStructure,
                                AchievedRank: RankAchieved,
                                Team: TeamName,
                            }
                            
                            Scores.push(Structure)
                        }

                        const Stats = FirstChild.querySelector('.mp-history-game__stats-box')
                        const Structure = {
                            Beatmap: Beatmap,
                            StartTime: Stats.children[0].children[0].innerText,
                            EndTime: Stats.children[0].children[1].innerText,
                            Mode: Stats.children[1].innerText.slice(4, Stats.children[1].innerText.length),
                            ScoreType: Stats.children[2].innerText,
                            Scores: Scores,
                            IsTeamVS: Scores[0].Team != null,
                        }
                        Games.push(Structure)
                    }

                    return { Name, Games, Events }
                } catch {
                    return
                }
            })()
        `)

        // Extra data
        Data.StartTime = Data.Events[0].Time
        Data.EndTime = Data.Events[Data.Events.length - 1].Time
        Data.Creator = {
            Name: Data.Events[0].UserName,
            URL: Data.Events[0].UserURL
        }

        return Data
    })
}



ipcMain.handle("ScrapeUser", async (_, URL, Mode) => {
    return await ScrapeUser(URL, Mode)
})

ipcMain.handle("ScrapeSearch", async (_, Query) => {
    return await ScrapeSearch(Query)
})

ipcMain.handle("ScrapeBeatmap", async (_, BeatmapURL, ISBEATMAP) => {
    return await ScrapeBeatmap(BeatmapURL, ISBEATMAP)
})

ipcMain.handle("ScrapeScore", async (_, ScoreURL, Stable) => {
    return await ScrapeScore(ScoreURL, Stable)
})

ipcMain.handle("ScrapeMatch", async (_, MatchURL) => {
    return await ScrapeMatch(MatchURL)
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