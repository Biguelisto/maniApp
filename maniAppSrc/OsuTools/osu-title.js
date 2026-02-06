const { exec } = require("child_process")
const os = require("os");

/**
 * @example const Title = await OsuTitle()
 * @returns {string?} The full window title
 * @throws {null} If osu is not open
 */
async function OsuTitle() {
    let CMD

    switch (os.platform()) {
        case 'win32':
            CMD = `powershell -NoProfile -Command "(Get-Process 'osu!' -ErrorAction SilentlyContinue).MainWindowTitle"`
            break
    }
    if (!CMD) { return console.error('Unsupported OS')}

    return new Promise((resolve, reject) => {
        exec(CMD, { maxBuffer: 1024 * 1024 }, (Error, Out, CMDError) => {
            if (Error) {
                reject("Error occured: ", Error)
                return
            }
            if (CMDError) {
                reject("Command Error occured: ", CMDError)
                return
            }

            let Return = Out.replace('\n', '')
            if (Out == '') { Return = null }
            resolve(Return)
        })
    })
}
module.exports = {
    OsuTitle
}