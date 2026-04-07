import { app, BrowserWindow } from "electron";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// menu setupをモック
vi.mock("./menu.js", () => ({
  setupMenu: vi.fn(),
}));

// イベントリスナーを追跡する仕組みを用意
let mockWindowListeners: Record<string, () => void> = {};
let mockAppListeners: Record<string, () => void> = {};
let readyPromiseResolver: () => void;
let readyPromise: Promise<void>;

vi.mock("electron", () => {
  const windowInstance = {
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn((event: string, callback: () => void) => {
      mockWindowListeners[event] = callback;
    }),
  };

  const BrowserWindowMock = vi.fn().mockImplementation(() => windowInstance);
  Object.assign(BrowserWindowMock, {
    getAllWindows: vi.fn().mockReturnValue([]),
  });

  return {
    app: {
      isPackaged: false,
      whenReady: vi.fn().mockImplementation(() => {
        readyPromise = new Promise((resolve) => {
          readyPromiseResolver = resolve;
        });
        return readyPromise;
      }),
      on: vi.fn((event: string, callback: () => void) => {
        mockAppListeners[event] = callback;
      }),
      quit: vi.fn(),
    },
    BrowserWindow: BrowserWindowMock,
  };
});

/**
 * Electronメインプロセスのテストスイート
 */
describe("main process", () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowListeners = {};
    mockAppListeners = {};
    // すでに開いているウィンドウが存在しないクリーンな状態をデフォルトとする
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);
  });

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  /**
   * 開発環境時はlocalhostのViteサーバーを読み込むことを確認する
   */
  it("should create window in development mode loading localhost", async () => {
    Object.defineProperty(app, "isPackaged", {
      value: false,
      configurable: true,
    });

    await import("./main.js");

    // app.whenReady() のプロミスを解決し、createWindowを実行させる
    readyPromiseResolver();
    await readyPromise;

    expect(BrowserWindow).toHaveBeenCalledTimes(1);
    const mockWindowInst = vi.mocked(BrowserWindow).mock.results[0]?.value;
    expect(mockWindowInst.loadURL).toHaveBeenCalledWith(
      "http://localhost:3000"
    );
    expect(mockWindowInst.loadFile).not.toHaveBeenCalled();

    // windowのcloseイベントハンドラが登録されることを確認する
    expect(mockWindowListeners["closed"]).toBeDefined();
    mockWindowListeners["closed"]?.(); // null代入カバレッジを満たす
  });

  /**
   * 本番環境時はビルド済みのindex.htmlを読み込むことを確認する
   */
  it("should create window in production mode loading index.html", async () => {
    Object.defineProperty(app, "isPackaged", {
      value: true,
      configurable: true,
    });

    await import("./main.js");

    readyPromiseResolver();
    await readyPromise;

    expect(BrowserWindow).toHaveBeenCalledTimes(1);
    const mockWindowInst = vi.mocked(BrowserWindow).mock.results[0]?.value;
    expect(mockWindowInst.loadFile).toHaveBeenCalledWith(
      expect.stringContaining("renderer/index.html")
    );
    expect(mockWindowInst.loadURL).not.toHaveBeenCalled();
  });

  /**
   * アプリがアクティブになった際、ウィンドウが存在しなければ新しくウィンドウを作成することを確認する
   */
  it("should create window when activated and none exist", async () => {
    await import("./main.js");

    readyPromiseResolver();
    await readyPromise;

    expect(BrowserWindow).toHaveBeenCalledTimes(1);

    // ウィンドウがない状態でactivateイベントを発火
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);
    mockAppListeners["activate"]?.();

    // 新しくウィンドウが作成されるため呼び出し回数が増える
    expect(BrowserWindow).toHaveBeenCalledTimes(2);
  });

  /**
   * アプリがアクティブになった際、すでにウィンドウがあれば新しく作成しないことを確認する
   */
  it("should not create window when activated and windows exist", async () => {
    await import("./main.js");

    readyPromiseResolver();
    await readyPromise;

    expect(BrowserWindow).toHaveBeenCalledTimes(1);

    // ウィンドウがある状態でactivateイベントを発火
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      {} as unknown as BrowserWindow,
    ]);
    mockAppListeners["activate"]?.();

    // ウィンドウ作成は呼ばれないため呼び出し回数はそのまま
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
  });

  /**
   * darwin以外（Windows等）では全ウィンドウが閉じられた際にアプリが終了することを確認する
   */
  it("should quit on window-all-closed if not darwin", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
      configurable: true,
    });
    await import("./main.js");

    mockAppListeners["window-all-closed"]?.();

    expect(app.quit).toHaveBeenCalled();
  });

  /**
   * darwin（macOS）では全ウィンドウが閉じられてもアプリを終了しないことを確認する
   */
  it("should not quit on window-all-closed if darwin", async () => {
    Object.defineProperty(process, "platform", {
      value: "darwin",
      configurable: true,
    });
    await import("./main.js");

    mockAppListeners["window-all-closed"]?.();

    expect(app.quit).not.toHaveBeenCalled();
  });
});
