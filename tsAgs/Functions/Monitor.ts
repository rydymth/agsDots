const hypr = await Service.import("hyprland")
import { Hyprland } from "types/service/hyprland"
import { Bar, back, Dock } from "tsAgs/main" 

export default () => {
    let n = Variable(hypr.monitors.length)
    return Array.from({length: n.value}, (_, i) => Bar(i))
}

export const backAll = () => {
    let n = Variable(hypr.monitors.length)
    return Array.from({length: n.value}, (_, i) => back(i))
}

export const dockAll = () => {
    let n = Variable(hypr.monitors.length)
    return Array.from({length: n.value}, (_, i) => Dock(i))
}
