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

const wsp = (mon: number) => mon === 0 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12, 13, 14, 15]

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
  let monHandle = hyprland.monitors.filter(m => m.id === mon).map(m => wsp(m.id))
  return Widget.Box({
    class_name: "wspBox",
    setup: self => self.hook(hyprland, () => {
      self.children = monHandle.map(m => wspHandler(m))
    })
  })
}
