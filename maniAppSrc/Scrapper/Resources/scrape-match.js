//! This thing is absurdly big so beware of it.
async function ScrapeMatch(MatchURL) {
    if (!MatchURL) { return }
    if (!String(MatchURL).match('https://')) { // Assumes its ID
        MatchURL = `https://osu.ppy.sh/community/matches/${MatchURL}`
    }

    const Data = await fetch(MatchURL, {
        method: "GET",
        headers: {
            'Content-Type': 'text/html'
        }
    })
    if (!Data.ok) { return }

    const HTML = await Data.text()
    const Marker = `<script id="json-events" type="application/json">`
    const Marker2 = `</script>`

    const Pos = HTML.indexOf(Marker)
    if (Pos === -1) { return }

    const Start = Pos + Marker.length
    const End = HTML.indexOf(Marker2, Start)
    if (End === -1) { return }

    let JSONData = HTML.slice(Start, End)
    JSONData = JSONData
        .replace(/&quot;/g, "\"")
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
    
    return JSON.parse(JSONData)
}

module.exports = {
    ScrapeMatch
}