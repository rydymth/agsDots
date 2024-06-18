const apps = await Service.import("applications")
const hypr = await Service.import("hyprland")
import { size } from "tsAgs/main"
import closeWin from "tsAgs/Functions/closeWin"
const focus = (address: string) => hypr.messageAsync(`dispatch focuswindow address:${address}`)
const getApp = (name: string) => apps.list.find(a => a.match(name))

export const runAppWin = Widget.Window({
  visible: false,
  name: "instanceWindow",
  class_name: "instanceWindow",
  layer: "top",
  anchor: ["bottom"],
  margins: [10, 10],
  keymode: "on-demand",
  setup: self => self.keybind("Escape", () => {
    closeWin("instanceWindow")
    App.toggleWindow("instanceWindow")
  })
})

const btrButton = (iconName: string, className: string, exec: string[]) => Widget.EventBox({
  className: className,
  child: Widget.Icon({
    class_name: `${className}Icon`,
    icon: iconName,
    size: size+3
  }),
  on_primary_click: () => Utils.execAsync(exec)
})

const RunningAppInd = (address: string) => {
  const client = hypr.getClient(address)
  if (!client || client.class === "")
    return Widget.Box({ visible: false })

  let app = getApp(client.class)
  if (!app)
    app = getApp(client.title)

  const appButton = Widget.EventBox({
    class_name: "DockItem",
    child: Widget.Box({
      className: "DockIndivisualItem",
      hexpand: true,
      spacing: 5,
      children:
      [
        Widget.Icon({
         class_name: "DockAppIcon",
         icon: app?.icon_name || "application-x-executable",
         size: size + 5,
         setup: self => self
           .hook(hypr, (_, address: string) => {
             self.toggleClassName("UrgentWindow", address === client.address)
           },"urgent-window")
           .hook(hypr, () => {
             self.toggleClassName("activeApp", hypr.active.client.address === client.address)
           })
        }),
        Widget.Label({
          class_name: "DockAppLabel",
          justification: "right",
          label: client.title
        })
      ]

    }),
    on_primary_click: () => {focus(address); runAppWin.visible = false},
    on_secondary_click: () => app && app.launch(),
  })

  return appButton
}

export function wsps (mon: number) {
    const spotlight = btrButton("open-menu-symbolic", "spotlightDockOpener", ["ags", "-b", "rudy", "-t", "spotlight"])
    const trash = btrButton("trash-symbolic", "trashDockMenu", ["nautilus", "/home/rudy/.local/share/Trash"])

    const clientsClass = (mon: number) => {
    const uniqueClients = new Set(
      hypr.clients
        .filter(c => c.monitor === mon)
        .map(c => JSON.stringify([c.initialClass, c.initialTitle])) // Convert to string
    );

    // Convert back to array of arrays
    return Array.from(uniqueClients).map(str => JSON.parse(str));
  };

  // main super class for app i.e. only the class
  const indRunAppInfo = (name: string[]) => {
    let findName = name[0] ? name[0] : name[1]
    let appName = getApp(findName)
    return Widget.EventBox({
      class_name: "DockClassItemEB",
      child: Widget.Icon({
        class_name: `DockClassIcon ${name[0]}`,
        icon: appName?.icon_name || "application-x-executable",
        size: size + 5,
        setup: self => self.hook(hypr, (_, event: string, data: string) => {
          if (event === "openwindow")
          {
            self.toggleClassName("newAppAnim")
          }
        }, "event")
      }),
      on_primary_click: () => {
        closeWin()
        let client = hypr.clients.filter(c => c.initialClass === name[0] || c.initialTitle === name[1])
        runAppWin.child = Widget.Box(
          {
            class_name: "InstanceBox",
            vertical: true,
            children: client.map(c => RunningAppInd(c.address))
          }
        )
        runAppWin.visible = !runAppWin.visible
      },
      setup: self => {
        self.toggleClassName("activeAppClass", hypr.active.client.class === name[0] || hypr.active.client.title === name[1])
        // console.log(self.child.class_name)
      }
    })
  }

  const classList = (mon: number) => Widget.EventBox({
    class_name:"RunningAppSuper",
    child: Widget.Box({
      spacing: 5,
      className: "IndRunnAppInfo",
      children: clientsClass(mon).map(c => indRunAppInfo(c))
    })
  })

  const monFilter = hypr.monitors.filter(m => m.id === mon)

  const mainDock = Widget.Box({
    class_name: "DockBoxRunApp",
    setup: self => self
      .hook(hypr, () => {
        self.children = monFilter.map(m => classList(m.id))
      })
      .hook(hypr, (_, add: string) => {
        focus(add)
      }, "urgent-window")
  })

  return Widget.Box({
    class_name: "DockBox",
    spacing: 5,
    children: [
      spotlight,
      mainDock,
      Widget.Separator(),
      trash      
    ]
  })
}
