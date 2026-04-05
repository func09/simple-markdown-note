import {
  useCreateNote,
  useDeleteNote,
  useNote,
  usePermanentDelete,
  useRestoreNote,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import type { Note } from "@simple-markdown-note/common/schemas";
import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  calcNoteMetrics,
  filterNotes,
  toggleCheckboxInContent,
} from "../utils";
import { useNoteDrawerScreen, useNoteEditorScreen } from "./useNoteScreen";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@simple-markdown-note/api-client/hooks", () => ({
  useNote: jest.fn(),
  useNotes: jest.fn(),
  useTags: jest.fn(),
  useCreateNote: jest.fn(),
  useUpdateNote: jest.fn(),
  useDeleteNote: jest.fn(),
  useRestoreNote: jest.fn(),
  usePermanentDelete: jest.fn(),
  useLogout: jest.fn(),
}));

jest.mock("../constants", () => {
  const actual = jest.requireActual("../constants");
  return {
    ...actual,
    DRAWER_WIDTH: 280,
  };
});

jest.mock("../../auth/store", () => ({
  useAuthStore: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
};

const mockNote = {
  id: "note-1",
  content: "Title\nBody",
  userId: "user-1",
  tags: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
  isPermanent: false,
};

const mockMutations = {
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  restoreNote: jest.fn(),
  permanentDelete: jest.fn(),
};

// ---------------------------------------------------------------------------
// useNoteEditorScreen
// ---------------------------------------------------------------------------

describe("useNoteEditorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "note-1" });
    (useNote as jest.Mock).mockReturnValue({
      data: mockNote,
      isLoading: false,
    });
    (useCreateNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutations.createNote,
    });
    (useUpdateNote as jest.Mock).mockReturnValue({
      mutate: mockMutations.updateNote,
    });
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutations.deleteNote,
    });
    (useRestoreNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutations.restoreNote,
    });
    (usePermanentDelete as jest.Mock).mockReturnValue({
      mutateAsync: mockMutations.permanentDelete,
    });
  });

  it("returns expected shape", () => {
    const { result } = renderHook(() => useNoteEditorScreen());
    expect(result.current.content).toBeDefined();
    expect(result.current.tags).toBeDefined();
    expect(result.current.metrics).toBeDefined();
    expect(result.current.ui).toBeDefined();
    expect(result.current.ops).toBeDefined();
  });

  it("isNew is false for existing note id", () => {
    const { result } = renderHook(() => useNoteEditorScreen());
    expect(result.current.isNew).toBe(false);
  });

  it("isNew is true when id is 'new'", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "new" });
    (useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    const { result } = renderHook(() => useNoteEditorScreen());
    expect(result.current.isNew).toBe(true);
  });

  it("handleRemoveTag removes the specified tag", () => {
    (useNote as jest.Mock).mockReturnValue({
      data: {
        ...mockNote,
        tags: [
          {
            id: "t1",
            name: "tag1",
            userId: "user-1",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
          {
            id: "t2",
            name: "tag2",
            userId: "user-1",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
    });
    const { result } = renderHook(() => useNoteEditorScreen());
    act(() => {
      result.current.ops.handleRemoveTag("tag1");
    });
    expect(result.current.tags).not.toContain("tag1");
    expect(result.current.tags).toContain("tag2");
  });

  it("handleCheckboxToggle updates content", () => {
    (useNote as jest.Mock).mockReturnValue({
      data: { ...mockNote, content: "- [ ] task" },
      isLoading: false,
    });
    const { result } = renderHook(() => useNoteEditorScreen());
    act(() => {
      result.current.ops.handleCheckboxToggle(0);
    });
    expect(result.current.content).toContain("[x]");
  });
});

// ---------------------------------------------------------------------------
// useNoteDrawerScreen
// ---------------------------------------------------------------------------

describe("useNoteDrawerScreen", () => {
  const { useLogout } = jest.requireMock(
    "@simple-markdown-note/api-client/hooks"
  );
  const { useAuthStore } = jest.requireMock("../../auth/store");

  beforeEach(() => {
    jest.clearAllMocks();
    const mockMutate = jest.fn();
    (useLogout as jest.Mock).mockReturnValue({ mutate: mockMutate });
    (useAuthStore as jest.Mock).mockImplementation((selector: unknown) =>
      (selector as (s: { clearAuth: () => void }) => unknown)({
        clearAuth: jest.fn(),
      })
    );
  });

  it("handleLogout calls logoutMutation.mutate", () => {
    const mockMutate = jest.fn();
    (useLogout as jest.Mock).mockReturnValue({ mutate: mockMutate });

    const onClose = jest.fn();
    const { result } = renderHook(() => useNoteDrawerScreen(onClose));
    act(() => {
      result.current.handleLogout();
    });

    expect(mockMutate).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// calcNoteMetrics
// ---------------------------------------------------------------------------

describe("calcNoteMetrics", () => {
  it("counts words correctly", () => {
    const result = calcNoteMetrics("hello world foo");
    expect(result.wordCount).toBe(3);
  });

  it("returns 0 word count for empty string", () => {
    const result = calcNoteMetrics("");
    expect(result.wordCount).toBe(0);
  });

  it("counts characters", () => {
    const result = calcNoteMetrics("abc");
    expect(result.charCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// filterNotes
// ---------------------------------------------------------------------------

describe("filterNotes", () => {
  const notes = [
    { ...mockNote, id: "1", content: "hello world" } as unknown as Note,
    { ...mockNote, id: "2", content: "goodbye world" } as unknown as Note,
    { ...mockNote, id: "3", content: "foo bar" } as unknown as Note,
  ];

  it("returns all notes when query is empty", () => {
    const result = filterNotes(notes, "");
    expect(result).toHaveLength(3);
  });

  it("filters by content (case insensitive)", () => {
    const result = filterNotes(notes, "HELLO");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty when no match", () => {
    const result = filterNotes(notes, "zzz");
    expect(result).toHaveLength(0);
  });

  it("matches partial strings", () => {
    const result = filterNotes(notes, "world");
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// toggleCheckboxInContent
// ---------------------------------------------------------------------------

describe("toggleCheckboxInContent", () => {
  it("toggles unchecked checkbox to checked", () => {
    const toggled = toggleCheckboxInContent(
      "- [ ] task one\n- [ ] task two",
      0
    );
    expect(toggled).toContain("- [x] task one");
    expect(toggled).toContain("- [ ] task two");
  });

  it("toggles checked checkbox to unchecked", () => {
    const toggled = toggleCheckboxInContent("- [x] done", 0);
    expect(toggled).toContain("- [ ] done");
  });

  it("only toggles the checkbox at the specified index", () => {
    const content = "- [ ] first\n- [ ] second\n- [ ] third";
    const toggled = toggleCheckboxInContent(content, 1);
    expect(toggled).toContain("- [ ] first");
    expect(toggled).toContain("- [x] second");
    expect(toggled).toContain("- [ ] third");
  });
});
