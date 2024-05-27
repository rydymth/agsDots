import closeWin from "tsAgs/Functions/closeWin";
import { notificationPopupBody } from "tsAgs/Functions/Notifications";
const notifs = await Service.import("notifications")

const notifGroup = () => {
    return Widget.Box({
        class_name: "NotifCenter",
        spacing: 7,
        vertical: true,
        hexpand: true,
        vexpand: true,
        hpack: "center",
        vpack: "start",
        setup: self => self.hook(notifs, () => {
            //self.children = notifs.notifications.map(notificationPopupBody),
            self.visible = notifs.notifications.length > 0
            const groupedNotifications = Object.entries(notifs.notifications.reduce((acc, notification) => {
                const appName = notification['app-name'];
                if (!acc[appName]) {
                    acc[appName] = [];
                }
                acc[appName].push(notification);
                return acc;
            }, {}));

            const groups = groupedNotifications.map(n => {
                
                const appNotifs = Widget.Box({
                    class_name: "notifGrpNotifs",
                    spacing: 10,
                    vertical: true,
                    //@ts-ignore
                    children: n[1].map(notificationPopupBody)
                })

                const appNotifRevealer = Widget.Revealer({
                    class_name: "notifGrpNotifsRevealer",
                    reveal_child: false,
                    child: appNotifs
                })

                return Widget.Box({
                    class_name: "notifGrpName",
                    vertical: true,
                    spacing: 15,
                    children: [
                        Widget.Box({
                            hexpand: true,
                            vexpand: true,
                            children: [
                                Widget.Label({
                                    hpack: "start",
                                    hexpand: true,
                                    label: n[0]
                                }),
                                Widget.EventBox({
                                    hexpand: true,
                                    hpack: "end",
                                    child: Widget.Icon("pan-down-symbolic"),
                                    on_primary_click: (self) => {
                                        appNotifRevealer.reveal_child = !appNotifRevealer.reveal_child
                                        if (appNotifRevealer.reveal_child)
                                            self.child.icon = "pan-up-symbolic"
                                        else
                                            self.child.icon = "pan-down-symbolic"
                                    }
                                })
                            ]
                        }),
                        Widget.Box([appNotifRevealer])
                    ]
                })
            })
            self.children = groups
        })
    })
}

const scrollable = Widget.Scrollable({
    class_name: "notifScrollable",
    hscroll: "never",
    vscroll: "always",
    hexpand: true,
    child: notifGroup(),
    setup: self => self.hook(notifs, () => {
        const vScrollbar = self.get_vscrollbar();
        vScrollbar.get_style_context().add_class('sidebar-scrollbar');
    })
})

const clear = Widget.Box({
    class_name: "Clear",
    hpack:"start",
    vpack: "start",
    child: Widget.Button({
        child: Widget.Label("󰎟"),
        onClicked: () => notifs.clear()
    })
})

const dnd = Widget.Box({
    hpack:"end",
    vpack: "start",
    child: Widget.Button({
        child: Widget.Label(""),
        onClicked: () => {
            notifs.dnd = !notifs.dnd;
        },
        setup: self => self.hook(notifs, () => {
            self.toggleClassName("DNDOn", notifs.dnd)
            self.toggleClassName("DNDOff", !notifs.dnd)
        })
    })
})

export const NCWindow = Widget.Window({
    name: "agsNC",
    class_name: "notifCenterWindow",
    anchor: ["top", "right"],
    visible: false,
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(self.name || "")
    }),
    child: Widget.Box({
        class_name: "notifCenterBox",
        child: Widget.Box({
            class_name: "NotifCenterContainer",
            vertical: true,
            hexpand: true,
            vexpand: true,
            hpack: "center",
            vpack: "center",
            children: [
                Widget.Box({
                    class_name: "notifDNDandClear",
                    hexpand: true,
                    spacing: 20,
                    children: [
                        Widget.Box({
                            hpack: "start",
                            vpack: "center",
                            hexpand: true,
                            child: clear
                        }),
                        Widget.Box({
                            hpack: "end",
                            vpack: "center",
                            hexpand: true,
                            child: dnd
                        })
                    ]
                 }),
                Widget.Label({
                    class_name: "NotifsPresentOrNotLabel",
                    justification: "center",
                    hpack: "center",
                    vpack: "start",
                    setup: self => self.hook(notifs, () => {
                        self.visible = notifs.notifications.length === 0,
                        self.label = "No Notifications"
                    })
                }),
                scrollable
            ]
        })
    })
})

export const noitfCenter = () => Widget.EventBox({
    class_name: "notifBarEventBox",
    child: Widget.Icon("org.gnome.Settings-notifications-symbolic"),
    on_primary_click: () => {
        closeWin("agsNC")
        App.toggleWindow("agsNC")
    }
})
