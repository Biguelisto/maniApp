const Mods = {
    None        : 0,
    NF          : 1,
    EZ          : 2,
    TD          : 4,
    HD          : 8,
    HR          : 16,
    SD          : 32,
    DT          : 64,
    RX          : 128,
    HT          : 256,
    NC          : 512,          // Only set along with DoubleTime. i.e: NC only gives 576
    FL          : 1024,
    AT          : 2048,
    SO          : 4096,
    AP          : 8192,         // Autopilot
    PF          : 16384,        // Only set along with SuddenDeath. i.e: PF only gives 16416  
    '4K'        : 32768,
    '5K'        : 65536,
    '6K'        : 131072,
    '7K'        : 262144,
    '8K'        : 524288,
    FI          : 1048576,
    RD          : 2097152,
    CN          : 4194304,
    TR          : 8388608,
    '9K'        : 16777216,
    COOP        : 33554432,
    '1K'        : 67108864,
    '3K'        : 134217728,
    '2K'        : 268435456,
    V2          : 536870912,
    MR          : 1073741824,
}

function GetMods(EnabledMods) {
    // Turn it into binary to know the mods used
    let UsedMods = {}
    let N = Number(EnabledMods)

    let X = null
    for (const [Mod, BinaryValue] of Object.entries(Mods).reverse()) {
        if (N == 0) {
            break
        }

        if (!X) { X = BinaryValue } else { X /= 2 }
        if (X > N) {
            continue
        }

        N -= X
        UsedMods[Mod] = true
    }

    if (UsedMods["NC"]) {
        delete UsedMods.DT
    }

    if (UsedMods["PF"]) {
        delete UsedMods.SD
    }

    const Controller = {}
    Controller.String = (Separator) => {
        Separator = Separator || " "
        let S = ""
        for (const Mod in UsedMods) {
            S += Mod + Separator
        }
        return S.slice(0, S.length - Separator.length)
    }
    Controller.Dict = () => {
        return UsedMods
    }

    return Controller
}

module.exports = {
    GetMods
}