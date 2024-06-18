const hypr = await Service.import("hyprland")
import { Hyprland } from "types/service/hyprland"
import { Bar, back, Dock } from "tsAgs/main" 

export default () => {
    let n = Variable(hypr.monitors.length)
    hypr.connect("monitor-added", () => {
        Utils.exec(['hyprctl', 'reload'])
    })
    hypr.connect("monitor-removed", (_: Hyprland, mon: string) => {
        if (mon === "DP-3")
            Utils.exec(['hyprctl', 'reload'])
        else
            App.closeWindow("bar-0")
    })
    return Array.from({length: n.value}, (_, i) => Bar(i))
}

export const backAll = () => {
    let n = Variable(hypr.monitors.length)
    hypr.connect("monitor-added", () => {
        Utils.exec(['hyprctl', 'reload'])
    })
    hypr.connect("monitor-removed", (_: Hyprland, mon: string) => {
        if (mon === "DP-3")
            Utils.exec(['hyprctl', 'reload'])
        else
            App.closeWindow("back-0")
    })
    return Array.from({length: n.value}, (_, i) => back(i))
}

export const dockAll = () => {
    let n = Variable(hypr.monitors.length)
    hypr.connect("monitor-added", () => {
        Utils.exec(['hyprctl', 'reload'])
    })
    hypr.connect("monitor-removed", (_: Hyprland, mon: string) => {
        if (mon === "DP-3")
            Utils.exec(['hyprctl', 'reload'])
        else
            App.closeWindow("Dock-0")
    })
    return Array.from({length: n.value}, (_, i) => Dock(i))
}
