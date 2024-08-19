import closeWin from "tsAgs/Functions/closeWin"

const date = Variable("", {
    poll: [1000, 'date "+%H:%M:%S "'],
})

const year = Variable("", {
    poll: [1000, 'date "+%a %e %b %Y"'],
})

export const clockWin = Widget.Window({
    visible: false,
    class_name: "clockCalendar",
    anchor: ["bottom", "right"],
    name: "clockWin",
    child: Widget.Calendar(),
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(self.name || "")
    }),
})

export const ClockWidget = () => Widget.EventBox({
    class_name: "ClockEventBox",
    child: Widget.Box({
        class_name: "ClockBox",
        spacing: 5,
        children: [
            Widget.Label({
                class_name: "DateLabel",
                label: date.bind(),
            }),
        ],
    }),
    tooltip_text: year.bind("value").as(y => `${y}`),
    on_primary_click: () => {
            closeWin("clockWin")
            App.toggleWindow(clockWin.name || "") 
    }
})
