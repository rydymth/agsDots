import Window, { type WindowProps} from "types/widgets/window"

export default ({name, class_name, anchor}: WindowProps, boxName: string = name+"Box", labelName: string = name+"Label", label: string = "") => Widget.Window({
    anchor: anchor,
    name,
    class_name,
    visible: false,
    child: Widget.Box({
        class_name: boxName,
        child: Widget.Label({
            class_name: labelName,
            label: label
        })
    }),
})