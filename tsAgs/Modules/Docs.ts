import { Application } from "types/service/applications"
import { Workspace } from "types/service/hyprland"
const apps = await Service.import("applications")
const { query } = apps
const hypr = await Service.import("hyprland")
import { size } from "tsAgs/main"

const dockItem = (app: Application) => Widget.EventBox({
  attribute: { app },
  class_name: "DockItems",
  child: Widget.Box({
    class_name: "DockIcon",
    children: [
      Widget.EventBox({
        class_name: "DockAppIconEB",
        child: Widget.Icon({
          class_name: "DockAppIcon",
          icon: app.icon_name || "application-x-executable",
          size: size + 5,
        }),
        on_primary_click: () => {
          app.launch()
        },
        tooltip_text: app.name || "Some unknown App"
      })
    ]
  }),
})

const applications = query("").slice(0, 5)

const focus = (address: string) => hypr.messageAsync(`dispatch focuswindow address:${address}`)

const RunningAppInd = (address: string) => {
  const client = hypr.getClient(address)
  if (!client || client.class === "")
    return Widget.Box({ visible: false })

  const app = apps.list.find(a => a.match(client.class))

  const appButton = Widget.EventBox({
    class_name: "DockItem",
    child: Widget.Box({
      className: "DockIndivisualItem",
      children: [
        Widget.Icon({
          className: "DockAppIcon",
          icon: app?.icon_name || "application-x-executable",
          size: size + 5,
        })
      ]
    }),
    on_primary_click: () => focus(address),
    on_secondary_click: () => app && app.launch(),
    setup: self => self.hook(hypr, () => {
      self.tooltip_text = hypr.getClient(address)?.title || ""
    })
  })

  return appButton
}

const RunningAppsDock = (w: Workspace) => Widget.Box({
  spacing: 3,
  class_name: "DockWsElement",
  children: [
    Widget.Label({
      class_name: "DockWsId",
      label: `${w.name}:`,
      setup: self => {
        self.toggleClassName("ActiveWsElement", hypr.active.workspace.id === w.id)
      }
    }),
    Widget.Box({
      class_name: "DocsWsItems",
      spacing: 3,
      children: hypr.clients.filter( c => c.workspace.id === w.id).map(c => RunningAppInd(c.address))
    })
  ],
})

export default (mon: number) => Widget.Box({
  class_name: "Dock",
  spacing: 10,
  children: [
    Widget.Box({
      spacing: 5,
      class_name: "DockFixedApps",
      setup: self => self.hook(hypr, () => {
        if (hypr.clients.length === 0)
          self.children = [ 
            Widget.Box({
              class_name: "Dock0Clients",
              spacing: 10,
              children: applications.map(dockItem)
            }) 
          ]
        else
        {
          self.children = hypr.monitors.filter(m => mon === m.id).map(m => {
            return Widget.Box({
              class_name: "wspSuper",
              spacing: 5,
              children: [
                // Widget.Label({
                //   class_name: "MonName",
                //   label: `${m.name}  `,
                // }),
                Widget.Box({
                  class_name: "DockIcons",
                  spacing: 10,
                  children: hypr.workspaces.filter(w => w.monitorID === m.id).filter(w => w.id > 0).sort((a, b) => a.id - b.id).map(RunningAppsDock)
                })
              ]
            })
          })
        }
      })
    }),
  ]
})
