import { GetMatch } from "./scrapperWrapper.js"

const CloseButton = document.querySelector("[title='closeWindow']")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.close()
})

const MinimizeButton = document.querySelector("[title='minimizeWindow']")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.minimize()
})

GetMatch(120928816)