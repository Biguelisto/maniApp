const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.Close()
})

const MaximizeButton = document.querySelector(".maximizeWindowButton")
MaximizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Maximize()
})

const MinimizeButton = document.querySelector(".minimizeWindowButton")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Minimize()
})