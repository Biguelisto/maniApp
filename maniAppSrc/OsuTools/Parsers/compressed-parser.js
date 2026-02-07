// Parses the compressed data for OSR / OSG files

const LZMA = require('lzma-native')

function getPressedColumns(bitmask, keysCount) {
    const pressed = []
    for (let i = 0; i < keysCount; i++) {
        if ((bitmask & (1 << i)) !== 0) pressed.push(i + 1)
    }
    return pressed
}

function ParseFrame(Frame, Mode) {
    const Areas = Frame.split('|')

    switch (Mode) {
        case "mania":
            return {
                Time: Number(Areas[0]),
                Columns: getPressedColumns(Number(Areas[1]), 4),
            }
        case "osu":
            return {
                Time: Number(Areas[0]),
                XPos: Number(Areas[1]),
                YPos: Number(Areas[2]),
                Keys: Areas[3]
            }
    }
}

async function ParseCompressed(CompressedData, Mode) {
    let Decompressed = await LZMA.decompress(CompressedData, { synchronous: true })
    Decompressed = Decompressed.toString('utf8')

    const Frames = Decompressed.split(',')
    const FrameData = []

    let AccTime = 0
    for (let Frame of Frames) {
        let A = ParseFrame(Frame, Mode)
        AccTime += A.Time
        A.Time += AccTime - A.Time

        FrameData.push(A)
    }

    return FrameData
}

module.exports = {
    ParseCompressed
}