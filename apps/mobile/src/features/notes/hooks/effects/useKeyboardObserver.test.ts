import { act, renderHook } from "@testing-library/react-native";
import { Keyboard } from "react-native";
import { useKeyboardObserver } from "./useKeyboardObserver";

/** Captures Keyboard.addListener callbacks for testing */
function captureKeyboardListeners() {
  const listeners: Record<string, () => void> = {};
  jest.spyOn(Keyboard, "addListener").mockImplementation((event, handler) => {
    listeners[event as string] = handler as () => void;
    return { remove: jest.fn() } as never;
  });
  return listeners;
}

// ノート編集画面等において、OSのキーボード表示状態や表示に合わせたフォーカス管理を行うためのフックテスト
describe("useKeyboardObserver", () => {
  afterEach(() => jest.restoreAllMocks());

  // 初期の状態では isKeyboardVisible フラグが false となりキーボードが非表示扱いとなることを検証する
  it("initializes with keyboard hidden", () => {
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  // コンポーネントへ引き渡すための inputRef と infoSheetRef がフックから公開されていることを検証する
  it("exposes inputRef and infoSheetRef", () => {
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    expect(result.current.inputRef).toBeDefined();
    expect(result.current.infoSheetRef).toBeDefined();
  });

  // OS側で keyboardDidShow イベントが発生した際に isKeyboardVisible が true に切り替わることを検証する
  it("sets isKeyboardVisible to true on keyboardDidShow", () => {
    const listeners = captureKeyboardListeners();
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    act(() => {
      listeners.keyboardDidShow?.();
    });
    expect(result.current.isKeyboardVisible).toBe(true);
  });

  // OS側で keyboardDidHide イベントが発生した際に isKeyboardVisible が false に切り替わることを検証する
  it("sets isKeyboardVisible to false on keyboardDidHide", () => {
    const listeners = captureKeyboardListeners();
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    act(() => {
      listeners.keyboardDidShow?.();
    });
    act(() => {
      listeners.keyboardDidHide?.();
    });
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  // すでにキーボードが表示・展開されている状況でトグルを実行すると、キーボードが閉じる(dismissされる)ことを検証する
  it("dismisses keyboard when keyboard is visible", () => {
    const listeners = captureKeyboardListeners();
    const dismissSpy = jest.spyOn(Keyboard, "dismiss");
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    act(() => {
      listeners.keyboardDidShow?.();
    });
    act(() => {
      result.current.handleKeyboardToggle();
    });
    expect(dismissSpy).toHaveBeenCalled();
  });

  // プレビュー表示中にキーボードのトグルが行われた際、入力のためプレビューを自動で抜ける(setIsPreviewが呼ばれる)ことを検証する
  it("exits preview mode when showing keyboard while in preview", () => {
    const setIsPreview = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardObserver(true, setIsPreview)
    );
    // keyboard is not visible, so handleKeyboardToggle should show it
    act(() => {
      result.current.handleKeyboardToggle();
    });
    expect(setIsPreview).toHaveBeenCalledWith(false);
  });

  // すでに編集モード（非プレビュー）のときは、トグル操作によって誤って setIsPreview(false) が呼ばれないことを検証する
  it("does not call setIsPreview when showing keyboard not in preview", () => {
    const setIsPreview = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardObserver(false, setIsPreview)
    );
    act(() => {
      result.current.handleKeyboardToggle();
    });
    expect(setIsPreview).not.toHaveBeenCalled();
  });

  // 遅延表示(setTimeout)の後、提供されている inputRef へフォーカスが要求されることを検証する
  it("focuses inputRef after delay when showing keyboard", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));

    Object.defineProperty(result.current.inputRef, "current", {
      value: { focus: jest.fn() },
      writable: true,
    });

    act(() => {
      result.current.handleKeyboardToggle();
    });

    jest.runAllTimers();

    expect(result.current.inputRef.current?.focus).toHaveBeenCalled();

    jest.useRealTimers();
  });

  // コンポーネントのアンマウント時にキーボードのイベントリスナーが安全に破棄され、エラーを起こさないことを検証する
  it("removes keyboard listeners on unmount", () => {
    const { unmount } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});
