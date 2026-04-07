import { contextBridge, ipcRenderer } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

/**
 * プリロードスクリプトのテストスイート
 */
describe("preload script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * contextBridgeを使用してレンダラーに安全にAPIを公開し、イベント登録・解除ができることを確認する
   */
  it("should correctly expose API via contextBridge", async () => {
    // プリロードスクリプトをインポートし、グローバル領域の処理を実行させる
    await import("./preload");

    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      "electron",
      expect.objectContaining({
        platform: process.platform,
        onNoteNew: expect.any(Function),
        onNoteDelete: expect.any(Function),
      })
    );

    // 追加された API オブジェクトを取得
    const exposedApi = vi.mocked(contextBridge.exposeInMainWorld).mock
      .calls[0]?.[1] as {
      onNoteNew: (cb: () => void) => () => void;
      onNoteDelete: (cb: () => void) => () => void;
    };

    // onNoteNew の登録テスト
    const newCallback = vi.fn();
    const unlistenNew = exposedApi.onNoteNew(newCallback);
    expect(ipcRenderer.on).toHaveBeenCalledWith(
      "menu:note-new",
      expect.any(Function)
    );

    // リスナーへの通知をモックでシミュレートしてコールバックが呼ばれるかテスト
    const registeredNewListener = vi
      .mocked(ipcRenderer.on)
      .mock.calls.find(
        (call) => call[0] === "menu:note-new"
      )?.[1] as () => void;
    registeredNewListener();
    expect(newCallback).toHaveBeenCalled();

    // 登録解除関数のテスト
    unlistenNew();
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      "menu:note-new",
      expect.any(Function)
    );

    // onNoteDelete の登録テスト
    const deleteCallback = vi.fn();
    const unlistenDelete = exposedApi.onNoteDelete(deleteCallback);
    expect(ipcRenderer.on).toHaveBeenCalledWith(
      "menu:note-delete",
      expect.any(Function)
    );

    const registeredDeleteListener = vi
      .mocked(ipcRenderer.on)
      .mock.calls.find(
        (call) => call[0] === "menu:note-delete"
      )?.[1] as () => void;
    registeredDeleteListener();
    expect(deleteCallback).toHaveBeenCalled();

    // 登録解除関数のテスト
    unlistenDelete();
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      "menu:note-delete",
      expect.any(Function)
    );
  });
});
