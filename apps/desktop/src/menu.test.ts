import { app, BrowserWindow, Menu } from "electron";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setupMenu } from "./menu.js";

vi.mock("electron", () => ({
  app: { getVersion: vi.fn().mockReturnValue("1.0.0") },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
  Menu: {
    buildFromTemplate: vi.fn().mockReturnValue("MOCK_MENU"),
    setApplicationMenu: vi.fn(),
  },
}));

/**
 * カスタムアプリケーションメニューのテストスイート
 */
describe("setupMenu", () => {
  const originalPlatform = process.platform;

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  /**
   * macOS (darwin) ではAppMenuが先頭に追加されることを確認する
   */
  it("should build and set the application menu for macOS (darwin)", () => {
    Object.defineProperty(process, "platform", {
      value: "darwin",
      configurable: true,
    });
    setupMenu();
    expect(Menu.buildFromTemplate).toHaveBeenCalled();
    const template = vi.mocked(Menu.buildFromTemplate).mock.calls[0]?.[0];
    if (template) expect(template[0]).toEqual({ role: "appMenu" });
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith("MOCK_MENU");
  });

  /**
   * macOS以外 (win32/linux) ではAppMenuが追加されずFileMenuから始まることを確認する
   */
  it("should build and set the application menu for non-macOS (win32/linux)", () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
      configurable: true,
    });
    setupMenu();
    expect(Menu.buildFromTemplate).toHaveBeenCalled();
    const template = vi.mocked(Menu.buildFromTemplate).mock.calls[0]?.[0];
    if (template) expect(template[0]).toEqual({ role: "fileMenu" });
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith("MOCK_MENU");
  });

  /**
   * 追加したカスタムメニュー項目がクリックされた際にIPCメッセージが送出されることを確認する
   */
  it("should send IPC messages when custom menu items are clicked", () => {
    setupMenu();
    const template = vi.mocked(Menu.buildFromTemplate).mock
      .calls[0]?.[0] as Array<{
      label?: string;
      submenu?: Array<{ label?: string; click?: () => void }>;
    }>;

    // Note メニューを探す
    const noteMenu = template?.find((item) => item.label === "Note");
    expect(noteMenu).toBeDefined();

    const mockSend = vi.fn();
    vi.mocked(BrowserWindow.getFocusedWindow).mockReturnValue({
      webContents: { send: mockSend },
    } as unknown as BrowserWindow);

    // New Note イベントを発火させる
    const newNoteItem = noteMenu?.submenu?.find(
      (item) => item.label === "New Note"
    );
    newNoteItem?.click?.();
    expect(mockSend).toHaveBeenCalledWith("menu:note-new");

    // Delete Note イベントを発火させる
    const deleteNoteItem = noteMenu?.submenu?.find(
      (item) => item.label === "Delete Note"
    );
    deleteNoteItem?.click?.();
    expect(mockSend).toHaveBeenCalledWith("menu:note-delete");
  });
});
