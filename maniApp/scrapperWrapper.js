// Wraps all the scrapper api
export async function GetScore(Score_URLoID) {
    const Data = await window.Scrapper.ScrapeScore(Score_URLoID)
    console.log(Data)
    return Data
}

export async function GetMatch(Match_URLoID) {
    const Data = await window.Scrapper.ScrapeMatch(Match_URLoID)
    console.log(Data)
    return Data
}

export async function GetUser(User_URLoID) {
    const Data = await window.Scrapper.ScrapeUser(User_URLoID)
    console.log(Data)
    return Data
}

export async function GetBeatmap(Beatmap_URLoID) {
    const Data = await window.Scrapper.ScrapeBeatmap(Beatmap_URLoID)
    console.log(Data)
    return Data
}