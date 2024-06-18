import { Batt, powerProfile } from "./Modules/Battery.ts"
import { ClockWidget, clockWin } from "./Modules/Clock.ts"
import Spotlight from "./Modules/Spotlight.ts"
import Wifi, { wifiWindow } from "./Modules/Wifi.ts"
import { btBarButton, btWindow } from "./Modules/Bluetooth"
import { indFn, audioWin } from "./Modules/Audio"
import { volOSD } from "./Functions/OSD"
import { NotificationPopups } from "./Functions/Notifications"
import { NCWindow, noitfCenter } from "./Modules/NotificationCenter"
import SysTray from "./Modules/Systray"
import { Media } from "./Modules/Media"
import closeWin from "./Functions/closeWin"
const hypr = await Service.import("hyprland");
import Monitor, { backAll, dockAll } from "./Functions/Monitor"
import { wsps, runAppWin }  from "./Modules/Docs" 
import { mainMenu, mainMenuWindow } from "./Modules/mainMenu" 
import workspaces from "./Modules/workspaces"
export const size = 11;

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
                child: mainMenu()
            }),
        ]
    })

    const RightBarReveal = Widget.Revealer({
        class_name: "rightBarReveal",
        reveal_child: false,
        transition: "slide_left",
        child: Widget.Box({
            class_name: "rightBarRevealBox",
            spacing: 10,
            hexpand: true,
            vpack: "fill",
            children: [
                SysTray(),
                MediaGet(),
                noitfCenter(),
                indFn("speaker"),
                indFn("microphone"),
                btBarButton(),
                Wifi(),
             ]            
        })
    })

    const revealerContainerIcon = Widget.EventBox({
        class_name: "RevealerContainer",
        child: Widget.Box({
            spacing: 10,
            class_name: "rightBarBoxIcon",
            children: [
                Widget.Icon({ icon: "pan-start-symbolic"}),
            ]
        }),
        on_primary_click: () => { RightBarReveal.reveal_child = !RightBarReveal.reveal_child }, 
    })

    const together = Widget.Box({
        class_name: "RightbarAllContainer",
        spacing: 10,
        children: [
            Widget.EventBox({
                child: RightBarReveal,
            }),
            revealerContainerIcon,
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
                child: together
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
            class_name: "CenterBar",
            hpack: "center",
            spacing: 10,
            children: [
                workspaces(mon)
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
        anchor: ["left", "top", "right"],
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

export const Dock = (mon: number) => Widget.Window({
    visible: true,
    monitor: mon,
    name: `Dock-${mon}`,
    class_name: `Dock-${mon}`,
    exclusivity: "exclusive",
    anchor: ["bottom"],
    layer: "top",
    child: wsps(mon),
    setup: self => self
    // .hook(hypr, () => {
    //     let ws = hypr.getWorkspace(hypr.active.workspace.id)
    //     if (ws && !globalThis.changed)
    //     {                
    //         if (ws.windows === 0)
    //             self.visible = true
    //         else
    //             self.visible = false
    //     }
    // })
    // .hook(hypr, (_, name: string, data: string) => {
    //     if (name === "movewindowv2" || "openwindow" || "closewindow")
    //     {
    //         Utils.timeout(100, () => self.visible = true)
    //         Utils.timeout(2000, () => self.visible = false)
            
    //     }
    // }, "event")
})

try {

    App.config({
        windows: [
            ...Monitor(),
            ...backAll(),
            ...dockAll(),
            mainMenuWindow,
            runAppWin,
            Spotlight(),
            wifiWindow(),
            btWindow(),
            audioWin("speaker"),
            audioWin("microphone"),
            volOSD,
            NotificationPopups(),
            NCWindow,
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
