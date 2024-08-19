import { Batt, powerProfile } from "./Modules/Battery.ts"
import { ClockWidget, clockWin } from "./Modules/Clock.ts"
import Spotlight from "./Modules/Spotlight.ts"
import { volOSD } from "./Functions/OSD"
import { NotificationPopups } from "./Functions/Notifications"
import SysTray from "./Modules/Systray"
import { Media } from "./Modules/Media"
import closeWin from "./Functions/closeWin"
const hypr = await Service.import("hyprland");
import Monitor, { backAll } from "./Functions/Monitor"
import { wsps, runAppWin }  from "./Modules/Docs" 
import workspaces from "./Modules/workspaces"
import { commonWindow, controlWindow, indIcons } from "./Modules/oneControl"
export const size = 14;

App.addIcons(`/home/rudy/.config/ags/assets`)

const mediaWin = Widget.Window({
    class_name: "MediaPlay",
    visible: false,
    name: "mpris",
    anchor: ["top", "right"],
    margins: [10, 170],
    child: Media(),
    keymode: "on-demand",
    setup: self => self
        .keybind("Escape", () => {
            App.closeWindow(self.name || "")
        })
})

function MediaGet() {
    return Widget.Box({
        child: Widget.EventBox({
            child: Widget.Label(" "),
            on_primary_click: () => { 
                closeWin("mpris")
                App.toggleWindow(mediaWin.name || "") 
            }
        })
})
}

globalThis.changed = false

export const Bar = (mon: number) => {

    const Left = Widget.Box({
        class_name: "LeftBar",
        spacing: 3,
        vpack: "center",
        hpack: "start",
        children: [
            Widget.Box({
                class_name: "leftStartBar",
                hpack: "start",
                child: workspaces(mon),
            }),
        ]
    })

    const right =   Widget.Box({
        class_name: "rightBarRevealBox",
        spacing: 10,
        hexpand: true,
        vpack: "fill",
        children: [
            SysTray(),
            // MediaGet(),
            indIcons(),
         ]            
    })

    const Right = Widget.Box({
        class_name: "RightBar",
        spacing: 3,
        vpack: "center",
        hpack: "end",
        children: [
            Widget.Box({
                className: "RightStartBar",
                hpack: "end",
                spacing: 7,
                child: right
            }),

            Widget.Box({
                className: "RightStartBar",
                hpack: "start",
                children: [ Batt(),
                    ClockWidget()
                ]
            }),
        ]
    })


    const BarContents = Widget.CenterBox({
        class_name: "BarCenterBox",
        start_widget: Left,
        center_widget: Widget.Box({
            hexpand: true,
            class_name: "CenterBar",
            hpack: "center",
            spacing: 10,
            children: [ 
                wsps(mon)
            ]
        }),
        end_widget: Right
    })

    return Widget.Window({
        visible: true,
        monitor: mon,
        class_name: `bar-${mon}`,
        name: `bar-${mon}`,
        margins: [0, 0],
        exclusivity: "exclusive",
        anchor: ["left", "bottom", "right"],
        layer: "top",
        child: BarContents,
//        setup: self => self.hook(hypr, () => {
//            let ws = hypr.getWorkspace(hypr.active.workspace.id)
//            if (ws && !globalThis.changed)
//            {                
//                if (ws.windows === 0)
//                    self.visible = true
//                else
//                    self.visible = false
//            }
//        })
        })
}

export const back = (mon: number) => Widget.Window({
    visible: true,
    monitor: mon,
    name: `back-${mon}`,
    class_name: `back-${mon}`,
    exclusivity: "ignore",
    anchor: ["top", "left", "right", "bottom"],
    layer: "bottom",
    child: Widget.EventBox({
        hexpand: true,
        vexpand: true,
        on_primary_click: () => closeWin()
    })
})    

try {

    App.config({
        windows: [
            ...Monitor(),
            ...backAll(),
            runAppWin,
            commonWindow,
            controlWindow,
            Spotlight(),
            volOSD,
            NotificationPopups(),
            mediaWin,
            clockWin,
            powerProfile(),
        ],
        style: "/home/rudy/.cache/agsStyle.css"
    })
}
catch (c: any|unknown) {
    console.log("Its fine")
    console.log(c)
}

Utils.monitorFile(
    `${App.configDir}/style/`,

    function() {
        const scss = `${App.configDir}/style/style.scss`
        
        console.log("changes noted")

        const css = `/home/rudy/.cache/agsStyle.css`

        Utils.exec(`sassc ${scss} ${css}`)
        App.resetCss()
        App.applyCss(css)
    },
)
