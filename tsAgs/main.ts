import { Batt } from "./Modules/Battery.ts"
import { ClockWidget, clockWin } from "./Modules/Clock.ts"
import Spotlight from "./Modules/Spotlight.ts"
import Wifi, { wifiWindow } from "./Modules/Wifi.ts"
import { btBarButton, btWindow } from "./Modules/Bluetooth"
import { barBox } from "./Modules/hyprland"
import { indFn, audioWin } from "./Modules/Audio"
import { volOSD } from "./Functions/OSD"
import { NotificationPopups } from "./Functions/Notifications"
import { NCWindow, noitfCenter } from "./Modules/NotificationCenter"
import SysTray from "./Modules/Systray"
import { Media } from "./Modules/Media"
import closeWin from "./Functions/closeWin"
const hyprland = await Service.import("hyprland");
import { Workspace } from "types/service/hyprland";
import Monitor from "./Functions/Monitor"

const mediaWin = Widget.Window({
    class_name: "MediaPlay",
    visible: false,
    name: "mpris",
    anchor: ["top", "right"],
    margins: [10, 170],
    child: Media(),
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(self.name || "")
    }),
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
                child: barBox()
            })
        ]
    })

    const Right = Widget.Box({
        class_name: "RightBar",
        spacing: 10,
        vpack: "center",
        hpack: "end",
        children: [
            Widget.Box({
                className: "RightStartBar",
                hpack: "end",
                spacing: 7,
                children: [
                    SysTray(),
                    MediaGet(),
                    noitfCenter(),
                    indFn("speaker"),
                    indFn("microphone"),
                    btBarButton(),
                 ]
            }),

            Widget.Box({
                className: "RightStartBar",
                hpack: "start",
                children: [ Batt() ]
            }),

            Widget.Box({
                className: "RightEndBar",
                hpack: "end",
                spacing: 7,
                children: [ 
                    Wifi(),
                    ClockWidget()
                 ]
            })
        ]
    })


    const BarContents = Widget.CenterBox({
        class_name: "BarCenterBox",
        start_widget: Left,
        center_widget: Widget.Box({
            hexpand: true,
            hpack: "center",
            children: []
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
        anchor: ["left", "top", "right"],
        child: BarContents,
        // setup: self => self
        //             .hook(hyprland, () => {
        //                 try
        //                 {
        //                     //@ts-ignore
        //                     // const wsp: Workspace = hyprland.getWorkspace(hyprland.active.workspace.id)
        //                     // if (!globalThis.changed)
        //                     //     if (wsp.windows > 0)
        //                     //         self.visible = false
        //                     //     else
        //                     //         self.visible = true
        //                 }
        //                 catch(error)
        //                 {
        //                     console.log("The Workspace prolly aint defined or aint persistent")
        //                 }
        //             })
        })
}

globalThis.BARR = Bar    

try {

    App.config({
        windows: [
            ...Monitor(),
            Spotlight(),
            wifiWindow(),
            btWindow(),
            audioWin("speaker"),
            audioWin("microphone"),
            volOSD,
            NotificationPopups(0),
            NCWindow,
            mediaWin,
            clockWin
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
