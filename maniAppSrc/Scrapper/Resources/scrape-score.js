function ReadMarkers(Source, Marker, Marker2) {
    const Pos = Source.indexOf(Marker)
    if (Pos === -1) { return }

    const Start = Pos + Marker.length
    const End = Source.indexOf(Marker2, Start)
    if (End === -1) { return }

    let JSONData = Source.slice(Start, End)
    JSONData = JSONData
        .replace(/&quot;/g, "\"")
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
    
    return JSONData
}

//! Scores are plays done in single-player!!!
async function ScrapeScore(ScoreURL, Stable) {
    if (!ScoreURL) { return }
    if (!String(ScoreURL).match('https://')) { // Not an URL -> Assumes it is an ScoreID
        ScoreURL = `https://osu.ppy.sh/scores/${ScoreURL}`
    }

    const Data = await fetch(ScoreURL, {
        method: "GET",
        headers: {
            'Content-Type': 'text/html'
        }
    })
    if (!Data.ok) { return }
    const HTML = await Data.text()

    const Show = ReadMarkers(HTML, `<script id="json-show" type="application/json">`, `</script>`)
    const Raw = ReadMarkers(HTML, `<script id="json-raw" type="application/json">`, `</script>`)
    const User = ReadMarkers(HTML, `<script id="json-current-user" type="application/json">`, `</script>`)

    let FullData = "{\"show\":" + Show
    FullData += ",\"user\":" + User
    FullData += ",\"raw\":" + Raw
    FullData += "}"
    return JSON.parse(FullData)
}

module.exports = {
    ScrapeScore
}