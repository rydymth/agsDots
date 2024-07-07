import { size } from "tsAgs/main"

export default (text: string = "", currDate: Date = new Date(), fin: boolean = false, fintime?: Date, deadline?: Date) => {
  // private variables, we can define getter and setter
  let _done = Variable(fin)
  let _todo = Variable(text) 

  // getter
  function getTodo() { return _todo.getValue() }
  function getStatus() { return _done.getValue() }

  // setter
  var finDate: Date = new Date()
  function setTodo(replacementText: string = _todo.getValue()) { _todo.setValue(replacementText) }
  function setStatus() { _done.setValue(!_done.getValue()); finDate = new Date() }

  // Variable for controlling the changer from label to entry
  let change = Variable(false)

  // The todo text and entry for editing the same can be a revealer

  // unchanged label
  const todoTextLabel = () => Widget.Label({
      hexpand: true,
      class_name: "NormalLabel",
      label: getTodo()
    })

  // Chainging entry
  const changeTodo = () => Widget.Entry({
    hexpand: true,
    class_name: 'todoItemChangingEntry',
    text: getTodo(),
    visibility: true,
    onAccept: ({ text }) => setTodo(text?.toString())
  })

  const todoText = Widget.Box ({
    class_name: "todoTextEntryBox",
    setup: self => self.hook(change, () => {
      if (change.getValue())
        self.child = changeTodo()
      else
        self.child = todoTextLabel()
    }, "changed")
  })

  // EventBox containing the above two
  const todoChanger = Widget.EventBox({
    class_name: "todoChangerEB",
    hpack: "end",
    child: Widget.Icon({
      class_name: "listChangerIcon",
      size: size,
      setup: self => self.hook(change, () => self.icon = change.getValue() ? "done-symbolic" : "pen-symbolic", "changed")
    }),
    on_primary_click: () => {
      change.setValue(!change.getValue())
    }
  })

  // Above together
  // Going back to the original design
  const labelChangeContainer = Widget.Box({
      class_name: "todoChangerBox",
      hexpand: true,
      spacing: 5,
      children: [
        Widget.Box({
          class_name: "revealTODOContainers",
          children: [
            todoText,
          ]
        }),
        todoChanger
      ]
    })

  // Unchecked
  const checkedUncheckedRevealer = Widget.Icon({
    class_name: "uncheckedListIcon",
    size: size,
    setup: self => self.hook(_done, () => self.icon = getStatus() ? "checked-symbolic" : "unchecked-symbolic", "changed")
  })

  // EB for checkBoxes 
  const checkEB = Widget.EventBox({
    class_name: "checkBoxEB",
    child: Widget.Box({
      class_name: "checkBoxBox",
      children: [
        checkedUncheckedRevealer,
      ]
    }),
    on_primary_click: () => {
      setStatus()
      }
  })

  // Task created date
  const createdDate = Widget.Label({
    class_name: "taskCreatedDate",
    label: `Date Created: ${currDate}`    
  })

  // Task ended Date
  const finishDate = Widget.Label({
    class_name: "endDate",
    justification: 'right',
    setup: self => self.hook(_done, () => self.label = getStatus() ? `${finDate}` : "Not Finished Yet" , "changed")
  })

  return Widget.Box({
    hexpand: true,
    attribute: {
      comp: _done,
      change: change
    },
    class_name: "todoSingleItem",
    spacing: 5,
    vertical: true,
    children: [
      createdDate,
      Widget.Box({ spacing: 5, class_name: "allRevealContain"}, checkEB, labelChangeContainer),
      finishDate
    ],
    setup: self => self
      .hook( _done, () => self.attribute = { ...self.attribute, comp: _done }, "changed")
      .hook(change, () => self.attribute = { ...self.attribute, change: change }, "changed")
  })
}
