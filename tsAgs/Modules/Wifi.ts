const Network = await Service.import("network")
import closeWin from "tsAgs/Functions/closeWin";
import Tooltips from "tsAgs/Functions/Tooltips.ts";

const wifiWin = "wifi";

const wifiSelectionMenu = Widget.Box({
    class_name: "wifiSelectionMenu",
    vertical: true,
    spacing: 5,
    setup: self => self.hook(Network, () => {
        self.children = Network.wifi.access_points.map(ssid => Widget.EventBox({
            class_name: `wifiList`,
            on_primary_click: () => {
                console.log(ssid.bssid)
                Utils.execAsync(`nmcli device wifi connect ${ssid.bssid}`).catch((c) => Utils.writeFile(c, "~/.cache/agsError").then(() => console.log("success")).catch(() => console.log("ahh shit")))
                console.log(Network.wifi.state)
                if (Network.wifi.state === "config")
                    {
                        console.log("Needing Authentication ok")
                    }
            },
            child: Widget.Box({
                class_name: "accessPoint"+ssid+"attributes",
                hexpand: true,
                spacing: 5,
                children: [
                    Widget.Icon({
                        hpack: "start",
                        class_name: `${ssid}Icon`,
                        icon: ssid.iconName,
                    }),
                    Widget.Label({
                        hpack: "center",
                        class_name: `${ssid}Label`,
                        label: ssid.ssid || "",
                    }),
                    Widget.Label({
                        class_name: `${ssid}ConnectedTick`,
                        label: " ",
                        setup: self => Utils.idle(() => {
                            if (!self.is_destroyed)
                                self.visible = ssid.active
                        })
                    })
                ]
            })
        }))
    })
})

const wifiBoxConetents = Widget.Box({
    class_name: "wifiBoxContents",
    vertical: true,
    spacing: 5,
    children: [
        Widget.Box({
           class_name: "wifiToggleButton",
           hexpand: true,
           children: [
                Widget.Label({
                    class_name: "WifiMenuLabel",
                    hpack: "start",
                    hexpand: true,
                    label: "Wifi Menu",
                }),
                Widget.Switch({
                    class_name: "WifiSwitch",
                    active: Network.wifi.enabled,
                    setup: self => self.on("notify::active", () => {
                        Network.toggleWifi()
                    })
                })
           ]
        }),
        wifiSelectionMenu
    ]
})

export const wifiWindow = () => Widget.Window({
    visible: false,
    class_name: wifiWin,
    name: wifiWin,
    anchor: ["top", "right"],
    child: wifiBoxConetents,
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(self.name || "")
    }),
})

const connWifiTooptip = Tooltips(
    {
        name: "wifiToopTip",
        class_name: "wifiToolTip",
        anchor: ["top", "right"],
    }, 
)

connWifiTooptip.child.child.hook(Network, () => {
    if (!Network.wifi.enabled)
        connWifiTooptip.child.child.label = "Enable internet"
    else
    {
        if (Network.wifi.internet === "disconnected")
            connWifiTooptip.child.child.label = "Connected but no internet :("
        else
            connWifiTooptip.child.child.label = Network.wifi.ssid?.toString() || ""

    }
})

export default () => {

    const WifiIndicator = Widget.Box({
        class_name: "WifiIconBar",
        children: [
            Widget.EventBox({
                class_name: "WifiButtonBar",
                onHover: () => { connWifiTooptip.visible = true },
                setup: self => self.on("leave-notify-event", () => { connWifiTooptip.visible = false }),
                child: Widget.Icon({
                    class_name: "WifiButtonIconBar",
                    icon: Network.wifi.bind("icon_name")
                }),
                on_primary_click: () => { 
                    closeWin(wifiWin)
                    App.toggleWindow(wifiWin)
                    Network.wifi.bind("enabled") && Network.wifi.scan()
                    if (connWifiTooptip.visible)
                        connWifiTooptip.visible = false
                }
            }),
        ]
    })

    return WifiIndicator
}
