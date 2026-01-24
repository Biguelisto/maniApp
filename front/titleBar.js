const CloseButton = document.querySelector("[title='closeWindow']")
CloseButton.addEventListener("click", (e) => {
    window.titleBarAPI.close()
})

const MinimizeButton = document.querySelector("[title='minimizeWindow']")
MinimizeButton.addEventListener("click", (e) => {
    window.titleBarAPI.minimize()
})

console.log("Front start!")
async function LoadUser() {
    const Data = await window.Scrapper.ScrapeSearch('a')
    console.log(Data)
}

LoadUser()