const Network = await Service.import("network");
import closeWin from "tsAgs/Functions/closeWin";
import { size } from "tsAgs/main";

const wifiWin = "wifi";

let connectAttempt: string | null = "";

const wifiSelectionMenu = () =>
  Widget.Box({
    class_name: "wifiSelectionMenu",
    vertical: true,
    spacing: 5,
    setup: (self) =>
      self.hook(Network, () => {
        self.children = Network.wifi.access_points
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 9)
          .map((ssid) => {
            const passRevealer =
              Widget.Revealer({
                transition: "slide_down",
                child: Widget.Box({
                  className: "margin-top-10 spacing-v-5",
                  vertical: true,
                  children: [
                    Widget.Label({
                      className: "margin-left-5",
                      hpack: "start",
                      label: "Authentication",
                    }),
                    Widget.Entry({
                      className: "sidebar-wifinetworks-auth-entry",
                      visibility: false, // Password dots
                      onAccept: (self) => {
                        console.log(connectAttempt);
                        passRevealer.reveal_child = false;
                        Utils.execAsync(
                          `nmcli device wifi connect '${connectAttempt}' password '${self.text}'`,
                        ).catch((err) => console.log(err));
                      },
                    }),
                  ],
                }),
                setup: (self) =>
                  self.hook(Network, (self) => {
                    console.log(Network.wifi.state);
		    console.log(ssid.ssid);
		    console.log(connectAttempt);
                    if (
                      (Network.wifi.state == "failed" ||
                        Network.wifi.state == "need_auth" ||
                        Network.wifi.state == "disconnected") &&
                      connectAttempt === ssid.ssid
                    ) {
                      console.log(ssid.ssid);
                      self.reveal_child = true;
                    }
                  }),
              });
            const box =
              Widget.Box({
                class_name: "accessPoint" + ssid + "attributes",
                hexpand: true,
                spacing: 5,
                children: [
                  Widget.Icon({
                    hpack: "start",
                    hexpand: true,
                    class_name: `${ssid}Icon`,
                    icon: ssid.iconName,
                  }),
                  Widget.Label({
                    hpack: "center",
                    hexpand: true,
                    class_name: `${ssid}Label`,
                    label: ssid.ssid || "",
                  }),
                  Widget.Label({
                    class_name: `${ssid}ConnectedTick`,
                    label: "  ",
                    hpack: "end",
                    hexpand: true,
                    setup: (self) =>
                      self.hook(Network.wifi, () => {
                        if (Network.wifi.ssid === ssid.ssid) self.label = " ";
                      }),
                  }),
                ],
              });
            return Widget.EventBox({
              class_name: `wifiList`,
              on_primary_click: () => {
                connectAttempt = ssid.ssid;
                Utils.execAsync(
                  `nmcli device wifi connect ${ssid.bssid}`,
                ).catch((err) => {
		  console.log(Network.wifi.state);
		  console.log("huh!!!");
                });
              },
              child: Widget.Box({
                class_name: "wifiContainers",
                vertical: true,
                spacing: 3,
                children: [box, passRevealer],
              }),
            });
          });
      }),
  });

export const wifiBoxConetents = () =>
  Widget.Box({
    class_name: "wifiBoxContents",
    vertical: true,
    spacing: 5,
    children: [
      Widget.Box({
        class_name: "wifiToggleButton",
        hexpand: true,
        spacing: 10,
        children: [
          Widget.Label({
            class_name: "WifiMenuLabel",
            hpack: "start",
            hexpand: true,
            label: "Wifi Menu",
          }),
          Widget.Switch({
            class_name: "WifiSwitch",
            active: Network.wifi.enabled,
            setup: (self) =>
              self.on("notify::active", () => {
                Network.toggleWifi();
              }),
          }),
        ],
      }),
      wifiSelectionMenu(),
    ],
  });

export const wifiWindow = () =>
  Widget.Window({
    visible: false,
    class_name: wifiWin,
    name: wifiWin,
    anchor: ["top", "right"],
    margins: [10, 100],
    child: wifiBoxConetents(),
    keymode: "exclusive",
    setup: (self) =>
      self.keybind("Escape", () => {
        App.closeWindow(self.name || "");
      }),
  });

function getWifi() {
  if (!Network.wifi.enabled) return "Enable internet";
  else {
    if (Network.wifi.internet === "disconnected")
      return "Connected but no internet :(";
    else return Network.wifi.ssid?.toString() || "";
  }
}

export default () => {
  const WifiIndicator = Widget.Box({
    class_name: "WifiIconBar",
    children: [
      Widget.EventBox({
        class_name: "WifiButtonBar",
        setup: (self) =>
          self.hook(Network, () => {
            self.tooltip_text = getWifi();
          }),
        child: Widget.Icon({
          class_name: "WifiButtonIconBar",
          size: size,
          icon: Network.wifi.bind("icon_name"),
        }),
        on_primary_click: () => {
          closeWin(wifiWin);
          App.toggleWindow(wifiWin);
          Network.wifi.bind("enabled") && Network.wifi.scan();
        },
      }),
    ],
  });

  return WifiIndicator;
};
