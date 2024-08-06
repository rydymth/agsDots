const apps = await Service.import("applications")
const hypr = await Service.import("hyprland")
import { size } from "tsAgs/main"
import closeWin from "tsAgs/Functions/closeWin"
import { Application } from "types/service/applications"
const applications = await Service.import("applications")
const focus = (address: string) => hypr.messageAsync(`dispatch focuswindow address:${address}`)
const getApp = (name: string) => apps.list.find(a => a.match(name))

class runApps {
  initialClass: string;
  initialTitle: string;
  app: Application;
  constructor(app: Application, initialClass: string, initialTitle: string)
  {
    this.initialClass = initialClass;
    this.initialTitle = initialTitle;
    this.app = app
  }
}

const pinApp = applications.query("").slice(0,7)
let runningApp: runApps[] = []
runningApp.shift()

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
    size: size+7
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
         size: size + 10,
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

    const clientsClass = (mon?: number) => {
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
    if (name[0] === "code-url-handler")
      appName = getApp("code")
    if (name[0] === "")
      appName = getApp("spotify")
    return Widget.EventBox({
      class_name: "DockClassItemEB",
      child: Widget.Icon({
        class_name: `DockClassIcon ${name[0]}`,
        icon: appName?.icon_name || "application-x-executable",
        size: size + 7,
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

  // Checking which of the pinned apps are running and thus returning the same
  function checkIfRunning(c: string[]) {
    let appClass = c[0]
    let appTitle = c[1]
    // if any of our running app's name is already present in the pinned apps then just ignore/skip the running app
    pinApp.map(app => {
      if (c[0] === "code-url-handler")
        appClass = "code"
      if (c[0] === "")
        appClass = "spotify"
      if (c[0] === "nwg-look")
        appClass = "gtk settings"
      if (c[0] === "io.github.kaii_lb.Overskride")
        appClass = "overskride"
      if (c[0] === "google-chrome")
	appClass = "google chrome"
      if (c[0] === "org.wezfurlong.wezterm")
	appClass = "wezterm"
      if (c[0] === "org.gnome.TextEditor")
	appClass = "text editor"
      if (c[0] === "org.gnome.Calculator")
	appClass = "calculator"
      if (c[0] === "blueman-manager")
        appClass = "bluetooth manager"
      if (c[0] === "nm-connection-editor")
	appClass = "advanced network configuration"
      if (app.name.toLocaleLowerCase().includes(appClass) || app.name.toLocaleLowerCase().includes(appTitle))
      {  
        runningApp.push(new runApps(app, c[0], c[1]))
      }
    })
    return [... new Set(runningApp)].map(rapp => rapp.initialClass)
  }

  const classList = (mon: number) => Widget.EventBox({
    class_name:"RunningAppSuper",
    child: Widget.Box({
      spacing: 5,
      className: "IndRunnAppInfo",
      children: clientsClass(mon)
        .filter(c => !checkIfRunning(c).includes(c[0] || c[1]))
        .map(c => {
          return indRunAppInfo(c)
        }),
      setup: self => self.hook(hypr, () => {
        runningApp = []
        clientsClass(mon).map((c: string[]) => {
          let appClass = c[0]
          let appTitle = c[1]
          // if any of our running app's name is already present in the pinned apps then just ignore/skip the running app
          pinApp.map(app => {
            if (c[0] === "code-url-handler")
              appClass = "code"
            if (c[0] === "")
              appClass = "spotify"
            if (c[0] === "nwg-look")
              appClass = "gtk settings"
            if (c[0] === "io.github.kaii_lb.Overskride")
              appClass = "overskride"
	    if (c[0] === "google-chrome")
	      appClass = "google chrome"
	    if (c[0] === "org.wezfurlong.wezterm")
	      appClass = "wezterm"
	    if (c[0] === "org.gnome.TextEditor")
	      appClass = "text editor"
	    if (c[0] === "org.gnome.Calculator")
	      appClass = "calculator"
            if (c[0] === "blueman-manager")
	      appClass = "blueman-manager"
	    if (c[0] === "nm-connection-editor")
	      appClass = "advanced network configuration"
	    if (app.name.toLocaleLowerCase().includes(appClass) || app.name.toLocaleLowerCase().includes(appTitle))
            {  
              runningApp.push(new runApps(app, c[0], c[1]))
            }
          })
          runningApp = [... new Set(runningApp)]
        })
      }, "client-removed")
    })
  })

  const monFilter = hypr.monitors.filter(m => m.id === mon)

  const pinnedApp = (app: Application) => {
    let runAppSet = [... new Set(runningApp)]
    let runApp = runAppSet.filter(rapp => rapp.app === app)[0]
    if(runApp)
      return indRunAppInfo([runApp.initialClass, runApp.initialTitle])

    return Widget.EventBox({
     class_name: `pinnedApp ${app.name}`,
     child: Widget.Icon({
       class_name: `pinnedAppIcon ${app.name}`,
       icon: app.icon_name || "application-x-executable",
       size: size + 10,
     }),
     on_primary_click: () => { app.launch() },
     tooltip_text: app.name
    })
  }
  
  const pinnedApps = Widget.Box({
    class_name: `pinnedApps`,
    setup: self => self
    .hook(hypr, () => {
      self.children = pinApp.map(c => pinnedApp(c))
    })
  })
  
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
      Widget.Separator(),
      pinnedApps,
      Widget.Separator(),
      mainDock,
      trash      
    ]
  })
}
