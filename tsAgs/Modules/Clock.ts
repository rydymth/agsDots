import Tooltips from "tsAgs/Functions/Tooltips"
import closeWin from "tsAgs/Functions/closeWin"

const date = Variable("", {
    poll: [1000, 'date "+%H:%M:%S "'],
})

const year = Variable("", {
    poll: [1000, 'date "+%a %e %b %Y"'],
})

const clockToolTip = Tooltips(
    {
        name: "clockWin",
        class_name: "clockWin",
        anchor: ["top", "right"],
    },
   undefined,
   undefined,
   //@ts-ignore
   year.bind("value").as(y => `${y}`)
)

export const clockWin = Widget.Window({
    visible: false,
    class_name: "clockCalendar",
    anchor: ["top", "right"],
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
    on_hover: () => clockToolTip.visible = true,
    setup: self => self.on("leave-notify-event", () => clockToolTip.visible = false),
    on_primary_click: () => {
            closeWin("clockWin")
            App.toggleWindow(clockWin.name || "") 
    }
})
