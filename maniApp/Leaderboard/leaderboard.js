import { ReadMatchCache, GetMatch } from "../APIWrapper.js"

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const songGrid = document.getElementById('songGrid');

function create_grid_item(text, iconSrc) {
    const iconImg = document.createElement('img');
    iconImg.className = 'song-card-icon';
    iconImg.src = iconSrc;

    const textDiv = document.createElement('div');
    textDiv.className = 'song-card-text';
    textDiv.textContent = text;

    const gridDiv = document.createElement('div');
    gridDiv.className = 'song-card-grid';
    gridDiv.appendChild(iconImg);
    gridDiv.appendChild(textDiv);

    return gridDiv;
}

function create_song_card(song) {
    const difDiv = document.createElement('div');
    difDiv.className = 'song-card-dif';
    difDiv.textContent = song.game.beatmap.version;

    const topDiv = document.createElement("div");
    topDiv.className = "song-card-top";
    topDiv.appendChild(difDiv);

    const artistDiv = document.createElement("div");
    artistDiv.className = "song-card-artist";
    artistDiv.textContent = song.game.beatmap.beatmapset.artist;

    const nameDiv = document.createElement("div");
    nameDiv.className = "song-card-name";
    nameDiv.textContent = song.game.beatmap.beatmapset.title;

    const bottomDiv = document.createElement("div");
    bottomDiv.className = "song-card-bottom";
    bottomDiv.appendChild(artistDiv);
    bottomDiv.appendChild(nameDiv);

    const leftDiv = document.createElement("div");
    leftDiv.className = "song-card-left";
    leftDiv.style.backgroundImage = `url("${song.game.beatmap.beatmapset.covers["cover@2x"]}")`;
    leftDiv.appendChild(topDiv);
    leftDiv.appendChild(bottomDiv);

    const rightDiv = document.createElement('div');
    const mapperAvatar = `https://a.ppy.sh/${song.game.beatmap.beatmapset.user_id}`;
    rightDiv.className = 'song-card-right';
    rightDiv.appendChild(create_grid_item(song.game.beatmap.difficulty_rating, '../assets/srIcon.png'));
    rightDiv.appendChild(create_grid_item(song.game.beatmap.total_length, '../assets/lengthIcon.png'));
    rightDiv.appendChild(create_grid_item(song.game.scores.length, '../assets/playerIcon.png'));
    rightDiv.appendChild(create_grid_item(song.game.beatmap.beatmapset.creator, mapperAvatar));


    const containerDiv = document.createElement('div');
    containerDiv.className = 'song-card-container';
    containerDiv.appendChild(leftDiv);
    containerDiv.appendChild(rightDiv);

    songGrid.appendChild(containerDiv);
}

async function loadSongs() {
    const dados = await ReadMatchCache(id);
    const matchData = await GetMatch(dados.MatchIDs);
    const songs = matchData.events.filter(event => event.game && event.game.beatmap);

    songs.forEach(song => {
        create_song_card(song);

    });
}

if (id) {
    loadSongs();
}