import { type Application } from "types/service/applications"

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

const textBox = Widget.Box({
    class_name: "SpotlightEntryBox",
    hpack: "start",
    hexpand: true,
    child: Widget.Entry({
        placeholder_text: "All u need is a terminal",
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
            apps.reload();
            applications = query(text || "").slice(0, 7).map(appItem);
            appBox.children = applications;
            applications.forEach(item => {
                item.visible = item.attribute.app.match(text ?? "")
            })
        }
    })
})

const appBox = Widget.Box({
    class_name: "ApplicationDisplayBox",
    children: applications,
    spacing: 10
})

function repopulate () {
    applications = query("").slice(0,7).map(appItem)
    appBox.children = applications
}

function getLastWord(sentence) {
    const regex = /(\w+\.\w+)$/;;
    const match = sentence.match(regex);
    return match ? match[1] : null;
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
            children:[ 
                Widget.Label({
                    hpack: "start",
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
                        Utils.execAsync(["hyprpaper"]).catch((c) => console.log(c))
                        }
                })
            ]
        }),
        appBox,
    ],
    setup: self => self.hook(App, (_, windowName, visible) => {
        if (windowName != WIN_NAME)
            return

        if (visible)
            {
                repopulate()
                textBox.child.text = ""
                textBox.child.grab_focus()
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
    keymode: "exclusive",
    child: AppLauncher
})