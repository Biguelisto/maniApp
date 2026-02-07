async function ScrapeScore(ScoreURL, Stable, ScrappingWindow) {
    if (!ScoreURL) { return }
    if (!String(ScoreURL).match('https://')) { // Not an URL -> Assumes it is a ScoreID
        ScoreURL = `https://osu.ppy.sh/scores/${ScoreURL}`
    }

    await ScrappingWindow.loadURL(ScoreURL)
    const Data = await ScrappingWindow.webContents.executeJavaScript(`
        (async () => {
            try {
                // Score and Achieved Rank
                const Score = Number(document.getElementsByClassName('score-player__score')[0]?.innerText.replace(',', '')) || 0;
                const AchievedRank = document.getElementsByClassName('score-dial__layer score-dial__layer--grade')[0]?.innerText || '';
                const PlayedAt = document.getElementsByClassName('score-player__row score-player__row--player')[0]?.childNodes[3]?.innerText || '';

                // Stats
                const StatContainer = document.getElementsByClassName('score-stats__group score-stats__group--stats')[0];
                const AllStats = StatContainer ? StatContainer.getElementsByClassName('score-stats__stat-row') : [];
                
                const Accuracy = AllStats[1] ? AllStats[1].innerText : '';
                let MaxCombo = AllStats[3] ? AllStats[3].innerText.replace(',', '') : '';
                MaxCombo = MaxCombo ? Number(MaxCombo.slice(0, MaxCombo.length - 1)) : 0;

                const PP = AllStats[5] ? Number(AllStats[5].innerText) : 0;

                let LazerGlobalRanking = document.getElementsByClassName('score-player__rank score-player__rank--value')[0]?.innerText.replace(',', '');
                LazerGlobalRanking = LazerGlobalRanking ? Number(LazerGlobalRanking.slice(1)) : 0;

                const Judgment = {
                    Perfect: AllStats[7] ? Number(AllStats[7].innerText.replace(',', '')) : 0,
                    Great: AllStats[9] ? Number(AllStats[9].innerText.replace(',', '')) : 0,
                    Good: AllStats[11] ? Number(AllStats[11].innerText.replace(',', '')) : 0,
                    Ok: AllStats[13] ? Number(AllStats[13].innerText.replace(',', '')) : 0,
                    Meh: AllStats[15] ? Number(AllStats[15].innerText.replace(',', '')) : 0,
                    Miss: AllStats[17] ? Number(AllStats[17].innerText.replace(',', '')) : 0,
                }

                // Mods
                const ModContainer = document.getElementsByClassName('score-player__mods')[0];
                const Mods = [];
                if (ModContainer) {
                    const ModChildren = ModContainer.children;
                    for (let Child of ModChildren) {
                        const ModFullName = Child.title;
                        let Shortened = Child.querySelector('div')?.className;
                        Shortened = Shortened ? Shortened.slice(Shortened.length - 2) : '';

                        Mods.push({
                            FullName: ModFullName,
                            Shortened: Shortened,
                        });
                    }
                }

                // User
                const UserCard = document.getElementsByClassName('user-card__card')[0];
                const UserName = UserCard ? UserCard.getElementsByClassName('user-card__username u-ellipsis-pre-overflow')[0] : null;
                const User = {
                    Name: UserName ? UserName.innerText : '',
                    UserURL: UserName ? UserName.getAttribute('href') : '',
                }

                // Beatmap
                const BeatmapName = document.getElementsByClassName('score-beatmap__link-plain')[0];
                const VersionContainer = document.getElementsByClassName('beatmap-list-item__version')[0];
                const Beatmap = {
                    BeatmapName: BeatmapName ? BeatmapName.innerText.slice(0, BeatmapName.innerText.length - BeatmapName.children[0].innerText.length - 1) : '',
                    Artist: BeatmapName ? BeatmapName.innerText.slice(BeatmapName.innerText.length - BeatmapName.children[0].innerText.length + 3) : '',
                    BeatmapURL: BeatmapName ? BeatmapName.getAttribute('href') : '',
                    Version: VersionContainer ? VersionContainer.getElementsByClassName('beatmap-list-item__version-link')[0]?.innerText : '',
                    Mappers: {}
                }

                const MappersList = VersionContainer ? VersionContainer.getElementsByClassName('beatmap-list-item__mapper')[0] : null;
                if (MappersList) {
                    const MapperChildren = MappersList.children;
                    for (let Child of MapperChildren) {
                        Beatmap.Mappers[Child.innerText] = Child.getAttribute('href');
                    }
                }

                // Mode
                const ModeContainer = document.getElementsByClassName('beatmap-list-item__col beatmap-list-item__col--icon')[0]?.querySelector('span');
                let Mode = ModeContainer ? ModeContainer.className.split('-').pop() : '';

                return { User, Beatmap, Mode, PlayedAt, AchievedRank, Score, Accuracy, MaxCombo, PP, LazerGlobalRanking, Judgment, Mods };
            } catch (error) {
                console.error(error);
                return null;
            }
        })()
    `)

    return Data
}

module.exports = {
    ScrapeScore
}