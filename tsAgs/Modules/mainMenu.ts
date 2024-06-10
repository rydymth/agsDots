import closeWin from "tsAgs/Functions/closeWin"

const leftLabel = (label: string) => { 
  return Widget.Label({justification :"left", xalign :0, hpack :"start", hexpand :true, label: label})
}

export const mainMenuWindow = Widget.Window({
  visible: false,
  class_name: "mainMenuWin",
  name: "mainMenuWin",
  anchor: ["top", "left"],
  margins: [5, 10],  
  keymode: "exclusive",
  setup: self => self.keybind("Escape", () => Utils.timeout(500, () => {  
      App.closeWindow(self.name || "")
  })),
  child: Widget.Box({
    class_name: "mainMenuMenu",
    vertical: true,
    spacing: 5,
    children: [
      Widget.EventBox({
        class_name: "mainEventBox",
        child: leftLabel("Check Resources"),
        on_primary_click: () => {
          mainMenuWindow.visible = false
          Utils.execAsync(['kitty', '-e', 'htop'])
        },
      }),
      Widget.EventBox({
        class_name: "mainEventBox",
        child: leftLabel("Kill App"),
        on_primary_click: () => {
          mainMenuWindow.visible = false
          Utils.exec(['hyprctl', 'kill'])
        },
      }),
      Widget.EventBox({
        class_name: "mainEventBox",
        child: leftLabel("Sleep"),
        on_primary_click: () => {
          mainMenuWindow.visible = false
          Utils.execAsync(['systemctl', 'suspend'])
        },
      }),
      Widget.EventBox({
        class_name: "mainEventBox",
        child: leftLabel("Reboot"),
        on_primary_click: () => {
          mainMenuWindow.visible = false
          Utils.execAsync(['reboot'])
        },
      }),
      Widget.EventBox({
        class_name: "mainEventBox",
        child: leftLabel("Shutdown"),
        on_primary_click: () => {
          mainMenuWindow.visible = false
          Utils.execAsync(['shutdown', 'now'])
        },
      }),
    ]
  })
})

export const mainMenu = () => Widget.EventBox({
  class_name: "mainMenuLogo",
  child: Widget.Icon({
    class_name: "mainMenuLogo",
    icon: "Apple-symbolic",
    size: 20,
    css: "color: black",
  }),
  on_primary_click: () => {
    closeWin("mainMenuWin")
    mainMenuWindow.visible = !mainMenuWindow.visible    
  }
})
