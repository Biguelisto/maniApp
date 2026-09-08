const modal = document.getElementById('create-match-modal');

const openButton = document.querySelector('.match-card-create')
openButton.addEventListener('click', () => 
    { modal.showModal(); })
;

const closeButton = modal.querySelector('.modal-close')
closeButton.addEventListener('click', () => 
    { modal.close(); }
);