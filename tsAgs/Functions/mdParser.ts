import { size } from "tsAgs/main";
import checkBox from "./checkBox"
import closeWin from "./closeWin";

class todoItems {
    todoText: string;
    creationDate: Date;
    status: boolean;
    finishDate: Date | undefined;
    deadline: Date | undefined

    constructor(text: string = "", currDate: Date = new Date(), fin: boolean = false, fintime?: Date, deadline?: Date) {
        this.todoText = text
        this.creationDate = currDate
        this.status = fin
        this.finishDate = fintime
        this.deadline = deadline
    }
}

function dateParser (date: string) { return new Date(Date.parse(date.replace("at", "")))}

export const todoWin = (todoTask: string) => {

    let taskDiv = todoTask.split("\n"); 

    let doneTasks: todoItems[] = [];
    let remainingTasks: todoItems[] = [];

    taskDiv.map(indTask => {
        let indTaskItem = indTask.split("#")
        if (indTaskItem[0].includes("-[x]"))
            doneTasks.push(new todoItems(
                indTaskItem[2],
                dateParser(indTaskItem[1]),
                true,
                dateParser(indTaskItem[3]),
                dateParser(indTaskItem[4])
            ))
        else
            remainingTasks.push(new todoItems(
                indTaskItem[2],
                dateParser(indTaskItem[1]),
                false,
                undefined,
                indTaskItem[3] === "" ? undefined : dateParser(indTaskItem[3])
        ))
    })
    
    const doneCheckBoxes = () => Widget.Box({
        class_name: "doneCheckBoxes",
        vertical: true,
        spacing: 10,
        children: doneTasks.map(task => {
            const chk = checkBox(task.todoText, task.creationDate, task.status, task.finishDate, task.deadline)
            chk.attribute.change.connect("changed", () => {
                doneTasks = doneTasks.filter(t => t.todoText !== task.todoText)
                remainingTasks.push(task)
            })
            return Widget.Box({
                class_name: "indTodoItemContainer",
                css: "padding: 0 5em",
                vertical: true,
                children: [
                    chk,
                    Widget.Separator()
                ]
            })
        }
        )
    })

    const remainingCheckBoxes = () => Widget.Box({
        class_name: "doneCheckBoxes",
        vertical: true,
        spacing: 10,
        children: remainingTasks.map(task => Widget.Box({
            class_name: "indTodoItemContainer",
            css: "padding: 0 5em",
            vertical: true,
            children: [
                checkBox(task.todoText, task.creationDate, task.status, undefined, task.deadline ? task.deadline : undefined),
                Widget.Separator()
            ]
        }))
    })
    
    const unfinishedRevealer = Widget.Revealer({
        class_name: "todoMainRevealer",
        reveal_child: false,
        child: Widget.Scrollable({
            class_name: "todoObjScroller",
            css: "min-height: 45em;",
            hscroll: "never",
            vscroll: "always",
            hexpand: true,
            vexpand: true,
            child: remainingCheckBoxes()
       })
    })
    
    const finishedRevealer = Widget.Revealer({
        class_name: "todoMainRevealer",
        reveal_child: false,
        child: Widget.Scrollable({
            class_name: "todoObjScroller",
            css: "min-height: 45em;",
            hscroll: "never",
            vscroll: "always",
            hexpand: true,
            vexpand: true,
            child: doneCheckBoxes()
       })
    })
    
    const together = Widget.Box({
       class_name: "BothContainer", 
       vertical: true,
       spacing: 10,
       children: [
        Widget.EventBox({
           class_name: "todoEBox finished",
           hexpand: true,
           vexpand: true,
           child: Widget.Box(
            {class_name: "finished", spacing: 5, vertical: true},
            Widget.Label({class_name: "unfinishedTaskLabel", label: "Dont u worry about this"}),
            ), 
            on_primary_click: () => finishedRevealer.reveal_child = !finishedRevealer.reveal_child
        }),
        finishedRevealer,
        Widget.Separator(),
        Widget.EventBox({
           hexpand: true,
           vexpand: true,
           class_name: "todoEBox unfinished",
           child: Widget.Box(
            {class_name: "unfinished", spacing: 5, vertical: true},
            Widget.Label({class_name: "unfinishedTaskLabel", label: "Unfinished Business"}),
            ), 
            on_primary_click: () => unfinishedRevealer.reveal_child = !unfinishedRevealer.reveal_child
        }),
        unfinishedRevealer,
       ]
    })
    
    return Widget.Window({
        visible: false,
        name: "todoWindow",
       class_name: "masterCheckBox", 
       child: together,
       margins: [30, 30],
       anchor: ["top", "left", "right"],
       exclusivity: "ignore",
       layer: "overlay",
       keymode: "exclusive",
       setup: self => self
        .keybind("Escape", () => App.toggleWindow("todoWindow"))
    })
}

export const windowToggleButton = () => Widget.EventBox({
    class_name: "todoClickable",
    child: Widget.Icon({
        class_name: "notesIcon",
        icon: "notes-symbolic",
        size: size
    }),
    on_primary_click: () => {
        closeWin("todoWindow")
        App.toggleWindow("todoWindow")
    }
})