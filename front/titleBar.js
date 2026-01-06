const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.api.close()
})