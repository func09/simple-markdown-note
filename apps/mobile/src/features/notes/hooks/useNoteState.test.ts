import type { Note } from "@simple-markdown-note/common/schemas";
import { act, renderHook } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { useDrawerState, useNoteItemState, useTagPrompt } from "./useNoteState";

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

// ---------------------------------------------------------------------------
// useNoteItemState
// ---------------------------------------------------------------------------

const makeNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    content: "Title\nBody text",
    userId: "user-1",
    updatedAt: "2024-06-15T00:00:00.000Z",
    createdAt: "2024-06-15T00:00:00.000Z",
    tags: [],
    deletedAt: null,
    isPermanent: false,
    ...overrides,
  }) as Note;

describe("useNoteItemState", () => {
  it("extracts title from first line", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "My Title\nBody" }))
    );
    expect(result.current.title).toBe("My Title");
  });

  it("falls back to 'New Note' when content is empty", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "" }))
    );
    expect(result.current.title).toBe("New Note");
  });

  it("extracts summary from remaining lines", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ content: "Title\nLine 2\nLine 3" }))
    );
    expect(result.current.summary).toBe("Line 2 Line 3");
  });

  it("formats the date as a non-empty string", () => {
    const { result } = renderHook(() =>
      useNoteItemState(makeNote({ updatedAt: "2024-06-15T00:00:00.000Z" }))
    );
    expect(typeof result.current.formattedDate).toBe("string");
    expect(result.current.formattedDate.length).toBeGreaterThan(0);
  });
});
