const systemtray = await Service.import("systemtray")
import { size } from "tsAgs/main"

export default function SysTray() {
    const items = systemtray.bind("items")
        .as(items => items.map(item => Widget.EventBox({
            child: Widget.Icon({ icon: item.bind("icon"), size: size + 2 }),
            on_secondary_click: (_, event) => item.activate(event),
            on_primary_click: (_, event) => item.openMenu(event),
            tooltip_markup: item.bind("tooltip_markup"),
        })))

    return Widget.Box({
        className: "SysTray",
        spacing: 10,
        children: items,
    })
}
