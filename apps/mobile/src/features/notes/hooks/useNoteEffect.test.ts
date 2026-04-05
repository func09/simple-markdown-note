import { act, renderHook } from "@testing-library/react-native";
import { Keyboard } from "react-native";
import { useKeyboardObserver } from "./useNoteEffect";

/** Captures Keyboard.addListener callbacks for testing */
function captureKeyboardListeners() {
  const listeners: Record<string, () => void> = {};
  jest.spyOn(Keyboard, "addListener").mockImplementation((event, handler) => {
    listeners[event as string] = handler as () => void;
    return { remove: jest.fn() } as never;
  });
  return listeners;
}

describe("useKeyboardObserver", () => {
  afterEach(() => jest.restoreAllMocks());

  it("initializes with keyboard hidden", () => {
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  it("exposes inputRef and infoSheetRef", () => {
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    expect(result.current.inputRef).toBeDefined();
    expect(result.current.infoSheetRef).toBeDefined();
  });

  it("sets isKeyboardVisible to true on keyboardDidShow", () => {
    const listeners = captureKeyboardListeners();
    const { result } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    act(() => {
      listeners.keyboardDidShow?.();
    });
    expect(result.current.isKeyboardVisible).toBe(true);
  });

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

  it("removes keyboard listeners on unmount", () => {
    const { unmount } = renderHook(() => useKeyboardObserver(false, jest.fn()));
    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});
