const notifs = await Service.import("notifications")
import { Notification } from "types/service/notifications"
import GLib from "gi://GLib"

notifs.popupTimeout = 7000

function getATagContents(htmlString: string) {
    if (htmlString[0] === "<")
    {
        var regex = /<[^>]*>/g;
        var contents = htmlString.replace(regex, "");
        return contents.trim().split("\n")[2];
    }
    else
        return htmlString
}

export const notificationPopupBody = (n: Notification) => {

    const notifAppIcon = () => {

        if (n.app_icon.length > 0)
        {
            const img = Utils.lookUpIcon(n.app_icon)
            if (img === null)
            {
                return Widget.Box({
                    class_name: "notifPopupIcon",
                    vpack: "center",
                    hpack: "start",
                    hexpand: true,
                    vexpand: true,
                    css: `background-image: url("${n.app_icon}"); min-width: 15px; min-height: 15px; background-position: center; background-repeat: no-repeat; background-size: cover`,
                })
            }
            else
            {
                return Widget.Box([Widget.Icon({
                    class_name: "notifPopupIcon",
                    vpack: "center",
                    hpack: "start",
                    hexpand: true,
                    vexpand: true,
                    size: 15,
                    icon: n.app_icon,
                })])
            }
        }
        else
        {
            return Widget.Box([Widget.Icon({
                class_name: "notifPopupIcon",
                vpack: "center",
                hpack: "start",
                hexpand: true,
                vexpand: true,
                icon: "dialog-information",
            })])
        }
    }
 
    const notifSummary = Widget.Label({
        class_name: "notifSummary",
        vpack: "start",
        hpack: "center",
        hexpand: true,
        justification: "center",
        xalign: 1,
        max_width_chars: 25,
        useMarkup: true,
        label: n.summary
    })
    

    const notifBodyFull = Widget.Revealer({
        reveal_child: false,
        class_name: "notifBodyRevealerFull",
        child: Widget.Label({
            visible: false,
            class_name: "notifBodyLong",
            hpack: "center",
            vpack: "end",
            hexpand: true,
            vexpand: true,
            justification: "center",
            max_width_chars: 25,
            wrap: true,
            label: getATagContents(n.body) || "No Body Here"
        })
    })
    
    const notifBodyDisp = Widget.Box({
        class_name: "notifBodyBox",
        children: [
            notifBodyFull
        ],
        })
    
    const notifActions = Widget.Box({
        visible: (n.actions.length > 0),
        class_name: "notifActionBox",
        spacing: 7,
        vpack: "end",
        hpack: "center",
        children: n.actions.map(a => Widget.EventBox({
            class_name: "notifActions",
            child: Widget.Label(a.label),
            on_primary_click: () => n.invoke(a.id)
        }))
    })

    const closeButtonIcon = () => Widget.Box({
        class_name: "CloseNotif",
        child: Widget.EventBox({
            on_primary_click: () => {
                if (n.popup)
                    n.dismiss()
                else n.close()
            },
            child: Widget.Icon({icon: "window-close-symbolic"})
        })
    })


    const closeButton = () => {

        const t = Variable(notifs.popupTimeout)

        return Widget.EventBox({
        hpack: "end",
        vpack: "start",
        hexpand: true,
        vexpand: true,
        child: Widget.CircularProgress({
            start_at: 0.75,
            css: "font-size: 3px; min-height: 20px; min-width: 20px",
            child: Widget.Icon({icon: "window-close-symbolic", size: 15}),
            value: t.bind().as(v => v/notifs.popupTimeout),
            setup: self => self.poll(100, () => {
                if (t.value === 0)
                    n.dismiss()
                if (n.popup)
                {
                    t.setValue((t.value - 100))
                }
            })
        }),
        on_primary_click: () => n.dismiss()
    })
}
    
    const notifImageBig = (n.image) ? Widget.Box({
        css: `background-image: url("${n.image}"); min-width: 125px; min-height: 125px; background-position: center; background-repeat: no-repeat; background-size: cover`,
        class_name: "notifImageBigBottom",
        hpack: "center",
        vpack: "center",
        hexpand: true,
        vexpand: true
    })
    :
    Widget.Box()
    
    const bigRevealer = Widget.Revealer({
        class_name: "notifBottomImgActionReveal",
        reveal_child: false,
        child: Widget.Box({
            vertical: true,
            hexpand: true,
            vexpand: true,
            children: (n.actions.length > 0) ? [notifImageBig, notifActions] : [notifImageBig]
        })
    })

    const arrowRevealer = Widget.EventBox({
        class_name: "notifBodyActionRevealerButton",
        child: Widget.Icon({
            class_name: "notifBodyDispRevealerIcon",
            icon: "pan-down-symbolic"
        }),
        on_primary_click: (self) => {
            if (!notifBodyFull.reveal_child)
            {
                notifBodyFull.reveal_child = true;
                bigRevealer.reveal_child = true;
                self.child.icon = "pan-up-symbolic"
            }
            else
            {
                notifBodyFull.reveal_child = false
                bigRevealer.reveal_child = false
                self.child.icon = "pan-down-symbolic"
            }
        }
    })
    
    const getDate = () => {

        const current = new Date()

        const timeDisp = (time: number = n.time, format = "%H:%M - %e %m %Y") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

        const timeDispShort = (time: number = n.time, format = "%H:%M") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)
        
        const mins = (time: number = n.time, format = "%M") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

        const hours = (time: number = n.time, format = "%H") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

        const dateCheck = (time: number = n.time, format = "%e") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

        const monthCheck = (time: number = n.time, format = "%m") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)

        const yearCheck = (time: number = n.time, format = "%Y") => GLib.DateTime
        .new_from_unix_local(time)
        .format(format)
        
        if ((Number(monthCheck()) - 1 < current.getMonth()) || (Number(yearCheck()) < current.getFullYear()))
            return Widget.Label({
                class_name: "notifDate",
                hpack: "end",
                vpack: "start",
                hexpand: true,
                vexpand: false,
                justification: "right",
                label: timeDisp()
            })
        else
        {
            if (Number(dateCheck()) < current.getDate() - 1)
                return Widget.Label({
                    class_name: "notifDate",
                    hpack: "end",
                    vpack: "start",
                    hexpand: true,
                    vexpand: false,
                    justification: "right",
                    label: `${timeDispShort} ${current.getDate() - Number(dateCheck())} day(s) ago`
                })
                
                else
                {
                    let time
                    if ((Number(hours()) === current.getHours()) && (Number(mins()) === current.getMinutes()))
                        time = `Now`
                    else if ((Number(hours()) === current.getHours()) && !(Number(mins()) === current.getMinutes()))
                        time = `${current.getMinutes() - Number(mins())}mins ago`
                    else
                        time = `${current.getHours() - Number(hours())}Hrs and ${current.getMinutes() - Number(mins())}Mins ago`

                    return Widget.Label({
                        class_name: "notifDate",
                        hpack: "end",
                        vpack: "start",
                        hexpand: true,
                        vexpand: false,
                        justification: "right",
                        label: time
                    })
                }
        }
    }
    
    return Widget.EventBox({
        class_name: "notifPopup",
        hexpand: true,
        vexpand: true,
        setup: self => self.hook(n, () => {
            self.toggleClassName("notifCritical", n.urgency === "critical")
            if (n.urgency === "critical")
            {
                notifs.forceTimeout = true
                notifs.popupTimeout = 7000
            }
        }),
        child: Widget.CenterBox({
            class_name: "notifPopupCenterBox",
            spacing: 10,
            start_widget: Widget.Box({
                class_name: "notif11",
                hexpand: true,
                vexpand: false,
                spacing: 10,
                children: [
                    Widget.Box({
                        hexpand: true,
                        vexpand: true,
                        hpack: "start",
                        vpack: "start",
                        children: [notifAppIcon()]
                    }),
                    Widget.Box({
                        hexpand: true,
                        vpack: "start",
                        hpack: "end",
                        child: getDate()
                    }),
                    Widget.Box({
                        hexpand: true,
                        vpack: "start",
                        hpack: "center",
                        child: arrowRevealer
                    }),
                ]
            }),
            center_widget: Widget.Box({
                vertical: true,
                hexpand: true,
                vexpand: true,
                spacing: 5,
                children: [
                    Widget.Box({
                        hpack: "center",
                        vpack: "start",    
                        child: notifSummary,
                    }),
                    Widget.Box({
                        hpack: "center",
                        vpack: "center",
                        vertical: true,
                        spacing: 10,
                        children: [
                            notifBodyDisp,
                        ]
                    }),
                    Widget.Box({
                        hpack: "center",
                        vpack: "end",
                        hexpand: true,
                        vexpand: true,
                        child: bigRevealer
                    })
                ]
            }),
            end_widget: Widget.Box({
                hexpand: true,
                vexpand: true,
                vertical: true,
                hpack: 'end',
                children: [
                    Widget.Box({
                        spacing: 3,
                        children: [Widget.EventBox({
                            class_name: "notifSettings",
                            child: Widget.Icon("emblem-system-symbolic"),
                            on_primary_click: () => Utils.execAsync("kitty -e nvim /home/rudy/.config/ags/tsAgs/Functions/Notifications.ts")
                        }),
                        n.popup ? closeButton() : closeButtonIcon(),
                    ]
                    }),
                ]
            })
        })
    })
}

export const NotificationPopups = (monitor = 0) => {
    const poppy = notifs.bind("popups");
    const notifWind =  Widget.Window({
        class_name: "NotifWindow",
        visible: poppy.as(p => p.length > 0),
        name: "RNotif",
        monitor,
        anchor: ["top"],
        child: Widget.Box({
            class_name: "NotifPopups",
            child: Widget.Box({
                spacing: 5,
                vertical: true,
                css: "padding: 5px",
                children: notifs.bind('popups').as(popups => popups.map(notificationPopupBody)),
            }),
        }),
    })
    .hook(notifs, () => {
        Utils.execAsync(['mpv', '/home/rudy/.local/share/sounds/burnComplete.aif'])
        .catch((e) => console.log(e))
    }, "notified")

    .hook(notifs, () => {
        console.log("Notified, killing mpv")
        Utils.timeout(3000, () => {
            Utils.exec('killall mpv')
        })
    }, "dismissed")

    return notifWind   
}
