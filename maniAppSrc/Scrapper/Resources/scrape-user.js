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
                // Essentials
                const ProfileInfo = document.getElementsByClassName('profile-info__name')[0];
                const ProfileName = ProfileInfo ? ProfileInfo.getElementsByTagName('span')[0]?.innerText : '';
                const ProfilePictureURL = document.getElementsByClassName('profile-info__avatar')[0]?.getElementsByTagName('span')[0]?.style.backgroundImage || '';
                const JoinDate = document.getElementsByClassName('js-tooltip-time profile-links__value')[0]?.innerText || '';
                
                const TitleElement = document.getElementsByClassName('profile-info__title')[0];
                const Title = TitleElement ? TitleElement.innerText : null;

                const DefaultGameModeElement = document.getElementsByClassName('game-mode-link game-mode-link--active')[0];
                let DefaultGameMode = "N/A";
                if (DefaultGameModeElement) {
                    const modeClass = DefaultGameModeElement.getElementsByTagName('i')[0]?.className || '';
                    DefaultGameMode = modeClass.split('-').pop() || '';
                }

                const Statuses = document.getElementsByClassName('profile-links__item');
                let OnlineStatus = null;
                if (Statuses.length < 5) {
                    OnlineStatus = "Hidden";
                } else {
                    const statusText = Statuses[1]?.innerText || '';
                    OnlineStatus = statusText.includes("online") ? "Online" : "Offline";
                }

                // Rankings
                const RankingsElements = document.getElementsByClassName('profile-detail__values')[0]?.getElementsByTagName('div') || [];
                const Rankings = {
                    GlobalRanking: RankingsElements[0] ? RankingsElements[0].getElementsByClassName('value-display__value')[0]?.getElementsByTagName('div')[0]?.innerText : '',
                    NationalRanking: RankingsElements[1] ? RankingsElements[1].getElementsByClassName('value-display__value')[0]?.getElementsByTagName('div')[0]?.innerText : ''
                };

                // Country
                const AllFlags = document.getElementsByClassName('profile-info__flag');
                const CountryFlagElement = AllFlags[0];
                const CountryFlagE = CountryFlagElement ? CountryFlagElement.getElementsByTagName('span')[0] : null;
                const HREFCOUNTRY = CountryFlagElement ? CountryFlagElement.getAttribute('href') : '';
                const Country = {
                    CountryName: CountryFlagE ? CountryFlagE.title : '',
                    CountryNameShortened: HREFCOUNTRY.slice(-2),
                    CountryRankings: HREFCOUNTRY
                };

                // Team / Clan
                let Team = {};
                if (AllFlags.length > 1) {
                    const TeamFlagElement = AllFlags[1];
                    const TeamFlagE = TeamFlagElement.getElementsByClassName('flag-team')[0];
                    const TeamFlagName = TeamFlagElement.getElementsByClassName('profile-info__flag-text')[0];
                    Team = {
                        TeamName: TeamFlagName ? TeamFlagName.innerText : '',
                        TeamFlag: TeamFlagE ? TeamFlagE.style.backgroundImage : '',
                        TeamURL: TeamFlagElement.getAttribute('href')
                    };
                }

                return { ProfileName, ProfilePictureURL, JoinDate, Title, OnlineStatus, DefaultGameMode, Country, Rankings, Team }
            } catch (e) {
                console.error(e);
                return null;
            }
        })()
    `)

    // Clean profile picture URL
    if (Data.ProfilePictureURL) {
        Data.ProfilePictureURL = Data.ProfilePictureURL.slice(5, Data.ProfilePictureURL.length - 2);
    }
    
    let Pos = null;
    let Lifelines = 1;
    let LifelinePosition = URL.length;
    if (Mode) { Lifelines += 1 } // If mode exists, increment Lifelines count
    for (let i = URL.length; i > 0; i--) {
        const Character = URL.slice(i - 1, i);
        if (Character == "/") {
            Lifelines -= 1;
            if (Lifelines > 0) {
                LifelinePosition = i - 1;
                continue;
            }
            Pos = i;
            break;
        }
    }
    if (Pos) {
        Data.UserID = URL.slice(Pos, LifelinePosition);
    }

    // Determine mode
    Data.Mode = Mode || Data.DefaultGameMode || "osu";

    return Data;
}

module.exports = {
    ScrapeUser
}