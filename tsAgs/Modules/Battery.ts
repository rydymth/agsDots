const battery = await Service.import('battery')
import Tooltips from "tsAgs/Functions/Tooltips"
const pp = await Service.import("powerprofiles")

globalThis.notifies = false

const batteryTooltip = Tooltips(
    {
        name: "batteryTooltip",
        class_name: "batteryTooltip",
        anchor: ["top", "right"],
    },
)

batteryTooltip.child.child.hook(battery, () => {
    if (battery.time_remaining/3600 > 1)
        batteryTooltip.child.child.label = `${battery.percent}%\n${Math.ceil(battery.time_remaining/3600)}hrs left`
    else
    {
        batteryTooltip.child.child.label = `${battery.percent}%\n${Math.ceil(battery.time_remaining/60)}mins left`
    }
    if (!globalThis.notifies && battery.percent <= 30 && !battery.charging)
    {
        Utils.notify({
            summary: "LOW BATTERY",
            body: "Connect to the charger NOW",
            iconName: "dialog-warning-symbolic"
        })
        globalThis.notifies = true            
    }
    if (globalThis.notifies && battery.charging)
        globalThis.notifies = false
})

batteryTooltip.margins = [10, 60]

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
        on_hover: () => batteryTooltip.visible = true,
        setup: self => self.on("leave-notify-event", () => batteryTooltip.visible = false)
    })
}

export const powerProfile = {
    
}
