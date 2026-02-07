//* Parses OSR files into a usable format

const fs = require('fs')
const Path = require('path')

const { GetMods } = require("../osu-modsparser")
const { ParseCompressed } = require('./compressed-parser')

function ReadULEB128(Buffer, State) {
    let result = 0
    let shift = 0

    while (true) {
        const byte = Buffer[State.Offset++]
        result |= (byte & 0x7f) << shift
        if ((byte & 0x80) === 0) break
        shift += 7
    }

    return result
}

function ReadString(Buffer, State) {
    const flag = Buffer[State.Offset++]
    if (flag === 0x00) return ""

    const length = ReadULEB128(Buffer, State)
    const str = Buffer.toString(
        "utf-8",
        State.Offset, 
        State.Offset + length
    )
    State.Offset += length
    return str
}

async function Parse(FilePath) {
    FilePath = Path.resolve(FilePath)
    const Buffer = fs.readFileSync(FilePath)
    let State = { Offset: 0 }

    // Gamemode
    let Mode = Buffer.readUint8(State.Offset)
    switch (Mode) {
        case 0:
            Mode = 'osu'
        case 1:
            Mode = 'taiko'
        case 2:
            Mode = 'catch'
        case 3:
            Mode = 'mania'
    }
    State.Offset += 1


    // Version
    const Version = Buffer.readUInt32LE(State.Offset)
    State.Offset += 4


    // Beatmap MD5
    const BeatmapMD5Info = ReadString(Buffer, State)


    // Player Name
    const PlayerNameInfo = ReadString(Buffer, State)


    // Replay MD5
    const ReplayMD5Info = ReadString(Buffer, State)


    // Judgement
    const Perfects = Buffer.readUInt16LE(State.Offset)
    State.Offset += 2
    const Goods = Buffer.readUint16LE(State.Offset)
    State.Offset += 2
    const Bads = Buffer.readUInt16LE(State.Offset)
    State.Offset += 2
    const Marvelous = Buffer.readUint16LE(State.Offset)
    State.Offset += 2
    const Greats = Buffer.readUInt16LE(State.Offset)
    State.Offset += 2
    const Misses = Buffer.readUInt16LE(State.Offset)
    State.Offset += 2


    // Score
    const TotalScore = Buffer.readUInt32LE(State.Offset)
    State.Offset += 4


    // Max Combo
    const MaxCombo = Buffer.readUInt16LE(State.Offset)
    State.Offset += 2


    // FS?
    const FS = Buffer.readUInt8(State.Offset)
    State.Offset += 1


    // Mods
    let Mods = Buffer.readUint32LE(State.Offset)
    Mods = GetMods(Mods).Dict()
    State.Offset += 4


    // Life
    const LifeBarGraphInfo = ReadString(Buffer, State)
    let Splitted = LifeBarGraphInfo.split('|')
    const LifeBarGraph = []

    let i = 0
    for (let Split of Splitted) {
        i += 1
        if (i == 1) { continue } // Skips first

        const EvenMoreSplitted = Split.split(',')
        LifeBarGraph.push({ Life: Number(EvenMoreSplitted[0]), MS: Number(EvenMoreSplitted[1]) })
    }


    // Time Stamp
    let TimeStamp = Buffer.readBigInt64LE(State.Offset)
    TimeStamp /= 10000000n // To seconds
    State.Offset += 8


    // Compressed replay data
    const Length = Buffer.readInt32LE(State.Offset)
    State.Offset += 4
    
    let CompressedData = Buffer.subarray(State.Offset, State.Offset + Length)
    CompressedData = await ParseCompressed(CompressedData, Mode)
    State.Offset += Length


    // Online Score ID
    const OnlineScoreID = Buffer.readBigInt64LE(State.Offset)
    State.Offset += 8


    const Structure = {
        Mode: Mode,
        GameVersion: Version,
        BeatmapMD5: BeatmapMD5Info,
        Player: PlayerNameInfo,
        ReplayMD5: ReplayMD5Info,

        Judgement: {
            Marvelous: Marvelous,
            Perfect: Perfects,
            Great: Greats,
            Good: Goods,
            Bad: Bads,
            Misses: Misses
        },

        Score: TotalScore,
        MaxCombo: MaxCombo,

        Mods: Mods,

        FullCombo: FS == 1,
        LifeGraph: LifeBarGraph,

        TimeStamp: TimeStamp,
        CompressedData: CompressedData,

        OnlineScoreID: OnlineScoreID
    }
    console.log(Structure)
    return Structure
}

module.exports = {
    Parse
}