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




export class MatchCache {
    constructor(MatchIDs, Name, Banner) {
        this.Data = {
            "MatchIDs": MatchIDs,
            "Name": Name,
            "Banner": Banner
        }
    }

    Serialize() {
        return JSON.stringify(this.Data, null, 2)
    }
}
export class MatchCacheBatch {
    constructor() {
        this.Calls = []
    }

    AddCall(Name, ...Arguments) {
        this.Calls.push([Name, Arguments])
        return this
    }
}

export async function WriteMatchCache(MatchCache) {
    return await window.MatchCache.WriteMatchCache(MatchCache.Serialize())
}
export async function ReadMatchCache(ID) {
    return await window.MatchCache.ReadMatchCache(ID)
}
export async function RemoveMatchCache(ID) {
    await window.MatchCache.RemoveMatchCache(ID)
}
export async function ClearMatchCache() {
    await window.MatchCache.ClearMatchCache()
}
export async function GetFullMatchCache() {
    return await window.MatchCache.GetFullMatchCache()
}
export async function GetCacheSize() {
    return await window.MatchCache.GetCacheSize()
}
export async function MatchCacheBatchCall(Batch) {
    const Returns = await window.MatchCache.CallBatches(Batch.Calls)
    return Returns
}