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
import { renderHook } from "@testing-library/react-native";
import {
  useNoteDetailQuery,
  useNoteListQuery,
  useNoteMutations,
} from "./useNoteResource";

jest.mock("@simple-markdown-note/api-client/hooks", () => ({
  useNotes: jest.fn(),
  useTags: jest.fn(),
  useNote: jest.fn(),
  useCreateNote: jest.fn(),
  useUpdateNote: jest.fn(),
  useDeleteNote: jest.fn(),
  useRestoreNote: jest.fn(),
  usePermanentDelete: jest.fn(),
}));

const mockNote = {
  id: "1",
  content: "Test",
  userId: "user-1",
  tags: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  deletedAt: null,
  isPermanent: false,
};

// ---------------------------------------------------------------------------
// useNoteListQuery
// ---------------------------------------------------------------------------

describe("useNoteListQuery", () => {
  beforeEach(() => {
    (useNotes as jest.Mock).mockReturnValue({
      data: [mockNote],
      isLoading: false,
      refetch: jest.fn(),
    });
    (useTags as jest.Mock).mockReturnValue({
      data: [
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
    });
  });

  it("returns notes and tag names", () => {
    const { result } = renderHook(() => useNoteListQuery("all", undefined));
    expect(result.current.notes).toEqual([mockNote]);
    expect(result.current.tags).toEqual(["tag1", "tag2"]);
    expect(result.current.isNotesLoading).toBe(false);
  });

  it("defaults to empty arrays when data is undefined", () => {
    (useNotes as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });
    (useTags as jest.Mock).mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useNoteListQuery("all", undefined));
    expect(result.current.notes).toEqual([]);
    expect(result.current.tags).toEqual([]);
    expect(result.current.isNotesLoading).toBe(true);
  });

  it("exposes refetchNotes", () => {
    const { result } = renderHook(() => useNoteListQuery("all", undefined));
    expect(typeof result.current.refetchNotes).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// useNoteDetailQuery
// ---------------------------------------------------------------------------

describe("useNoteDetailQuery", () => {
  it("returns note and isLoading false", () => {
    (useNote as jest.Mock).mockReturnValue({
      data: mockNote,
      isLoading: false,
    });
    const { result } = renderHook(() => useNoteDetailQuery("1"));
    expect(result.current.note).toEqual(mockNote);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns undefined note while loading", () => {
    (useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { result } = renderHook(() => useNoteDetailQuery(null));
    expect(result.current.note).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useNoteMutations
// ---------------------------------------------------------------------------

describe("useNoteMutations", () => {
  const mockMutateAsync = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    (useCreateNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (useUpdateNote as jest.Mock).mockReturnValue({ mutate: mockMutate });
    (useDeleteNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (useRestoreNote as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (usePermanentDelete as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  it("exposes all mutation functions", () => {
    const { result } = renderHook(() => useNoteMutations());
    expect(typeof result.current.createNote).toBe("function");
    expect(typeof result.current.updateNote).toBe("function");
    expect(typeof result.current.deleteNote).toBe("function");
    expect(typeof result.current.restoreNote).toBe("function");
    expect(typeof result.current.permanentDelete).toBe("function");
  });

  it("createNote delegates to mutateAsync", async () => {
    mockMutateAsync.mockResolvedValue({ id: "new-id" });
    const { result } = renderHook(() => useNoteMutations());
    await result.current.createNote({
      content: "hello",
      tags: [],
      isPermanent: false,
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      content: "hello",
      tags: [],
      isPermanent: false,
    });
  });
});
