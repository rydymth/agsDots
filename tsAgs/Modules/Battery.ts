const battery = await Service.import('battery')
import Tooltips from "tsAgs/Functions/Tooltips"
import closeWin from "tsAgs/Functions/closeWin"
const pp = await Service.import("powerprofiles")
const hypr = await Service.import("hyprland")

globalThis.notifies = false

const batteryTooltip = Tooltips(
    {
        name: "batteryTooltip",
        class_name: "batteryTooltip",
        anchor: ["top", "right"],
    },
)

function batt() {
    let ret: string
    if (battery.time_remaining/3600 > 1)
        ret = `${battery.percent}%\n${Math.ceil(battery.time_remaining/3600)}hrs left`
    else
    {
        ret = `${battery.percent}%\n${Math.ceil(battery.time_remaining/60)}mins left`
    }
    if (!globalThis.notifies && battery.percent <= 30 && !battery.charging)
    {
        try{
            Utils.notify({
                summary: "LOW BATTERY",
                body: "Connect to the charger NOW",
                iconName: "dialog-warning-symbolic"
            })
            hypr.messageAsync("keyword animations:enabled false")
            hypr.messageAsync("keyword decoration:blur false")
        }
        catch(e) { console.log(e)}
        globalThis.notifies = true            
    }
    if (globalThis.notifies && battery.charging)
    {
        globalThis.notifies = false
        hypr.messageAsync("reload")
    }

    return ret
}

export const powerProfile = () => {

    const current = Widget.Label({
        class_name: "CurrentPP",
        setup: self => self.hook(pp, () => {
            self.label = pp.active_profile
        })
    })    

    const profileInfoDegraded = Widget.Label({
        class_name: "CurrentProfileInfo",
        css: 'color: gray',
        hexpand: true,
        justification: "left",
        label: pp.performance_degraded || "No Degrading info Available"
    })

    const profileInfoInhibited = Widget.Label({
        class_name: "CurrentProfileInfo",
        css: 'color: gray',
        hexpand: true,
        justification: "left",
        label: pp.performance_inhibited || "No Inhibition info Available"
    })

    const profileContainers = Widget.Box({
        class_name: "ppEachContainer",
        vertical: true,
        spacing: 5,
        setup: self => self.hook(pp, () => {
            self.children = pp.profiles.map(p => Widget.EventBox({
                class_name: "IndivisualProfileBox",
                child: Widget.Box({
                    hexpand: true,
                    children: [
                        Widget.Label({
                            hexpand: true,
                            hpack: "center",
                            label: Object.values(p)[0]
                        })
                    ]
                }),
                on_primary_click: () => pp.active_profile = Object.values(p)[0]
            }))
        })
    })

    const AllTogether = Widget.Box({
        class_name: "powerProfileBox",
        spacing: 5,
        vertical: true,
        children: [
            current,
            profileInfoDegraded,
            profileInfoInhibited,
            Widget.Separator(),
            profileContainers
        ]
    })

    return Widget.Window({
        visible: false,
        class_name: "PPWindow",
        name: "PP",
        anchor: ["top", "right"],
        margins: [10, 10],
        child:AllTogether,
        keymode: "exclusive",
        setup: self => self.keybind("Escape", () => {
            App.closeWindow(self.name || "")
        }) 
    })
}

export const Batt = () => {

    const battContents = Widget.Box({
        className: "BatteryMainContents",
        spacing: 3,
        children: [
            Widget.Label({
                class_name: "BatteryPercent",
                label: battery.bind('percent').as(p => `${Math.ceil(p)}%`)
            }),
            Widget.Icon({
                class_name: "BatteryIcon",
                icon: battery.bind("icon_name")
            })
        ]
    })

    return Widget.EventBox({
        class_name: "BatteryMainEventBox",
        child: battContents,
        setup: self => self.hook(battery, () => self.tooltip_text = batt()),
        on_primary_click: () => {
            closeWin("PP")
            App.toggleWindow("PP")
        }
    })
}
