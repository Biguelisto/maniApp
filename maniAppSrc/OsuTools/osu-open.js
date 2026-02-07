// Quite self-explanatory

const { exec } = require("child_process")
const os = require("os");

/**
 * @example const Title = await OsuRunning()
 * @returns {boolean}
 * @throws {null} If osu is not open or unsupported OS
 */
async function OsuRunning() {
    let CMD

    switch (os.platform()) {
        case 'win32':
            CMD = "tasklist"
            break
        case "darwin":
            command = 'ps -ax -o pid,comm';
            break;
        case "linux":
            command = 'ps -e -o pid,comm';
            break;
    }
    if (!CMD) { return}

    return new Promise((resolve, reject) => {
        exec(CMD, { maxBuffer: 1024 * 1024 }, (Error, Out, CMDError) => {
            if (Error || CMDError) {
                reject("Error occured: ", Error, CMDError)
                return
            }

            resolve(Out.match("osu!") != null)
        })
    })
}
module.exports = {
    OsuRunning
}