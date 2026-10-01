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

//PROVISÓRIO PQ ESSE É O UNICO JS QUE ACESSA TUDO
//Sincronização de id nas paginas Leaderboard, Overview e Players
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const navLinks = document.querySelectorAll('.nav-list a');

if (id) { //validação contra id null
    navLinks.forEach(link => {
        link.href = link.href + '?id=' + id;
    });
}

async function loadMatch() {
    const dados = await ReadMatchCache(id);
    const matchName = document.querySelector('.match-name');
    matchName.textContent = dados.Name;
    const matchBanner = document.querySelector('.match-avatar');
    matchBanner.src = dados.Banner;
}
if (id) {
    loadMatch();
}