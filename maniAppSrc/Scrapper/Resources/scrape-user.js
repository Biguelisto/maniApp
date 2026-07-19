async function ScrapeUser(PageURL, Mode, Achievements) {
    if (!PageURL) { return }
    if (!String(PageURL).match('https://')) {
        PageURL = `https://osu.ppy.sh/users/${PageURL}`
    }
    if (Mode) {
        PageURL += `/${Mode}`
    }

    if (!PageURL) { return }

    const Data = await fetch(PageURL, {
        method: "GET",
        headers: {
            'Content-Type': 'text/html'
        }
    })
    if (!Data.ok) { return }

    const HTML = await Data.text()

    const Marker = "data-initial-data=\""
    const Pos = HTML.indexOf(Marker)
    if (Pos === -1) { return }

    const Start = Pos + Marker.length
    const End = HTML.indexOf("\"", Start)
    if (End === -1) { return }

    let JSONData = HTML.slice(Start, End)

    JSONData = JSONData
        .replace(/&quot;/g, "\"")
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")

    const Parsed = JSON.parse(JSONData)
    if (!Achievements) {
        delete Parsed.achievements
    }
    return Parsed
}

module.exports = {
    ScrapeUser
}