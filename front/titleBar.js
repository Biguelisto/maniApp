const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.close()
})

const MinimizeButton = document.querySelector(".minimizeWindowButton")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.minimize()
})