const audio = await Service.import("audio")
import Tooltips from "tsAgs/Functions/Tooltips"
import closeWin from "tsAgs/Functions/closeWin"
import { size } from "tsAgs/main"

const audioIcons =  {
    mic: {
        muted: "microphone-disabled-symbolic",
        low: "microphone-sensitivity-low-symbolic",
        medium: "microphone-sensitivity-medium-symbolic",
        high: "microphone-sensitivity-high-symbolic",
    },
    volume: {
        muted: "audio-volume-muted-symbolic",
        low: "audio-volume-low-symbolic",
        medium: "audio-volume-medium-symbolic",
        high: "audio-volume-high-symbolic",
    },
    type: {
        headset: "audio-headphones-symbolic",
        speaker: "audio-speakers-symbolic",
        card: "audio-card-symbolic",
    },
    mixer: "mixer-symbolic",
}

const VolumeSlider = (type = 'speaker') => Widget.Slider({
    class_name: `${type}Slider`,
    hexpand: true,
    drawValue: false,
    onChange: ({ value }) => audio[type].volume = value,
    value: audio[type].bind('volume'),
})

const audioStreams = (type: string = "speaker") => Widget.Box({
    vertical: true,
    class_name: `${type}StreamBox`,
    children: [
        Widget.Label({
            vpack: "center",
            class_name: `${type}StreamHeader`,
            label: `${type} Streams`,
        }),
        Widget.Separator(),
        Widget.Box({
            class_name: `${type}StreamBoxInner`,
            vertical: true,
            children: audio.bind("speakers").as(stream => stream.map(str => Widget.EventBox({
                class_name: `${type}stream`,
                child: Widget.Box({
                    class_name: `${type}SingleStreamBox`,
                    children: [
                        Widget.Icon({
                            hpack: "start",
                            class_name: `${type}streamIcon`,
                            icon: (type === "speaker") ? audioIcons.volume.medium : audioIcons.mic.medium
                        }),
                        Widget.Label({
                            hpack: "center",
                            class_name: `${type}streamLabel`,
                            label: `${str.name}`
                        }),
                        Widget.Label({
                            hexpand: true,
                            vpack: "end",
                            setup: self => self.hook(audio, () => {
                                if (audio.speaker.stream === str.stream)
                                    self.label = " "
                                else
                                    self.label = " "
                            })
                        })
                    ]
                }),
                on_primary_click: () => {
                    console.log(audio.speaker + "\n\n" + str)
                    if (type === "speaker")
                        audio.speaker = str
                    else
                        audio.microphone = str
                }
            })))
        })
    ]
})

const audioIcon = (type: string = "speaker") => Widget.Icon({
    class_name: `${type}IndIcon`,
    size: size+2,
    setup: self => self.hook(audio, () => {
        let vol = 0
        const { muted, low, medium, high } = (type === "speaker") ?  audioIcons.volume : audioIcons.mic
        const cons = [[67, high], [34, medium], [1, low], [0, muted]] as const
        if (type === "speaker")
            vol = audio.speaker.is_muted ? 0 : audio.speaker.volume
        else
            vol = audio.microphone.is_muted ? 0 : audio.microphone.volume
        self.icon = cons.find(([n]) => n <= vol * 100)?.[1] || ""
    })
})

export const audioWinContents = (type: string = "speaker") => 
    Widget.Box(
    {
        class_name: "audioWindowContents",
        vertical: true,
    },
    Widget.Box({
            class_name: "audioIcSlide",
            children: [ audioIcon(type), VolumeSlider(type)] 
    }),
    Widget.Separator(),
    audioStreams(type)
)

export const audioWin = (type: string = "speaker") => Widget.Window({
    name:  `${type}Window`,
    class_name: "audioWindow".concat(`${type}`),
    visible: false,
    anchor: ["top", "right"],
    margins: [10, 50],
    child: Widget.Box({
        vertical: true,
        hexpand: true,
        class_name: "audioWinBox",
        children: [
        ]
    }),
    keymode: "exclusive",
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(`${type}Window`)
    }),
})

function getVol(type: string) {
    let vol = 0
    if (type === "speaker")
        vol = audio.speaker.is_muted ? 0 : audio.speaker.volume
    else
        vol = audio.microphone.is_muted ? 0 : audio.microphone.volume
    return vol
}

/** @param {'speaker' | 'microphone'} type */
export const indFn = (type: string = "speaker") => {
 
    return Widget.EventBox({
        class_name: `${type}EventBox`,
        child: Widget.Box({
            class_name: `${type}Box`,
            child: audioIcon(type),
        }),
        setup: self => self
        .hook(audio, () => {
            self.tooltip_text = `${type} Volume = ${Math.ceil(getVol(type))}`            
        }),
    })    
}
