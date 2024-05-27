const hyprland = await Service.import("hyprland");
const app = await Service.import("applications")
import { Workspace } from "types/service/hyprland";

const wsDisptach = (ws: Workspace) => hyprland.messageAsync(`dispatch workspace ${ws.id}`)

export const barBox = () =>{

    const barBoxContents = (w: Workspace) => {
        const wsNum = Widget.Label({
            class_name: `wspLabel`,
            label: `${w.id}: `
        })
    
        const wsAppMap = hyprland.clients.filter((c) => c.workspace.id === w.id).map(c => {
                let appClass = app.query(c.initialClass)
                let iconName = "application-x-executable"
                if (appClass.length > 0)
                    iconName = appClass[0].icon_name || ""
                if (c.initialClass === "code-url-handler")
                    iconName = "code"
                return Widget.EventBox({
                    class_name: `ClientEventBox`,
                    child: Widget.Icon({
                        size: 16,
                        class_name: "clientIcon",
                        icon: iconName
                    }),
                    on_primary_click: () => {
                        // hyprland.messageAsync(`dispatch workspace ${c.workspace.id}`)
                        hyprland.messageAsync(`dispatch focuswindow ${c}`)
                    }
            })
        }
    )
    

        const wsReveal = Widget.Revealer({
            class_name: `wspRevealBox`,
            reveal_child: false,
            transition: "slide_left",
            transition_duration: 2,
            child: Widget.Box({
                spacing: 10,
                class_name: `wspRevealerBox`,
                children: wsAppMap
            })
        })
    
        return Widget.EventBox({
            class_name: `${w.id}EventBox`,
            child: Widget.Box({
                class_name: `${w.id}MainBox`,
                spacing: 5,
                children: [
                    wsNum,
                    Widget.EventBox({
                        class_name: `RevealerContainer`,
                        child: wsReveal,
                        on_hover: () => wsReveal.reveal_child = true
                    })
                ]
            }),
            on_hover: () => wsReveal.reveal_child = true,
            setup: self => self.on("leave-notify-event", () => wsReveal.reveal_child = false)
                                        .hook(hyprland, () => {
                                            self.toggleClassName("Active", hyprland.active.workspace.id === w.id)
                                            self.toggleClassName("NotActive", hyprland.active.workspace.id === w.id)
                                        }),
            on_primary_click: () => {
                wsDisptach(w)
            }
        })
    }

    return Widget.Box({
        class_name: "workspacesBox",
        spacing: 10,
        setup: self => self.hook(hyprland, () => self.children = hyprland.monitors.sort((a, b) => a.id - b.id).map(m => Widget.Box({
            className: "wspSUper",
            children: [
                Widget.Label({
                    class_name: "monName",
                    label: `${m.name}>>`
                }),
                Widget.Box({
                    children: hyprland.workspaces.filter(w => w.monitorID === m.id).sort((a, b) => a.id - b.id).map(barBoxContents)
                })
            ]
        })))
    })    
}
