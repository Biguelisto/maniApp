import { GetMatch, ClearMatchCache, GetFullMatchCache, MatchCache, MatchCacheBatch, MatchCacheBatchCall, ReadMatchCache, RemoveMatchCache, WriteMatchCache } from "./APIWrapper.js"

const CloseButton = document.querySelectorAll(".closeWindowButton").forEach(CloseButton => {
    CloseButton.addEventListener("click", (e) => {
        window.titleBarAPI.Close();
    });
});

const MaximizeButton = document.querySelectorAll(".maximizeWindowButton").forEach(maximizeButton => {
//let isMaximized = false;
    maximizeButton.addEventListener("click", (e) => {
        window.titleBarAPI.Maximize();
        /*
        isMaximized = !isMaximized;
        if (isMaximized) {
            maximizeButton.textContent = "❐";
            return;
        }
        maximizeButton.textContent = "▢";
        */
    });
});

const MinimizeButton = document.querySelectorAll(".minimizeWindowButton").forEach(minimizeButton => {
    minimizeButton.addEventListener("click", () => {
        window.titleBarAPI.Minimize();
    });
});

setTimeout(async () => {
    // 121874899
    //console.log(await GetMatch(121860061));
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

//Prevenir que o clique do meio abra uma nova aba
const logoLink = document.querySelector('.header-logo a');
logoLink.addEventListener('auxclick', (e) => {
    e.preventDefault();
});
