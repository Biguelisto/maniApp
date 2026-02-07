const { Parse } = require('../OsuTools/Parsers/osr-parser.js')
const { RecentReplays } = require("../OsuTools/osu-replays.js")

const path = require("path")
const os = require('os')

async function Do() {
    const osuPath = path.join(
        os.homedir(),
        'AppData',
        'Local',
        'osu!',
        'Songs',
        '1603060 Various - YSOF#3 -Flame-',
        'Various - YSOF#3 -Flame- (YuEast 2018) [REDALiCE - DEAD or DIE].osu'
    )

    try {
        const Paths = RecentReplays(osuPath)
        const Parsed = await Parse(Paths[0].PathOSR)

        return true
    } catch {
        return false
    }
}
module.exports = {
    Do
}