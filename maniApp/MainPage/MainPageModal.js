//modal
const modal = document.getElementById('create-match-modal');

//abre modal
const openButton = document.querySelector('.match-card-create')
openButton.addEventListener('click', () => { modal.showModal(); }
);

//fecha modal
const closeButton = modal.querySelector('.modal-close')
closeButton.addEventListener('click', () => { modal.close(); }
);

//pega valores dos inputs usando data-field
const LobbyName = modal.querySelector('[data-field="lobbyName"]')
const LobbyId = modal.querySelector('[data-field="lobbyId"]')
const LobbyBanner = modal.querySelector('[data-field="lobbyBanner"]')

//validação do id do lobby
const lobbyIdError = modal.querySelector('.lobby-id-error');

//Criando match
const submitButton = modal.querySelector('.modal-create-btn')
submitButton.addEventListener('click', () => {
    const name = LobbyName.value;
    const id = LobbyId.value;
    const banner = LobbyBanner.value;

    //Lógica da validação do id do lobby
    const regexSoNumeros = /^[0-9]+$/;
    if (!regexSoNumeros.test(id)) {
        lobbyIdError.classList.add('show');
        setTimeout(() => {
            lobbyIdError.classList.remove('show');
        }, 1000);
        return;
    }

    //cria um objeto com os valores dos inputs
    const match = {
        lobbyName: name,
        lobbyId: id,
        lobbyBanner: banner
    };

    //Criação das divs no html
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

    const matchGrid = document.querySelector('.match-grid');
    matchGrid.appendChild(cardDiv);

    console.log(match);

    //limpa os campos após criar match
    LobbyName.value = "";
    LobbyId.value = "";
    LobbyBanner.value = "";

    modal.close();
})

