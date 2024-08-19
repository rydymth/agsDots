const wins = ["mpris", "clockWin", "PP", "instanceWindow", "controlPanel", "utilWindow"]

export default (winName: string = "") => {
    wins.filter(w => w != winName).map(wn => {
       if (App.getWindow(wn)?.visible)
            App.closeWindow(wn)
    })
}
