const bluetooth = await Service.import("bluetooth");
import { type BluetoothDevice } from "types/service/bluetooth";
import closeWin from "tsAgs/Functions/closeWin";
import { size } from "tsAgs/main"; 

const winName = "bluetooth"

const bluetoothToggleButton = () => Widget.Box({
    class_name: "bluetoothToggleBox",
    hexpand: true,
    spacing: 10,
    children: [
        Widget.Label({
            hpack: "start",
            hexpand: true,
            class_name: "bluetoothToggleLabel",
            label: "Bluetooth Menu", 
        }),
        Widget.Switch({
            hpack: 'end',
            hexpand: true,
            class_name: "bluetoothToggleSwitch",
            active: bluetooth.bind("enabled"),
        })
    ]
})

const btDeviceInfoRevealer = (device: BluetoothDevice) => Widget.Revealer({
    class_name: "BTDeviceInfoRevealer",
    revealChild: bluetooth.bind("connected_devices").as(b => b.includes(device)),
    transition: "slide_left",
    child: Widget.Box({
        class_name: "BTInfoBox",
        children: [
            Widget.Label({
                class_name: "BTDeviceBatteryInfo",
                label: device.bind("battery_percentage").as(b => `${b}% Remaining`) || "No Battery Found"
            })
        ]
    })
})

const btDeviceList = (device: BluetoothDevice) => Widget.EventBox({
    class_name: "BluetoothDeviceEventBox",
    child: Widget.Box({
        class_name: "BluetoothDeviceListBox",
        children: [
            Widget.Icon({
                class_name: device.bind("name").as(n => `${n}BtDeviceIcon`),
                icon: device.icon_name,
            }),
            Widget.Label({
                class_name: device.bind("name").as(n => `${n}`),
                label: device.bind("name").as(n => `${n}`)
            }),
            Widget.Spinner({
                class_name: "btDeviceSpinner",
                setup: self => self.hook(device, () => self.visible = device.connecting)
            }),
            Widget.Box({
                class_name: "btRevealerBox",
                child: btDeviceInfoRevealer(device),
            })
        ]
    }),
    setup: self => self.hook(device, () => {
        self.on_primary_click = () => {
            device.setConnection(!device.connected)
        }
    })
})

const getBT = () => {
    return `${bluetooth.connected_devices.filter( d => d.connected).length} devices connected`
}

export const btChild = () => Widget.Box({
        class_name: winName.concat("Box"),
        vertical: true,
        children: [
            bluetoothToggleButton(),
            Widget.Separator(),
            Widget.Box({
                class_name: "btDevicesBox",
                vertical: true,
                spacing: 5,
                hexpand: true,
                children: bluetooth.bind("devices").as(d => d.filter(d => d.name).map(btDeviceList))
            })
        ]
    })

export const btWindow = () => Widget.Window({
    visible: false,
    name: winName,
    class_name: winName.concat("Window"),
    anchor: ["top", "right"],
    margins: [10, 120],
    child: btChild(),
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(self.name || "")
    }),
})

export const btBarButton = () => Widget.EventBox({
    class_name: "btBarEventBox",
    child: Widget.Box({
        class_name: "btBarBox",
        child: Widget.Icon({
            class_name: "btBarIcon",
            icon: bluetooth.bind("enabled").as(b => b) ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic",
            size: size,
        })
    }),
    on_primary_click: () => {
        closeWin(winName)
        App.toggleWindow(winName)
    },
    setup: self => self.hook(bluetooth, () => self.tooltip_text = getBT())
})
