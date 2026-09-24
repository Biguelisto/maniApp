import { GetMatch, ClearMatchCache, GetFullMatchCache, MatchCache, MatchCacheBatch, MatchCacheBatchCall, ReadMatchCache, RemoveMatchCache, WriteMatchCache } from "./APIWrapper.js"

const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.Close()
})

const MaximizeButton = document.querySelector(".maximizeWindowButton")
let isMaximized = false
MaximizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Maximize()
    isMaximized = !isMaximized
    if (isMaximized) {
        MaximizeButton.textContent = "❐"
        return
    }
    MaximizeButton.textContent = "▢"
})

const MinimizeButton = document.querySelector(".minimizeWindowButton")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Minimize()
})

setTimeout(async () => {
    // 121874899
    console.log(await GetMatch(121860061));
}, 1000)