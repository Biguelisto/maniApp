const openButtons = document.querySelectorAll('.match-card-create');

openButtons.forEach(div => {
    div.addEventListener('click', () => {
        const modalId = div.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.showModal();
        }
    });
});

const closeButtons = document.querySelectorAll('.modal-close');

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.close();
        }
    });
});