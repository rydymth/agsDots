const greetd = await Service.import('greetd');

const name = Widget.Entry({
    placeholder_text: 'Username',
    on_accept: () => password.grab_focus(),
})

const password = Widget.Entry({
    placeholder_text: 'Password',
    visibility: false,
    on_accept: () => {
        greetd.login(name.text || '', password.text || '', 'Hyprland')
            .catch(err => response.label = JSON.stringify(err))
    },
})


const date = Variable("", {
    poll: [1000, 'date "+%H:%M:%S %a %e %b %Y"'],
})

const response = Widget.Label()

const win = Widget.Window({
    css: 'background-color: transparent;',
    anchor: ['top', 'left', 'right', 'bottom'],
    exclusive: true,
    keymode: "exclusive",
    spacing: 15,
    child: Widget.Box({
        vertical: true,
        hpack: 'center',
        vpack: 'center',
        hexpand: true,
        vexpand: true,
        children: [
            name,
            password,
            response,
        ],
    }),
})

const bar = Widget.Window({
    anchor: ["top", "left", "right"],
    child: Widget.CenterBox({
        spacing: 10,
        start_widget: Widget.Box({
            hpack: "start",
            hexpand: true,
            spacing: 10,
            children: [
                Widget.Label("Welcome back Rudy")
            ]
        }),
        center_widget: Widget.Box({
            hpack: "center",
            hexpand: true,
            spacing: 10,
            children: [
                Widget.Label(date.bind().as(d => `${d}`))
            ]
        }),
        end_widget: Widget.Box({
            hpack: "end",
            hexpand: true,
            spacing: 10,
            children: [
                Widget.Button({
                    child: Widget.Icon("system-shutdown-symbolic"),
                    on_clicked: () => Utils.exec("shutdown now")
                }),
                Widget.Button({
                    child: Widget.Icon("system-reboot-symbolic"),
                    on_clicked: () => Utils.exec("reboot")
                }),
                Widget.Button({
                    child: Widget.Label("Suspend"),
                    on_clicked: () => Utils.exec("systemctl suspend")
                })
            ]
        })
    })   
})

App.config({ windows: [
    win,
    bar
] })

export {}
