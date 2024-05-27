const hypr = await Service.import("hyprland")
import { Bar } from "tsAgs/main"

export default () => {
    let n = Variable(hypr.monitors.length)
    hypr.connect("monitor-added", () => {
        n.setValue(hypr.monitors.length)
        App.addWindow(Bar(1))
    })
    hypr.connect("monitor-removed", () => {
        Utils.notify("Restart AGS", "Buggy ags ahhhh shit mf wtf")
        Utils.timeout(3000, () => {
            App.quit()
        })
    })
    return Array.from({length: n.value}, (_, i) => Bar(i))
}
