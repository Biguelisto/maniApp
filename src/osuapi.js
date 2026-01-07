// ================================
// osu! API Legacy Handler
// ================================
const BASE_URL = "https://osu.ppy.sh/api"
const OSU_API_KEY = process.env.OSU_API_KEY

if (!OSU_API_KEY) {
    throw new Error("OSU_API_KEY não definida")
}

// ================================
// Request genérico
// ================================
async function request(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`)
    url.searchParams.set("k", OSU_API_KEY)

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
        url.searchParams.set(key, value)
        }
    }

    const res = await fetch(url)

    if (!res.ok) {
        throw new Error("osu! API error ${res.status}")
    }

    return res.json()
}

// ================================
// Modes
// ================================
const Modes = {
    standard: 0,
    taiko: 1,
    fruits: 2,
    mania: 3,
}

const ReverseModes = ["standard", "taiko", "fruits", "mania"]

const getMode = (mode) =>
    typeof mode === "string" ? Modes[mode.toLowerCase()] : mode

const getReverseMode = (mode) => ReverseModes[mode]

// ================================
// Mods
// ================================
const Mods = {
    NF: 1,
    EZ: 2,
    TD: 4,
    HD: 8,
    HR: 16,
    SD: 32,
    DT: 64,
    RX: 128,
    HT: 256,
    NC: 512,
    FL: 1024,
    AT: 2048,
    SO: 4096,
    AP: 8192,
    PF: 16384,
}

const getMods = (bitmask) => {
    const used = []

    for (const [mod, value] of Object.entries(Mods)) {
        if (bitmask & value) used.push(mod)
    }

    if (used.includes("NC")) used.splice(used.indexOf("DT"), 1)
    if (used.includes("PF")) used.splice(used.indexOf("SD"), 1)

    return {
        list: used,
        string: (sep = " ") => used.join(sep),
        has: (mod) => used.includes(mod),
    }
}

// ================================
// Endpoints
// ================================

const getMatch = async (matchId) => {
    return request("get_match", { mp: matchId })  
}

const getUser = async (user, mode = 0, eventDays = 1) => {
    const data = await request("get_user", {
        u: user,
        m: getMode(mode),
        event_days: eventDays,
    })

    if (!data.length) return null

    const u = data[0]

    return {
        id: Number(u.user_id),
        username: u.username,
        country: u.country,
        level: Number(u.level),
        accuracy: Number(u.accuracy),
        playcount: Number(u.playcount),
        pp: Number(u.pp_raw),
        rankGlobal: Number(u.pp_rank),
        rankCountry: Number(u.pp_country_rank),
        joinDate: u.join_date,
    }
}

const getUserRecent = async (user, mode = 0, limit = 10) => {
    return request("get_user_recent", {
        u: user,
        m: getMode(mode),
        limit,
    })
}

const getUserBest = async (user, mode = 0, limit = 10) => {
    const data = await request("get_user_best", {
        u: user,
        m: getMode(mode),
        limit,
    })

    return data.map((score) => ({
        scoreId: Number(score.score_id),
        beatmapId: Number(score.beatmap_id),
        pp: Number(score.pp),
        maxCombo: Number(score.maxcombo),
        accuracy:
        ((score.count300 * 300 +
            score.count100 * 100 +
            score.count50 * 50) /
            ((score.count300 +
            score.count100 +
            score.count50 +
            score.countmiss) *
            300)) *
        100,
        mods: getMods(Number(score.enabled_mods)),
        date: score.date,
    }))
}

const getScore = async (
    beatmapId,
    user,
    mode = 0,
    limit = 50
    ) => {
    return request("get_scores", {
        b: beatmapId,
        u: user,
        m: getMode(mode),
        limit,
    })
}

const getBeatmap = async (beatmapId) => {
    const data = await request("get_beatmaps", { b: beatmapId })
    return data.length ? data[0] : null
}

module.exports = {
    getReverseMode,
    getMatch,
    getMode,
    getMods,
    getScore,
    getUserRecent,
    getUserBest,
    getUser
}

console.log(OSU_API_KEY)