// Gets all replays for the given .osu beatmap difficulty

const Crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const Path = require('path')

const OsuLocalReplayFolder = Path.join(
    os.homedir(),
    'AppData',
    'Local',
    'osu!',
    'Data',
    'r',
)

//* Osu stores local replays with an MD5 Hash string of the map .osu folder
function GetMD5Hash(BeatmapPath) {
    return Crypto
        .createHash('md5')
        .update(fs.readFileSync(BeatmapPath))
        .digest('hex')
}

/**
 * @returns {}
 */
function RecentReplays(BeatmapPath, MaxReplays=5) {
    BeatmapPath = Path.resolve(BeatmapPath)
    const MD5 = GetMD5Hash(BeatmapPath)
    
    let i = 0
    const Contenders = fs.readdirSync(OsuLocalReplayFolder)
        .map((File) => { // Goes through each file and sees if it is a replay matching the MD5 Hash
            if (!File.startsWith(MD5)) { return }
            if (File.endsWith("osg")) { return }

            i += 1
            const FullPath = Path.join(OsuLocalReplayFolder, File)
            const Stat = fs.statSync(FullPath)

            // OSG = Real time replay data
            // OSR = Replay
            return {
                FileOSR: File,
                PathOSR: FullPath,

                FileOSG: File.slice(0, File.length - 3) + "osg",
                PathOSG: FullPath.slice(0, FullPath.length - 3) + "osg",

                Birthtime: Stat.mtimeMs
            }
        })
        .sort((C1, C2) => C2.Birthtime - C1.Birthtime)
        .slice(0, MaxReplays)

    return Contenders
}

module.exports = {
    RecentReplays
}