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
                // Essentials
                const containers = document.getElementsByClassName('beatmapset-header__details-text-link');
                const Name = containers[0] ? containers[0].innerText : '';
                const Artist = containers[1] ? containers[1].innerText : '';
                const Status = document.getElementsByClassName('beatmapset-status beatmapset-status--show')[0]?.innerText || '';
                const HasFilm = document.getElementsByClassName('fas fa-film').length > 0;
                const Description = document.getElementsByClassName('bbcode bbcode--normal-line-height')[0]?.innerText || '';
                const BackgroundCover = document.getElementsByClassName('beatmapset-cover beatmapset-cover--full')[0]?.style.getPropertyValue('--bg') || '';

                // Audio
                const AudioContainer = document.getElementsByClassName('beatmapset-stats')[0];
                const AudioURL = AudioContainer ? AudioContainer.getElementsByTagName('button')[0]?.getAttribute('data-audio-url') : '';

                // Creator
                const CreatorContainer = document.getElementsByClassName('beatmapset-mapping')[0];
                const CreatorCard = CreatorContainer ? CreatorContainer.getElementsByTagName('a')[0] : null;
                const Creator = {
                    Name: CreatorContainer ? CreatorContainer.getElementsByTagName('div')[0].getElementsByTagName('a')[0]?.innerText : '',
                    Avatar: CreatorCard ? CreatorCard.querySelector('span').style.backgroundImage : '',
                    UserURL: CreatorCard ? CreatorCard.getAttribute('href') : ''
                };

                // Version Mapper
                const VersionContainer = document.getElementsByClassName('beatmapset-header__diff-name')[0];
                const Version = VersionContainer ? VersionContainer.childNodes[0].textContent.trim() : '';
                const MapperCard = VersionContainer ? VersionContainer.querySelector('a') : null;
                let VersionMapper = {};
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

                // Version Mode
                const VersionModeElement = document.getElementsByClassName('beatmap-icon beatmap-icon--beatmapset')[0]?.querySelector('i');
                let VersionMode = '';
                if (VersionModeElement) {
                    VersionMode = VersionModeElement.className.split('-').pop();
                }

                // Stats
                const AllStatsContainer = document.getElementsByClassName('beatmap-basic-stats__entry');
                const Stats = {
                    Length: AllStatsContainer[0] ? AllStatsContainer[0].getElementsByTagName('span')[0]?.innerText || '' : '',
                    BPM: AllStatsContainer[1] ? parseFloat(AllStatsContainer[1].getElementsByTagName('span')[0]?.innerText) || 0 : 0,
                    CircleCount: AllStatsContainer[2] ? parseInt(AllStatsContainer[2].getElementsByTagName('span')[0]?.innerText) || 0 : 0,
                    SliderCount: AllStatsContainer[3] ? parseInt(AllStatsContainer[3].getElementsByTagName('span')[0]?.innerText) || 0 : 0
                };

                // Other Versions
                const VersionsContainer = document.getElementsByClassName('beatmapset-beatmap-picker')[0];
                const Versions = [];
                if (VersionsContainer) {
                    const children = VersionsContainer.children;
                    for (let Child of children) {
                        let Href = Child.getAttribute('href');
                        if (Href) {
                            const BeatmapID = Href.split('/')[1];
                            Versions.push(BeatmapID);
                        }
                    }
                }

                return { AudioURL, Name, Artist, BackgroundCover, Version, VersionMode, VersionMapper, Status, HasFilm, Creator, Stats, Description, Versions };
            } catch (error) {
                console.error(error);
                return null;
            }
        })()
    `)

    return Data;
}

module.exports = {
    ScrapeBeatmap
}
