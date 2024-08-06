import { indFn, audioWinContents } from "./Audio";
import { scrollable, dnd, clear } from "./NotificationCenter";
import { wifiBoxConetents } from "./Wifi";
import { btChild } from "./Bluetooth";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0";
const network = await Service.import('network')
const bluetooth = await Service.import('bluetooth')
const notifications = await Service.import("notifications")

export const commonWindow = () => Widget.Window({
    visible: false,
    class_name: "utilWindow",
    name: "utilWindow",
    margins: [25, 25], 
    keymode: "exclusive",
    child: Widget.Box({
       class_name: "UtilContainer", 
    })
})

const cpu = Variable(0, {
    poll: [2000, `grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}'`]
})

const ram = Variable(0, {
    poll: [2000, `free | grep Mem | awk '{print $3/$2 * 100.0}'`]
})

const cpuProgress = () => Widget.CircularProgress({
    hexpand: true,
    vexpand: true,
    value: cpu.bind(),
    child: Widget.Icon("org.gnome.SystemMonitor-symbolic"),  
})

const ramProgress = () => Widget.CircularProgress({
    hexpand: true,
    vexpand: true,
    value: ram.bind(),
    child: Widget.Icon("drive-harddisk-solidstate-symbolic")
})

function notifs() {
    return Widget.EventBox({
        class_name: "notifCenter",
        child: Widget.Box(
            {class_name: "ncBox", spacing: 3},
            Widget.Overlay({
                child: Widget.Label({label: `󰂚   `}),
                overlays: [Widget.Label({css: "font-size: 0.7rem", hpack: "end", vpack: "fill"})
                            .hook(notifications, self => {
                        self.label = `${notifications.notifications.length}`
                       })],
                pass_through: true,
            })
        )
    })
}

const WifiIndicator = () => Widget.Box({
    children: [
        Widget.Icon({
            icon: network.wifi.bind('icon_name'),
            tooltip_text: network.wifi.bind("frequency").as(f => `${f}`),
        }),
    ],
})

const WiredIndicator = () => Widget.Icon({
    icon: network.wired.bind('icon_name'),
    tooltip_text: network.wired.bind('speed'),
})

const bluetoothInd = () => Widget.Icon({
    visible: bluetooth.bind("enabled"),
    icon: bluetooth.bind('enabled').as(on =>
        `bluetooth-${on ? 'active' : 'disabled'}-symbolic`),
})

const uptime = Variable("", {
    poll: [60000, "uptime --pretty"],
}) 

const uptimeLabel = () => Widget.EventBox({
    child: Widget.Label({
        hexpand: true,
        justification: "left",
        class_name: "SysInfoElements uptime",
        label: uptime.bind().as(up => `${up}`)
    })
})

const sysInd = (widget: Gtk.Widget, action: Gtk.Widget) => Widget.Box({
    class_name: "sysIndButtonContainer",
    child: Widget.Button({
        class_name: "sysIndButton",
        child: widget,
        on_clicked: () => {
            commonWindow().child.child = action;
            commonWindow().visible = true;       
        }
    })
})

Widget.CenterBox({
    class_name: "allInOneCenterBox",
    vertical: true,
    spacing: 10,
    center_widget: Widget.Box({
        hexpand: true,
        vexpand: true,
        class_name: "SysInfo",
        vertical: true,
        children: [
            uptimeLabel(),
            Widget.Box({
                class_name: "SysInfo",
                spacing: 5,
                children: [
                    cpuProgress(),
                    ramProgress(),
                ]
            })
        ],
    }),
    start_widget: Widget.Box({
        hexpand: true,
        vexpand: true,
        class_name: "NotificationCenter",
        vertical: true,
        children: [
            Widget.Box(
                {
                    hexpand: true,
                    vexpand: true,
                    class_name: "notifHandler",
                },
                dnd(),
                clear(),
            ),
            scrollable(),
        ]
    }),
    end_widget: Widget.Box({
        class_name: "SysIndicators",
        children: [          
            sysInd(WifiIndicator(), wifiBoxConetents()),
            sysInd(bluetoothInd(), btChild()),
            sysInd(indFn("speaker"), audioWinContents("speaker")),
            sysInd(indFn("microphone"), audioWinContents("microphone")),
        ]
    }),
})

export const controlWindow = () => Widget.Window({
    visible: false,
    name: "controlPanel",
    class_name: "controlPanel",
    margins: [10, 10],
    anchor: ["top", "left"],
    keymode: "exclusive",
    
})

export const indIcons = () => Widget.EventBox({
    class_name: "sysIndBarIcons",
    child: Widget.Box(
        { spacing: 5, class_name: "indIcons", },
        indFn("speaker"),
        indFn("microphone"),
        WiredIndicator(),
        WifiIndicator(),
        notifs(),
    ),
    on_primary_click: () => { controlWindow().visible = !controlWindow().visible },
})
