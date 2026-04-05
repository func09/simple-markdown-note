import {
  app,
  BrowserWindow,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";

export function setupMenu() {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    // アプリ自身のメニュー (Mac 専用)
    ...(isMac ? [{ role: "appMenu" as const }] : []),
    // 標準的な File, Edit メニュー
    { role: "fileMenu" as const },
    { role: "editMenu" as const },
    // 独自の Note メニューを追加
    {
      label: "Note",
      submenu: [
        {
          label: "New Note",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send("menu:note-new");
          },
        },
        {
          label: "Delete Note",
          accelerator: "CmdOrCtrl+Backspace",
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send(
              "menu:note-delete"
            );
          },
        },
      ],
    },
    // 標準的な View, Window, Help メニュー
    { role: "viewMenu" as const },
    { role: "windowMenu" as const },
    {
      role: "help" as const,
      submenu: [
        {
          label: `Version ${app.getVersion()}`,
          enabled: false,
        },
        { type: "separator" },
        { role: "about" as const },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
