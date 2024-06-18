const audio = await Service.import("audio")
import Brightness from "tsAgs/Services/Brightness"
import KeyboardBrightness from "tsAgs/Services/KeyboardBrightness"
import { Connectable } from "types/service"
import { WindowProps } from "types/widgets/window"

const osd = (labelName: string, type: string) =>
    {
        const Ind = Widget.Label({
            class_name: labelName,
            hpack: "start",
            label: labelName
        })
        
        const Val = Widget.Label({
            class_name: "VolOSdVal",
            hpack: "end",
        })
        
        const progress = Widget.LevelBar({
            class_name: "VolOsdProg",
            width_request: 100,
            bar_mode: "discrete",
            max_value: 100,
        })
        
        if (type === "audio")
        {     
            Val.hook(audio, () => {
                Val.label = `${Math.ceil(audio.speaker.volume*100)}%`
            })

            progress.hook(audio, () => {
                progress.value = audio.speaker.volume*100
            })
        }
        
        else if( type === "brightness")
        {
            Val.hook(Brightness, () => {
                Val.label = `${Math.ceil(Brightness._screen)}%`
            })

            progress.hook(Brightness, () => {
                progress.value = Brightness._screen
            })
        }
        else if( type === "kbd" )
        {
            Val.hook(KeyboardBrightness, () => {
                Val.label = `${Math.ceil(KeyboardBrightness._screen)}%`
            })

            progress.hook(KeyboardBrightness, () => {
                progress.value = KeyboardBrightness._screen
            })
        }

        
        const together = Widget.Box({
            vertical: true,
            class_name: labelName.concat("Osd"),
            children: [Widget.Box({spacing: 10},Ind, Val), progress]
        })
        
        return together
    } 
    
const osdWin = ( { name, class_name, anchor, child, margins }: WindowProps, gobject: Connectable, signal: string) => {
    let count = 0
    return Widget.Window({
        visible: false,
        name: name,
        class_name,
        anchor,
        child,
        margins,
        layer: "overlay",
        setup: self => self.hook(gobject, () => {
            count++;
            self.visible = true
            Utils.timeout(2500, () => {
                count--;
                if (count === 0)
                    self.visible = false
            })
        }, signal)
    })
}

const volOsdChild = osd("Volume", "audio")
const screenOsdChild = osd("Brightness", "brightness" )
const kbdOsdChild = osd("KeyboardBrightness", "kbd")

export const volOSD = osdWin(
    {
        name: "Volume",
        class_name: "VolumeOSD",
        anchor: [],
        margins: [10, 10],
        child: volOsdChild
    },
    audio.speaker,
    "notify::volume"
)

export const screenOSD = osdWin(
    {
        name: "ScreenBrightness",
        class_name: "screenOSD",
        anchor: ["top"],
        margins: [10, 10],
        child: screenOsdChild
    },
    Brightness,
    "notify::screen"
)

export const kbdOSD = osdWin(
    {
        name: "kbdBrightness",
        class_name: "kbdOSD",
        anchor: ["bottom"],
        margins: [10, 10],
        child: kbdOsdChild
    },
    KeyboardBrightness,
    "notify::screen"
)
