const notifs = await Service.import("notifications");
import { Notification } from "types/service/notifications";
import GLib from "gi://GLib";

notifs.popupTimeout = 7000;

function getATagContents(htmlString: string) {
  if (htmlString[0] === "<") {
    var regex = /<[^>]*>/g;
    var contents = htmlString.replace(regex, "");
    return contents.trim().split("\n")[2];
  } else return htmlString;
}

export const notificationPopupBody = (n: Notification) => {
  const notifAppNameIcon = () => {
    const notifAppIcon = () => {
      if (n.app_icon.length > 0) {
        const img = Utils.lookUpIcon(n.app_icon);
        if (img === null) {
          return Widget.Box({
            class_name: "notifPopupIcon",
            vpack: "start",
            hpack: "start",
            hexpand: true,
            vexpand: true,
            css: `background-image: url("${n.app_icon}"); min-width: 15px; min-height: 15px; background-position: center; background-repeat: no-repeat; background-size: cover`,
          });
        } else {
          return Widget.Box([
            Widget.Icon({
              class_name: "notifPopupIcon",
              vpack: "start",
              hpack: "start",
              hexpand: true,
              vexpand: true,
              size: 15,
              icon: n.app_icon,
            }),
          ]);
        }
      } else {
        return Widget.Box([
          Widget.Icon({
            class_name: "notifPopupIcon",
            vpack: "start",
            hpack: "start",
            hexpand: true,
            vexpand: true,
            icon: "dialog-information",
          }),
        ]);
      }
    };

    const names = {
      "com.github.Aylur.ags.rudy": "System",
      "notify-send": "System",
    };

    function getName(app: string) {
      return names.hasOwnProperty(app) ? names[app] : app;
    }

    const notifAppName = Widget.Label({
      class_name: "notifAppName",
      hexpand: true,
      vpack: "start",
      hpack: "end",
      label: `${getName(n.app_name)}`,
    });

    return Widget.Box({
      class_name: "notifAppNameIcon",
      spacing: 7,
      children: [notifAppIcon(), notifAppName],
    });
  };

  const notifSummary = Widget.Label({
    class_name: "notifSummary",
    vpack: "start",
    hpack: "center",
    hexpand: true,
    justification: "center",
    xalign: 1,
    max_width_chars: 25,
    wrap: true,
    useMarkup: true,
    label: n.summary,
  });

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
      label: getATagContents(n.body) || "No Body Here",
    }),
  });

  const notifBodyDisp = Widget.EventBox({
    class_name: "notifBodyBox",
    child: notifBodyFull,
  });

  const notifActions = () =>
    Widget.Box({
      visible: n.actions.length > 0,
      class_name: "notifActionBox",
      spacing: 7,
      vpack: "end",
      hexpand: true,
      vexpand: true,
      children: n.actions.map((a) =>
        Widget.EventBox({
          hexpand: true,
          vexpand: true,
          class_name: "notifActions",
          child: Widget.Label(a.label),
          on_primary_click: () => n.invoke(a.id),
        }),
      ),
    });

  const closeButtonIcon = () =>
    Widget.Box({
      class_name: "CloseNotif",
      child: Widget.EventBox({
        on_primary_click: () => {
          if (n.popup) n.dismiss();
          else n.close();
        },
        child: Widget.Icon({ icon: "window-close-symbolic" }),
      }),
    });

  const closeButton = () => {
    const t = Variable(notifs.popupTimeout);

    return Widget.EventBox({
      hpack: "end",
      vpack: "start",
      hexpand: true,
      vexpand: true,
      child: Widget.CircularProgress({
        start_at: 0.75,
        css: "font-size: 3px; min-height: 20px; min-width: 20px",
        child: Widget.Icon({ icon: "window-close-symbolic", size: 15 }),
        value: t.bind().as((v) => v / notifs.popupTimeout),
        setup: (self) =>
          self.poll(100, () => {
            if (t.value === 0) n.dismiss();
            if (n.popup) {
              t.setValue(t.value - 100);
            }
          }),
      }),
      on_primary_click: () => n.dismiss(),
    });
  };

  const bigRevealer = Widget.Revealer({
    class_name: "notifBottomImgActionReveal",
    reveal_child: false,
    child: Widget.Box({
      vertical: true,
      hexpand: true,
      vexpand: true,
      children:
        n.actions.length > 0
          ? [
              Widget.EventBox({
                class_name: "notifActionsEB",
                child: notifActions(),
                on_hover: () => {
                  bigRevealer.reveal_child = true;
                  notifBodyFull.reveal_child = true;
                },
                setup: (self) =>
                  self.on("leave-notify-event", () => {
                    bigRevealer.reveal_child = false;
                    notifBodyFull.reveal_child = false;
                  }),
              }),
            ]
          : [],
    }),
  });

  notifBodyDisp.on_hover = () => {
    bigRevealer.reveal_child = true;
    notifBodyFull.reveal_child = true;
  };
  notifBodyDisp.on("leave-notify-event", () => {
    bigRevealer.reveal_child = true;
    notifBodyFull.reveal_child = true;
  });

  const getDate = () => {
    const current = new Date();

    const formatTime = (time, format) =>
      GLib.DateTime.new_from_unix_local(time).format(format);

    const getTimeDisplay = (time = n.time, format = "%H:%M - %e %m %Y") =>
      formatTime(time, format);
    const getTimeDisplayShort = (time = n.time, format = "%H:%M") =>
      formatTime(time, format);
    const getMinutes = (time = n.time, format = "%M") =>
      formatTime(time, format);
    const getHours = (time = n.time, format = "%H") => formatTime(time, format);
    const getDateCheck = (time = n.time, format = "%e") =>
      formatTime(time, format);
    const getMonthCheck = (time = n.time, format = "%m") =>
      formatTime(time, format);
    const getYearCheck = (time = n.time, format = "%Y") =>
      formatTime(time, format);

    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();
    const currentDate = current.getDate();
    const currentHours = current.getHours();
    const currentMinutes = current.getMinutes();

    const notificationDate = Number(getDateCheck());
    const notificationMonth = Number(getMonthCheck());
    const notificationYear = Number(getYearCheck());
    const notificationHours = Number(getHours());
    const notificationMinutes = Number(getMinutes());

    if (
      (notificationMonth < currentMonth && notificationYear === currentYear) ||
      notificationYear < currentYear
    ) {
      return Widget.Label({
        class_name: "notifDate",
        hpack: "end",
        vpack: "start",
        hexpand: true,
        vexpand: false,
        justification: "right",
        label: getTimeDisplay(),
      });
    } else {
      if (notificationDate < currentDate - 1) {
        return Widget.Label({
          class_name: "notifDate",
          hpack: "end",
          vpack: "start",
          hexpand: true,
          vexpand: false,
          justification: "right",
          label: `${getTimeDisplayShort()} ${currentDate - notificationDate} day(s) ago`,
        });
      } else {
        let time;
        if (
          notificationHours === currentHours &&
          notificationMinutes === currentMinutes
        ) {
          time = `Now`;
        } else if (
          notificationHours === currentHours &&
          notificationMinutes !== currentMinutes
        ) {
          time = `${currentMinutes - notificationMinutes} mins ago`;
        } else {
          const hourDiff = Math.abs(currentHours - notificationHours);
          const minuteDiff = Math.abs(currentMinutes - notificationMinutes);
          time = `${hourDiff} Hrs and ${minuteDiff} Mins ago`;
        }

        return Widget.Label({
          class_name: "notifDate",
          hpack: "end",
          vpack: "start",
          hexpand: true,
          vexpand: false,
          justification: "right",
          label: time,
        });
      }
    }
  };

  const centerBox = () =>
    Widget.CenterBox({
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
            children: [notifAppNameIcon()],
          }),
        ],
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
            children: [notifBodyDisp],
          }),
        ],
      }),

      end_widget: Widget.Box({
        hexpand: true,
        vexpand: true,
        vertical: true,
        hpack: "end",
        spacing: 15,
        children: [
          Widget.Box({
            spacing: 3,
            children: [
              Widget.EventBox({
                class_name: "notifSettings",
                child: Widget.Icon("emblem-system-symbolic"),
                on_primary_click: () =>
                  Utils.execAsync(
                    "kitty -e helix /home/rudy/.config/ags/tsAgs/Functions/Notifications.ts",
                  ),
              }),
              n.popup ? closeButton() : closeButtonIcon(),
            ],
          }),
          Widget.Box({
            hexpand: true,
            vexpand: true,
            vpack: "end",
            hpack: "end",
            child: getDate(),
          }),
        ],
      }),
    });

  return Widget.EventBox({
    class_name: "notifPopup",
    hexpand: true,
    vexpand: true,
    on_hover: () => {
      bigRevealer.reveal_child = true;
      notifBodyFull.reveal_child = true;
    },
    setup: (self) =>
      self
        .hook(n, () => {
          self.toggleClassName("notifCritical", n.urgency === "critical");
          if (n.urgency === "critical") {
            notifs.forceTimeout = true;
            notifs.popupTimeout = 7000;
          }
        })
        .on("leave-notify-event", () => {
          bigRevealer.reveal_child = false;
          notifBodyFull.reveal_child = false;
        }),
    child: Widget.Box({
      spacing: 7,
      className: "notifAllContainer",
      vertical: true,
      children: [
        centerBox(),
        Widget.Box({
          hexpand: true,
          vexpand: true,
          child: bigRevealer,
        }),
      ],
    }),
  });
};

export const NotificationPopups = () => {
  const poppy = notifs.bind("popups");
  const notifWind = Widget.Window({
    class_name: "NotifWindow",
    visible: poppy.as((p) => p.length > 0),
    name: "RNotif",
    anchor: ["top", "right"],
    layer: "overlay",
    margins: [30, 60],
    child: Widget.Box({
      class_name: "NotifPopups",
      child: Widget.Box({
        spacing: 5,
        vertical: true,
        css: "padding: 5px",
        children: notifs
          .bind("popups")
          .as((popups) => popups.map(notificationPopupBody)),
      }),
    }),
  }).hook(
    notifs,
    (self) => {
      notifs.popups.map((n) => {
        if (
          n.app_name.includes("com.github.Aylur.ags.rudy") ||
          n.app_name.includes("notify-send") ||
          n.app_name.includes("Spotify") ||
          n.app_name.includes("udiskie")
        ) {
          self.anchor = ["top"];
          Utils.timeout(7000, () => {
            n.close();
            self.anchor = ["top", "right"];
          });
        }
      });
    },
    "notified",
  );
  return notifWind;
};
