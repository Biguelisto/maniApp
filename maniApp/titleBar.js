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
    const Data = await window.Scrapper.ScrapeBeatmap('https://osu.ppy.sh/beatmapsets/2046363#mania/4283840')
    console.log(Data)
}

LoadUser()