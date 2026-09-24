import { ClearMatchCache, GetFullMatchCache, MatchCache, MatchCacheBatch, MatchCacheBatchCall, ReadMatchCache, RemoveMatchCache, WriteMatchCache } from "./APIWrapper.js"

const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.Close()
})

const MaximizeButton = document.querySelector(".maximizeWindowButton")
MaximizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Maximize()
})

const MinimizeButton = document.querySelector(".minimizeWindowButton")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Minimize()
})

setTimeout(async () => {
    const Batch = new MatchCacheBatch()
        .AddCall("Clear")
        .AddCall("Write", (new MatchCache([2], "First call in the batch", "N/A")).Serialize())
        .AddCall("Write", (new MatchCache([2], "Second call in the batch", "N/A")).Serialize())
        .AddCall("Getfull")
        .AddCall("Cachesize")
        .AddCall("Read", 2)
    const Returns = await MatchCacheBatchCall(Batch)
    console.log(Returns[5]) // The "CacheSize"
}, 1000)