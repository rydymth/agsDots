const hyprland = await Service.import("hyprland");
export {};

const mainWindow = () =>
  Widget.Window({
    visible: false,
    name: "overview",
    child: Widget.Box({
      class_name: "overviewContainer",
      children: [],
    }),
  });

const allClientsUnique = () => {};
