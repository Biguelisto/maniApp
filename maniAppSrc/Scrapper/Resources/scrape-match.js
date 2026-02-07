async function ScrapeMatch(MatchURL, ScrappingWindow) {
    if (!MatchURL) { return }
    if (!String(MatchURL).match('https://')) { // Assumes it's ID
        MatchURL = `https://osu.ppy.sh/community/matches/${MatchURL}`
    }

    await ScrappingWindow.webContents.loadURL(MatchURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (() => {
            try {
                const Container = document.getElementsByClassName('mp-history-content')[0];
                const HistoryItems = Container ? Container.getElementsByClassName('mp-history-content__item') : [];

                // Essentials
                const Name = HistoryItems[0] ? HistoryItems[0].innerText : '';

                const Games = [];
                const Events = [];

                let i = 0;
                for (let Child of HistoryItems) {
                    if (i === 0) {
                        i = 1;
                        continue;
                    }
                    
                    const FirstChild = Child.children[0];
                    if (!FirstChild) { continue; }
                    const FirstClass = FirstChild.className;

                    // Event like player joined
                    if (FirstClass.endsWith('event')) {
                        let Type = FirstChild.children[1]?.className.split('-').pop() || '';
                        const TextElement = FirstChild.children[2];
                        let UserName = null;
                        let UserURL = null;

                        if (TextElement.children.length > 0) {
                            UserName = TextElement.innerText.split(' ')[0];
                            UserURL = TextElement.children[0]?.getAttribute('href');
                        }

                        const Structure = {
                            Time: FirstChild.children[0]?.innerText || '',
                            Type: Type,
                            Text: TextElement.innerText,
                            UserName: UserName,
                            UserURL: UserURL
                        };

                        Events.push(Structure);
                        continue;
                    }

                    // Game / Match play
                    const BeatmapHeader = FirstChild.getElementsByClassName('mp-history-game__header')[0];
                    const BeatmapTexts = FirstChild.getElementsByClassName('mp-history-game__metadata-box')[0];
                    const Beatmap = {
                        BeatmapURL: BeatmapHeader?.getAttribute('href') || '',
                        Title: BeatmapTexts ? BeatmapTexts.children[0]?.innerText : '',
                        Artist: BeatmapTexts ? BeatmapTexts.children[1]?.innerText : ''
                    };

                    const AllScores = FirstChild.getElementsByClassName('mp-history-player-score');
                    let PlacementNumber = 0;
                    const Scores = [];

                    for (let Score of AllScores) {
                        PlacementNumber += 1;
                        const IsTeamsVS = Score.className.includes('team');
                        let TeamName = null;
                        if (IsTeamsVS) {
                            TeamName = Score.children[0]?.style.backgroundImage;
                            TeamName = TeamName ? TeamName.split('-').pop().split('.')[0] : null;
                        }

                        const UserCard = Score.children[1]?.children[0]?.children[0];
                        const FlagURL = UserCard ? UserCard.children[0]?.getAttribute('href') : '';
                        let RankAchieved = Score.children[1]?.children[3]?.children[0]?.className;
                        RankAchieved = RankAchieved ? RankAchieved.slice(-1) : '';
                        if (RankAchieved === 'X') { RankAchieved = 'SS'; }

                        const FirstRow = Score.children[1]?.children[2]?.children[0];
                        const ScoreValue = Number(FirstRow?.children[2]?.children[1]?.innerText.replace(',', '')) || 0;
                        const Accuracy = FirstRow?.children[1]?.children[1]?.innerText || '';
                        const MaxCombo = Number(FirstRow?.children[0]?.children[1]?.innerText.replace(',', '')) || 0;

                        const Judgement = {};
                        const SecondRow = Score.children[1]?.children[2]?.children[1];
                        if (SecondRow) {
                            for (let Child of SecondRow.children) {
                                Judgement[Child.children[0]?.innerText] = Number(Child.children[1]?.innerText.replace(',', '')) || 0;
                            }
                        }

                        const Mods = [];
                        const ModsContainer = Score.children[1]?.children[1];
                        for (let Child of ModsContainer?.children || []) {
                            const ModFullName = Child.title;
                            let Shortened = Child.querySelector('div')?.className || '';
                            Shortened = Shortened.slice(-2);

                            Mods.push({
                                FullName: ModFullName,
                                Shortened: Shortened,
                            });
                        }

                        const UserStructure = {
                            Name: UserCard?.children[1]?.innerText || '',
                            URL: UserCard?.children[1]?.getAttribute('href') || '',
                            CountryShortened: FlagURL.slice(-2),
                        };

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
                        };

                        Scores.push(Structure);
                    }

                    const Stats = FirstChild.getElementsByClassName('mp-history-game__stats-box')[0];
                    const GameStructure = {
                        Beatmap: Beatmap,
                        StartTime: Stats?.children[0]?.children[0]?.innerText || '',
                        EndTime: Stats?.children[0]?.children[1]?.innerText || '',
                        Mode: Stats?.children[1]?.innerText.slice(4) || '',
                        ScoreType: Stats?.children[2]?.innerText || '',
                        Scores: Scores,
                        IsTeamVS: Scores[0]?.Team != null,
                    };

                    Games.push(GameStructure);
                }

                return { Name, Games, Events };
            } catch (error) {
                console.error(error);
                return null;
            }
        })()
    `)

    // Extra data
    Data.StartTime = Data.Events[0]?.Time;
    Data.EndTime = Data.Events[Data.Events.length - 1]?.Time;
    Data.Creator = {
        Name: Data.Events[0]?.UserName,
        URL: Data.Events[0]?.UserURL
    };

    return Data;
}

module.exports = {
    ScrapeMatch
}