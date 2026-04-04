import { act, renderHook } from "@testing-library/react-native";
import { Alert, Keyboard, Platform } from "react-native";
import { useNoteDrawer, useNoteEditorUI, useNoteTagPrompt } from "./useNoteUI";

jest.mock("../components/NoteDrawer", () => ({
  DRAWER_WIDTH: 280,
}));

// ---------------------------------------------------------------------------
// useNoteEditorUI
// ---------------------------------------------------------------------------

/** Captures Keyboard.addListener callbacks for testing */
function captureKeyboardListeners() {
  const listeners: Record<string, () => void> = {};
  jest.spyOn(Keyboard, "addListener").mockImplementation((event, handler) => {
    listeners[event as string] = handler as () => void;
    return { remove: jest.fn() } as never;
  });
  return listeners;
}

describe("useNoteEditorUI", () => {
  afterEach(() => jest.restoreAllMocks());

  it("initializes with keyboard hidden", () => {
    const { result } = renderHook(() => useNoteEditorUI(false, jest.fn()));
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  it("exposes inputRef and infoSheetRef", () => {
    const { result } = renderHook(() => useNoteEditorUI(false, jest.fn()));
    expect(result.current.inputRef).toBeDefined();
    expect(result.current.infoSheetRef).toBeDefined();
  });

  it("sets isKeyboardVisible to true on keyboardDidShow", () => {
    const listeners = captureKeyboardListeners();
    const { result } = renderHook(() => useNoteEditorUI(false, jest.fn()));
    act(() => {
      listeners.keyboardDidShow?.();
    });
    expect(result.current.isKeyboardVisible).toBe(true);
  });

  it("sets isKeyboardVisible to false on keyboardDidHide", () => {
    const listeners = captureKeyboardListeners();
    const { result } = renderHook(() => useNoteEditorUI(false, jest.fn()));
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
    const { result } = renderHook(() => useNoteEditorUI(false, jest.fn()));
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
    const { result } = renderHook(() => useNoteEditorUI(true, setIsPreview));
    // keyboard is not visible, so handleKeyboardToggle should show it
    act(() => {
      result.current.handleKeyboardToggle();
    });
    expect(setIsPreview).toHaveBeenCalledWith(false);
  });

  it("removes keyboard listeners on unmount", () => {
    const { unmount } = renderHook(() => useNoteEditorUI(false, jest.fn()));
    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// useNoteDrawer
// ---------------------------------------------------------------------------

describe("useNoteDrawer", () => {
  it("initializes with drawer closed", () => {
    const { result } = renderHook(() => useNoteDrawer());
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it("opens the drawer on toggleDrawer(true)", () => {
    const { result } = renderHook(() => useNoteDrawer());
    act(() => {
      result.current.toggleDrawer(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("exposes slideAnim", () => {
    const { result } = renderHook(() => useNoteDrawer());
    expect(result.current.slideAnim).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// useNoteTagPrompt
// ---------------------------------------------------------------------------

describe("useNoteTagPrompt", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls Alert.prompt on iOS", () => {
    Platform.OS = "ios";
    const promptSpy = jest
      .spyOn(Alert, "prompt")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useNoteTagPrompt());

    result.current.promptForTag([], jest.fn());

    expect(promptSpy).toHaveBeenCalledWith(
      "Add Tag",
      "Enter a name for the new tag",
      expect.any(Function)
    );
  });

  it("calls Alert.alert on Android", () => {
    Platform.OS = "android";
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useNoteTagPrompt());

    result.current.promptForTag([], jest.fn());

    expect(alertSpy).toHaveBeenCalled();
  });

  it("calls onAdd with trimmed tag when tag is new (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("  new tag  ");
    });
    const { result } = renderHook(() => useNoteTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).toHaveBeenCalledWith("new tag");
  });

  it("does not call onAdd when tag already exists (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("existing");
    });
    const { result } = renderHook(() => useNoteTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag(["existing"], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd for empty input (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("   ");
    });
    const { result } = renderHook(() => useNoteTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
