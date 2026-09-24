import { WriteMatchCache, ReadMatchCache, GetFullMatchCache, MatchCache } from "../APIWrapper.js"

// modal
const modal = document.getElementById('create-match-modal');

// abre modal
const openButton = document.querySelector('.match-card-create')
    openButton.addEventListener('click', () => { modal.showModal(); }
);

// fecha modal
const closeButton = modal.querySelector('.modal-close')
    closeButton.addEventListener('click', () => { modal.close(); }
);

// pega valores dos inputs usando data-field
const LobbyName = modal.querySelector('[data-field="lobbyName"]')
const LobbyId = modal.querySelector('[data-field="lobbyId"]')
const LobbyBanner = modal.querySelector('[data-field="lobbyBanner"]')

// validação do id do lobby
const lobbyIdError = modal.querySelector('.lobby-id-error');
const matchGrid = document.querySelector('.match-grid');

// Cria um novo botão do grid
function create_new_button(match) {
    const nameDiv = document.createElement('div');
    nameDiv.className = 'match-card-name';
    nameDiv.textContent = match.lobbyName;

    const authorDiv = document.createElement("div");
    authorDiv.className = "match-card-author";
    authorDiv.textContent = "Eu";

    const imgDiv = document.createElement("div");
    imgDiv.className = "match-card-image";
    const imgImg = document.createElement("img");
    imgImg.src = match.lobbyBanner;
    imgDiv.appendChild(imgImg);

    const cardDiv = document.createElement('div');
    cardDiv.className = "match-card";
    cardDiv.appendChild(imgDiv);
    cardDiv.appendChild(nameDiv);
    cardDiv.appendChild(authorDiv);

    matchGrid.appendChild(cardDiv);
}

// Criando match
const submitButton = modal.querySelector('.modal-create-btn')
submitButton.addEventListener('click', () => {
    const name = LobbyName.value;
    const id = LobbyId.value;
    const banner = LobbyBanner.value;

    // Lógica da validação do id do lobby
    const regexSoNumeros = /^[0-9]+$/;
    if (!regexSoNumeros.test(id)) {
        lobbyIdError.classList.add('show');
        setTimeout(() => {
            lobbyIdError.classList.remove('show');
        }, 1000);
        return;
    }

    // cria um objeto com os valores dos inputs
    const match = {
        lobbyName: name,
        lobbyId: id,
        lobbyBanner: banner
    };

    // Criação das divs no html
    create_new_button(match);
    const cache_match = new MatchCache(match.lobbyId, match.lobbyName, match.lobbyBanner);
    WriteMatchCache(cache_match);
    console.log(match);

    // limpa os campos após criar match
    LobbyName.value = "";
    LobbyId.value = "";
    LobbyBanner.value = "";

    modal.close();
})

// Carrega todos os matches guardados no cache
document.addEventListener("DOMContentLoaded", async () => {
    const all_cache = await GetFullMatchCache();
    for (const cache_key of all_cache) {
        const match = {
            lobbyName: cache_key.Name,
            lobbyId: cache_key.MatchIDs,
            lobbyBanner: cache_key.Banner
        }
        create_new_button(match);
    }
})