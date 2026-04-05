import { act, renderHook } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { useDrawerState, useTagPrompt } from "./useNoteState";

jest.mock("../constants", () => {
  const actual = jest.requireActual("../constants");
  return {
    ...actual,
    DRAWER_WIDTH: 280,
  };
});

describe("useDrawerState", () => {
  it("initializes with drawer closed", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.isDrawerOpen).toBe(false);
  });

  it("opens the drawer on toggleDrawer(true)", () => {
    const { result } = renderHook(() => useDrawerState());
    act(() => {
      result.current.toggleDrawer(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("exposes slideAnim", () => {
    const { result } = renderHook(() => useDrawerState());
    expect(result.current.slideAnim).toBeDefined();
  });
});

describe("useTagPrompt", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls Alert.prompt on iOS", () => {
    Platform.OS = "ios";
    const promptSpy = jest
      .spyOn(Alert, "prompt")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useTagPrompt());

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
    const { result } = renderHook(() => useTagPrompt());

    result.current.promptForTag([], jest.fn());

    expect(alertSpy).toHaveBeenCalled();
  });

  it("calls onAdd with trimmed tag when tag is new (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("  new tag  ");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).toHaveBeenCalledWith("new tag");
  });

  it("does not call onAdd when tag already exists (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("existing");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag(["existing"], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd for empty input (iOS)", () => {
    Platform.OS = "ios";
    jest.spyOn(Alert, "prompt").mockImplementation((_title, _msg, callback) => {
      (callback as (text: string) => void)("   ");
    });
    const { result } = renderHook(() => useTagPrompt());
    const onAdd = jest.fn();

    result.current.promptForTag([], onAdd);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
