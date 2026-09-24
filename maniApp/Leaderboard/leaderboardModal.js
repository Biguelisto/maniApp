document.addEventListener('DOMContentLoaded', function() {

const modal = document.getElementById('leaderboard-modal');
const cards = document.querySelectorAll('.song-card-container');
const closeBtn = document.getElementById('close-leaderboard-modal');

cards.forEach(card => {
    card.addEventListener('click', function() {
    modal.showModal();
    });
                    });

  // Fechar modal com o botão "✕"
if (closeBtn) {
    closeBtn.addEventListener('click', function() {
        modal.close();
    });
}

  // Fechar modal ao clicar no backdrop (área escura ao redor)
modal.addEventListener('click', function(event) {
    if (event.target === modal) {
    modal.close();
    }
});

});