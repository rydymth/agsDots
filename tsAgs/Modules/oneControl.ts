import { indFn, audioWinContents } from "./Audio";
import { scrollable, dnd, clear } from "./NotificationCenter";
import { wifiBoxConetents } from "./Wifi";
import { btChild } from "./Bluetooth";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0";
import closeWin from "tsAgs/Functions/closeWin";
const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");
const notifications = await Service.import("notifications");

export const commonWindow = Widget.Window({
  visible: false,
  class_name: "utilWindow",
  name: "utilWindow",
  margins: [25, 25],
  keymode: "on-demand",
  child: Widget.Box({
    class_name: "UtilContainer",
  }),
  setup: (self) =>
    self.keybind("Escape", () => {
      App.closeWindow(self.name || "");
    }),
});

function notifs() {
  return Widget.EventBox({
    class_name: "notifCenter",
    child: Widget.Box(
      { class_name: "ncBox", spacing: 3 },
      Widget.Overlay({
        child: Widget.Label({ label: `󰂚   ` }),
        overlays: [
          Widget.Label({
            css: "font-size: 0.7rem",
            hpack: "end",
            vpack: "fill",
          }).hook(notifications, (self) => {
            self.label = `${notifications.notifications.length}`;
          }),
        ],
        pass_through: true,
      }),
    ),
  });
}

const WifiIndicator = () =>
  Widget.Box({
    children: [
      Widget.Icon().hook(network, (self) => {
        self.icon = network.wifi.icon_name;
        self.tooltip_text = `${network.wifi.frequency}`;
      }),
    ],
  });

const WiredIndicator = () =>
  Widget.Icon().hook(network, (self) => {
    self.icon = network.wired.icon_name;
    self.tooltip_text = `${network.wired.speed}`;
  });

const bluetoothInd = () =>
  Widget.Icon({
    visible: bluetooth.bind("enabled"),
    icon: bluetooth
      .bind("enabled")
      .as((on) => `bluetooth-${on ? "active" : "disabled"}-symbolic`),
  });

const uptime = Variable("", {
  poll: [60000, "uptime --pretty"],
});

const uptimeLabel = () =>
  Widget.EventBox({
    child: Widget.Label({
      hexpand: true,
      justification: "left",
      class_name: "SysInfoElements uptime",
      label: uptime.bind().as((up) => `Uptime is: ${up}`),
    }),
  });

const sysInd = (widget: Gtk.Widget, action: Gtk.Widget) =>
  Widget.Box({
    class_name: "sysIndButtonContainer",
    child: Widget.Button({
      class_name: "sysIndButton",
      child: widget,
      on_clicked: () => {
        closeWin("utilWindow");
        commonWindow.child.child = action;
        commonWindow.visible = !commonWindow.visible;
      },
    }),
  });

const windowItems = () =>
  Widget.CenterBox({
    class_name: "allInOneCenterBox",
    vertical: true,
    spacing: 10,
    start_widget: Widget.Box({
      hexpand: true,
      vexpand: true,
      class_name: "SysInfo",
      vertical: true,
      children: [uptimeLabel()],
    }),

    center_widget: Widget.Box({
      hexpand: true,
      vexpand: true,
      class_name: "NotificationCenter",
      vertical: true,
      children: [
        Widget.Box(
          {
            class_name: "notifHandler",
            spacing: 50,
          },
          Widget.Box(
            {
              hpack: "start",
              class_name: "notifHandleIcon",
            },
            dnd(),
          ),
          Widget.Box(
            {
              hpack: "end",
              class_name: "notifHandleIcon",
            },
            clear(),
          ),
        ),
        scrollable(),
      ],
    }),
    end_widget: Widget.Box({
      class_name: "SysIndicators",
      spacing: 50,
      children: [
        sysInd(WifiIndicator(), wifiBoxConetents()),
        sysInd(bluetoothInd(), btChild()),
        sysInd(indFn("speaker"), audioWinContents("speaker")),
        sysInd(indFn("microphone"), audioWinContents("microphone")),
      ],
    }),
  });

export const controlWindow = Widget.Window({
  visible: false,
  name: "controlPanel",
  class_name: "controlPanel",
  margins: [10, 10],
  anchor: ["top", "right", "bottom"],
  keymode: "on-demand",
  child: windowItems(),
  setup: (self) =>
    self.keybind("Escape", () => {
      App.closeWindow(self.name || "");
    }),
});

export const indIcons = () =>
  Widget.EventBox({
    class_name: "sysIndBarIcons",
    child: Widget.Box(
      { spacing: 1, class_name: "indIcons" },
      indFn("speaker"),
      indFn("microphone"),
      WiredIndicator(),
      WifiIndicator(),
      bluetoothInd(),
      notifs(),
    ),
    on_primary_click: () => {
      closeWin("controlPanel");
      controlWindow.visible = !controlWindow.visible;
    },
  });
