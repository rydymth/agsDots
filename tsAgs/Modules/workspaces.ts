import { Monitor } from "types/service/hyprland"

const hyprland = await Service.import("hyprland")

// Functions
const focus = (wid: number) => hyprland.messageAsync(`dispatch workspace ${wid}`)
const scrUp = () => hyprland.messageAsync(`dispatch workspace +1`)
const scrDown = () => hyprland.messageAsync(`dispatch workspace -1`)
const wspEB = (w: {id: number, on: boolean}) => Widget.EventBox({
  class_name: !w.on ? "nullWsp" : "occupied",
  child: Widget.Box({
    class_name: "wspIcon",
  }),
  on_primary_click: () => focus(w.id),
  on_scroll_up: () => scrUp(),
  on_scroll_down: () => scrDown(),
  setup: self => self.toggleClassName("Active", hyprland.active.workspace.id === w.id)
})

const wsp = (mon: number) => hyprland.workspaces.filter(w => w.monitorID === mon).filter(w => w.id >= 0).sort((a, b) => a.id - b.id).map(w => w.id);

const wspHandler = (wsp: number[]) => {
  let workspaces: {id: number, on: boolean}[] = wsp.map(wid => {
    let workspace = hyprland.getWorkspace(wid)
    if (!workspace)
      return { "id": wid, "on": false }
    else return { "id": workspace.id, "on": true}
  })

  let workspaceMap = Widget.Box({
    class_name: "wspElements",
    spacing: 3,
    children: workspaces.map(w => wspEB(w))
  })

  return workspaceMap
}

export default (mon: number) => {
  return Widget.Box({
    class_name: "wspBox",
    setup: self => self.hook(hyprland, () => {
      let monHandle = hyprland.monitors.filter(m => m.id === mon).map(m => wsp(m.id))
      self.children = monHandle.map(m => wspHandler(m))
    })
  })
}
