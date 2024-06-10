import { Application } from "types/service/applications"

const apps = await Service.import("applications")
const { query } = apps

const WIN_NAME = "spotlight"


const appItem = (app: Application) => Widget.EventBox({
    attribute: { app },
    class_name: "AppItemEventBox",
    child: Widget.Box({
        class_name: "AppItemContainer",
        children: [
            Widget.Button({
                class_name: "AppButton",
                child: 
                    Widget.Box({
                        class_name: "AppItemLabelAndIcon",
                        spacing: 5,
                        vertical: true,
                        children: [
                            Widget.Icon({
                                class_name: "AppIcon",
                                icon: app.icon_name || "application-x-executable",
                            }),
                            Widget.Label({
                                class_name: "AppName",
                                label: app.name || "Some Unknown app"
                            }),
                        ]
                    }),
                onClicked: () => {
                    App.closeWindow(WIN_NAME)
                    app.launch()
                }
            }),
        ]
    }),
})

let applications = query("").slice(0,7).map(appItem)

const appBox = Widget.Box({
    visible: false,
    class_name: "ApplicationDisplayBox",
    children: applications,
    spacing: 10
})

const calcLabelHelp = Widget.Label({
    class_name: "SpotSolverHelp",
    visible: true,
    hexpand: true,
    hpack: "center",
    vpack: "center",
    vexpand: true,
    max_width_chars: 50,
    wrap: true,
    justification: "center",
})

const calcSol = Widget.Label({
    class_name: "SpotSolver",
    visible: true,
    hexpand: true,
    hpack: "center",
    vpack: "center",
    vexpand: true,
    max_width_chars: 50,
    wrap: true,
    justification: "center",
})

function calculator (n: string | null) {
    if (n)
    {
        try{
            return eval(n.split(/\= |\=/)[1])
        }
        catch {
            return n
        }
    }
    else return 0
}

const calcBox = Widget.Box({
    visible: false,
    hexpand: true,
    vexpand: true,
    vertical: true,
    spacing: 10,
    children: [
         calcLabelHelp,
         calcSol 
    ]
})

const textBox = Widget.Entry({
        placeholder_text: "All u need is a terminal",
        vexpand: true,
        hexpand: true,
        class_name: "AppEntryWidget",
        on_accept: () => {
            const result = applications.filter((item) => item.visible);
            if (result[0])
                {
                    App.toggleWindow(WIN_NAME);
                    result[0].attribute.app.launch()
                }
        },
        on_change: ({ text }) => {
            if(text?.charAt(0) === "=")
            {
                calcLabelHelp.label = "Use Math to use all the sin, cos, exp, log, sqrt, random, etc..."
                calcSol.label = `${calculator(text)}`
                calcBox.visible = true
                appBox.visible = false
            }
            else{
                apps.reload();
                applications = query(text || "").slice(0, 7).map(appItem);
                appBox.children = applications;
                applications.forEach(item => {
                    item.visible = item.attribute.app.match(text ?? "")
                })
                calcBox.visible = false
                appBox.visible = true
            }
        }
    })

function repopulate () {
    applications = query("").slice(0,7).map(appItem)
    appBox.children = applications
}

function getLastWord(sentence: string | null) {
    if (sentence)
    {
        const regex = /(\w+\.\w+)$/;;
        const match = sentence.match(regex);
        return match ? match[1] : null;
    }
    else
        return ""
}

const AppLauncher = Widget.Box({
    class_name: "AppLauncherPart",
    vertical: true,
    spacing: 10,
    hexpand: true,
    vexpand: true,
    children: [
        Widget.Box({
            hexpand: true,
            vexpand: true,
            vertical: true,
            spacing: 10,
            children:[ 
                Widget.Label({
                    hpack: "center",
                    vpack: "center",
                    hexpand: true,
                    class_name: "SpotlightStartup",
                    label: "Focus Entry to type and search"
                }),
                textBox,
                Widget.FileChooserButton({
                    child: Widget.Label("󰸉"),
                    hexpand: true,
                    on_file_set: ({ uri }) => {
                        let Last = getLastWord(uri)
                        Utils.execAsync(["killall", "hyprpaper"]).catch((c) => console.log(c))
                        Utils.notify({
                            summary: "Changing Wallpaper", 
                            body: `To ${uri}`, 
                            iconName: `${uri}`})
                        Utils.execAsync(["bash", "/home/rudy/.config/script/wllppr.sh", `${Last}`]).catch((c) => console.log(c))
                        Utils.execAsync(["hyprpaper", "-n"]).catch((c) => console.log(c))
                        }
                })
            ]
        }),
        appBox,
        calcBox
    ],
    setup: self => self.hook(App, (_, windowName, visible) => {
        
        if (windowName != WIN_NAME)
            return

        if (visible)
            {
                repopulate()
                textBox.text = ""
                textBox.grab_focus()
            }
    })
})

export default () => Widget.Window({
    name: WIN_NAME,
    class_name: WIN_NAME,
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(WIN_NAME)
    }),
    visible: false,
    child: AppLauncher,
    keymode: "on-demand"
})
