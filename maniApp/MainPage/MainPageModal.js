import { WriteMatchCache, ReadMatchCache, GetFullMatchCache, MatchCache } from "../APIWrapper.js"

// modal
const modal = document.getElementById('create-match-modal');

// abre modal
const openButton = document.querySelector('.match-card-create')
openButton.addEventListener('click', () => { modal.showModal(); }
);

// pega valores dos inputs usando data-field
const LobbyName = modal.querySelector('[data-field="lobbyName"]')
const LobbyId = modal.querySelector('[data-field="lobbyId"]')
const LobbyBanner = modal.querySelector('[data-field="lobbyBanner"]')

// validação do id do lobby
const lobbyIdError = modal.querySelector('.lobby-id-error');
const matchGrid = document.querySelector('.match-grid');

// banner Picker (Abre segundo Modal)
const bannerPickerModal = document.getElementById('banner-picker-modal');
const openBannerPicker = document.getElementById('open-banner-picker');
openBannerPicker.addEventListener('click', () => { bannerPickerModal.showModal(); });

// fecha modal do banner picker
const bannerPickerClose = bannerPickerModal.querySelector('.modal-close');
bannerPickerClose.addEventListener('click', () => { bannerPickerModal.close(); });

// manda valor do input do banner picker para o input do lobby banner
const bannerPickerInput = bannerPickerModal.querySelector('[data-field="bannerPickerInput"]');
const bannerPickerConfirm = document.getElementById('banner-picker-confirm');

// pega a área de upload e a imagem de preview
const uploadArea = document.getElementById('open-banner-picker');
const bannerPreviewImg = document.getElementById('banner-preview-img');
const default_icon = '../assets/import.png';

// atualiza o input do lobby banner e o preview da imagem
bannerPickerConfirm.addEventListener('click', () => {
    const valor = bannerPickerInput.value.trim();
    LobbyBanner.value = valor;
    bannerPickerInput.value = "";
    bannerPickerModal.close();

    // atualiza o preview
    if (valor) {
        bannerPreviewImg.src = valor;
        bannerPreviewImg.alt = 'banner preview';
        uploadArea.classList.add('has-preview');
    } else {
        // se confirmar vazio, volta ao ícone
        bannerPreviewImg.src = default_icon;
        bannerPreviewImg.alt = 'import icon';
        uploadArea.classList.remove('has-preview');
    }
});

// fecha modal principal
const closeButton = modal.querySelector('.modal-close');
closeButton.addEventListener('click', () => {
    modal.close();
});

// limpa os campos sempre que o modal principal for fechado (✕, Esc, etc...)
modal.addEventListener('close', () => {
    // limpa os inputs
    LobbyName.value = "";
    LobbyId.value = "";
    LobbyBanner.value = "";
    bannerPickerInput.value = "";

    // restaura o preview
    bannerPreviewImg.src = default_icon;
    bannerPreviewImg.alt = 'import icon';
    uploadArea.classList.remove('has-preview');
});


// Cria um novo botão do grid
function create_new_button(match, id) {
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
    cardDiv.dataset.id = id;
    cardDiv.appendChild(imgDiv);
    cardDiv.appendChild(nameDiv);
    cardDiv.appendChild(authorDiv);

    cardDiv.addEventListener('click', () => {
        console.log(id);
        window.location.href = `../Overview/overview.html?id=${id}`;
    })

    matchGrid.appendChild(cardDiv);
}

// Criando match
const submitButton = modal.querySelector('.modal-create-btn')
submitButton.addEventListener('click', async () => {
    const name = LobbyName.value;
    const id = LobbyId.value;
    const banner = LobbyBanner.value;

    // Validação do ID do lobby (apenas números)
    const regexSoNumeros = /^[0-9]+$/;
    if (!regexSoNumeros.test(id)) {
        lobbyIdError.classList.add('show');
        setTimeout(() => {
            lobbyIdError.classList.remove('show');
        }, 1000);
        return;
    }

    // Cria objeto match e escreve no cache
    const match = { 
        lobbyName: name, 
        lobbyId: id, 
        lobbyBanner: banner 
    };

    // Cria objeto MatchCache e escreve no cache
    const cache_match = new MatchCache(match.lobbyId, match.lobbyName, match.lobbyBanner);
    const newId = await WriteMatchCache(cache_match);
    create_new_button(match, newId);

    console.log(match);

    modal.close();
});

// Carrega todos os matches guardados no cache
document.addEventListener("DOMContentLoaded", async () => {
    const all_cache = await GetFullMatchCache();
    for (const cache_key of all_cache) {
        const match = {
            lobbyName: cache_key.Name,
            lobbyId: cache_key.MatchIDs,
            lobbyBanner: cache_key.Banner
        }
        create_new_button(match, cache_key.ID);
        console.log(match, cache_key.ID);
    }
})