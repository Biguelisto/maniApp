const CloseButton = document.querySelector(".closeWindowButton")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.Close()
})

const MaximizeButton = document.querySelector(".maximizeWindowButton")
let isMaximized = false
MaximizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Maximize()
    isMaximized = !isMaximized
    if (isMaximized) {
        MaximizeButton.textContent = "❐"
        return
    }
    MaximizeButton.textContent = "▢"
})

const MinimizeButton = document.querySelector(".minimizeWindowButton")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.Minimize()
})