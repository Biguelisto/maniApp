// Name is cache but this actually saves the created matches for later use

const { ipcMain } = require("electron");

const fs = require("fs")
const readline = require('readline');
const { getCppHeapStatistics } = require("v8");
const { zstdCompress } = require("zlib");

const File = './maniAppSrc/matchcache/matchcache.jsonl'
const FileTmp = './maniAppSrc/matchcache/matchcache.tmp'
let CurrentHighestID = -1

async function GetCurrentID() {
    const ReadStr = fs.createReadStream(
        File,
        {
            encoding: "utf-8",
            highWaterMark: 4 * 1024 // 4KB
        }
    )

    let LastChunck = null // LastChunck 100% has the last ID
    try {
        for await (const Chunk of ReadStr) {
            LastChunck = Chunk
        }
    } catch(Err) {
        console.error(Err)
    }
    if (!LastChunck) return 0;

    let LastIDOcc = LastChunck.lastIndexOf('"ID":')
    if (!LastIDOcc) return 0;

    let LastIDEnd = LastChunck.indexOf(',', LastIDOcc)
    return Number(LastChunck.slice(LastIDOcc + (`"ID":`).length, LastIDEnd))
}

async function ReadWithID_Line(ID) {
    const input = fs.createReadStream(File)
    const RL = readline.createInterface({input})

    for await (const Line of RL) {
        const IsTheRightObject = Line.startsWith(`{"ID": ${ID}`)
        if (!IsTheRightObject) continue
        return JSON.parse(Line)
    }
}

async function RemoveWithID(ID) {
    const input = fs.createReadStream(File)
    const Output = fs.createWriteStream(FileTmp)
    const RL = readline.createInterface({input})

    for await (const Line of RL) {
        const IsTheRightObject = Line.startsWith(`{"ID": ${ID}`)
        if (IsTheRightObject) continue
        Output.write(Line + "\n");
    }
    Output.end();

    await new Promise(resolve => Output.on("finish", resolve));
    await fs.promises.rename(FileTmp, File);
}

async function ClearCache() {
    const Output = fs.createWriteStream(FileTmp);
    Output.end();

    await new Promise(resolve => Output.on("close", resolve));
    await fs.promises.rm(File, { force: true });
    await fs.promises.rename(FileTmp, File);
}

function GetFull() {
    const Data = fs.readFileSync(File, { encoding: "utf8" })
    const Separations = Data.split('\n')

    const Parsed = []
    for (const Sep of Separations) {
        if (Sep == "") continue
        Parsed.push(JSON.parse(Sep))
    }
    return Parsed
}

function GetCacheSize() {
    const Data = fs.readFileSync(File, { encoding: "utf8" })
    const Separations = Data.split('\n')

    return Separations.length - 1 // Last line is empty
}

async function WriteNew(JSONStr) {
    if (CurrentHighestID == -1) { // Didn't get current ID
        CurrentHighestID = await GetCurrentID()
    }
    CurrentHighestID += 1

    let Formatted = `{"ID": ${CurrentHighestID},`
    Formatted += JSONStr
        .slice(1)
        .replace(/\n/g, "")
        .replace(/  /g, "")
    Formatted += "\n"
    
    try {
        fs.writeFileSync(
            File,
            Formatted,
            {
                flag: "a",
                encoding: "utf8"
            }
        )
    } catch(Err) {
        console.error(Err)
    }

    return CurrentHighestID
}



async function DoCallBatch(Batch) {
    let FuncMap = {
        "write": WriteNew,
        "read": ReadWithID_Line,
        "remove": RemoveWithID,
        "getfull": GetFull,
        "clear": ClearCache,
        "cachesize": GetCacheSize
    }

    let ReturnValues = []
    for (let [Command, Args] of Batch) {
        let Func = FuncMap[Command.toLowerCase()]
        if (!Func) continue
        ReturnValues.push(await Func(...Args))
    }
    return ReturnValues
}

function CacheStart() {
    ipcMain.handle("WriteMatchCache", async (_, JSONStr) => {
        return await WriteNew(JSONStr)
    })
    ipcMain.handle("ReadMatchCache", async (_, ID) => {
        return await ReadWithID_Line(ID)
    })
    ipcMain.handle("RemoveMatchCache", async (_, ID) => {
        return await RemoveWithID(ID)
    })
    ipcMain.handle("GetFullMatchCache", async () => {
        return GetFull()
    })
    ipcMain.handle("ClearMatchCache", async () => {
        ClearCache()
    })
    ipcMain.handle("CallBatches", async (_, Batch) => {
        return await DoCallBatch(Batch)
    })
    ipcMain.handle("GetCacheSize", async (_, Batch) => {
        return GetCacheSize();
    })
}
function CacheEnd() {}

module.exports = {
    CacheStart,
    CacheEnd
}