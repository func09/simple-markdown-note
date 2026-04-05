import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  usePermanentDelete,
  useRestoreNote,
  useTags,
  useUpdateNote,
} from "@simple-markdown-note/api-client/hooks";
import { act, renderHook } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useNoteDrawerScreen,
  useNoteEditorScreen,
  useNoteListScreen,
} from "./useNoteScreen";

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
// useNoteListScreen
// ---------------------------------------------------------------------------

describe("useNoteListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ scope: "all" });
    (useNotes as jest.Mock).mockReturnValue({
      data: [mockNote],
      isLoading: false,
      refetch: jest.fn(),
    });
    (useTags as jest.Mock).mockReturnValue({
      data: [{ name: "tag1" }],
    });
  });

  it("returns notes from resource layer", () => {
    const { result } = renderHook(() => useNoteListScreen());
    expect(result.current.notes).toHaveLength(1);
  });

  it("filters notes by searchQuery", () => {
    (useNotes as jest.Mock).mockReturnValue({
      data: [
        { ...mockNote, content: "hello world" },
        { ...mockNote, id: "2", content: "goodbye" },
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
    (useTags as jest.Mock).mockReturnValue({ data: [] });
    const { result } = renderHook(() => useNoteListScreen());
    act(() => {
      result.current.setSearchQuery("hello");
    });
    expect(result.current.notes).toHaveLength(1);
  });

  it("handleNewNote navigates to new note screen", () => {
    const { result } = renderHook(() => useNoteListScreen());
    act(() => {
      result.current.handleNewNote();
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/(main)/notes/new");
  });

  it("handleSelectNote navigates to the note's screen", () => {
    const { result } = renderHook(() => useNoteListScreen());
    act(() => {
      result.current.handleSelectNote("note-1");
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/(main)/notes/note-1");
  });

  it("getHeaderTitle returns 'All Notes' for default scope", () => {
    const { result } = renderHook(() => useNoteListScreen());
    expect(result.current.getHeaderTitle()).toBe("All Notes");
  });

  it("getHeaderTitle returns 'Trash' for trash scope", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ scope: "trash" });
    const { result } = renderHook(() => useNoteListScreen());
    expect(result.current.getHeaderTitle()).toBe("Trash");
  });

  it("getHeaderTitle returns tag name when tag is active", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      scope: "all",
      tag: "work",
    });
    const { result } = renderHook(() => useNoteListScreen());
    expect(result.current.getHeaderTitle()).toBe("work");
  });
});

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
