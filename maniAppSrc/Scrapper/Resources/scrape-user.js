async function ScrapeUser(PageURL, Mode, ScrappingWindow) {
    if (!PageURL) { return }
    if (!String(PageURL).match('https://')) {
        PageURL = `https://osu.ppy.sh/users/${PageURL}`
    }
    if (Mode) {
        PageURL += `/${Mode}`
    }

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
}

module.exports = {
    ScrapeUser
}