const wins = ["wifi", "bluetooth", "microphoneWindow", "speakerWindow", "agsNC", "mpris", "clockWin", "PP", "mainMenuWin"]

export default (winName: string = "") => {
    wins.filter(w => w != winName).map(wn => {
       if (App.getWindow(wn)?.visible)
            App.closeWindow(wn)
    })
}
