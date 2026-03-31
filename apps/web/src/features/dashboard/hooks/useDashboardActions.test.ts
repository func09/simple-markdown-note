import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardActions } from "@/features/dashboard/hooks/useDashboardActions";
import { useDashboardStore } from "@/features/dashboard/stores";
import * as useNotesQuery from "@/features/notes/hooks";
import { useNoteStore } from "@/features/notes/stores";

// Mock dependencies
vi.mock("../features/notes/hooks");
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const setupMockStore = (
  initialState: {
    selectedNoteId?: string | null;
    selectedTag?: string | null;
    isTrashSelected?: boolean;
    activeView?: "list" | "editor";
  } = {}
) => {
  useNoteStore.setState({
    selectedNoteId: initialState.selectedNoteId ?? null,
  });
  useDashboardStore.setState({
    selectedTag: initialState.selectedTag ?? null,
    isTrashSelected: initialState.isTrashSelected ?? false,
    activeView: initialState.activeView ?? "list",
  });
};

describe("useDashboardActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStore();

    // Default mocks for queries
    vi.mocked(useNotesQuery.useCreateNote).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: "new-note-1", content: "" }),
    } as unknown as ReturnType<typeof useNotesQuery.useCreateNote>);

    vi.mocked(useNotesQuery.useDeleteNote).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useNotesQuery.useDeleteNote>);

    vi.mocked(useNotesQuery.usePermanentDeleteNote).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useNotesQuery.usePermanentDeleteNote>);

    vi.mocked(useNotesQuery.useEmptyTrash).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useNotesQuery.useEmptyTrash>);
  });

  it("handleCreateNote should create a note, select it, and show success toast", async () => {
    const { result } = renderHook(() => useDashboardActions());

    await act(async () => {
      await result.current.handleCreateNote();
    });

    const storeState = useNoteStore.getState();
    const dashboardState = useDashboardStore.getState();
    expect(storeState.selectedNoteId).toBe("new-note-1");
    expect(dashboardState.activeView).toBe("editor");
    expect(toast.success).toHaveBeenCalledWith("Note created");
  });

  it("handleDeleteClick should open delete modal", () => {
    const { result } = renderHook(() => useDashboardActions());

    act(() => {
      result.current.handleDeleteClick("note-to-del");
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.noteToDelete).toBe("note-to-del");
  });

  it("confirmDeleteNote should call delete endpoint and close modal", async () => {
    const mockDelete = vi.fn().mockResolvedValue({});
    vi.mocked(useNotesQuery.useDeleteNote).mockReturnValue({
      mutateAsync: mockDelete,
    } as unknown as ReturnType<typeof useNotesQuery.useDeleteNote>);

    const { result } = renderHook(() => useDashboardActions());

    // 1. Open modal
    act(() => {
      result.current.handleDeleteClick("note-to-del");
    });

    // 2. Confirm
    await act(async () => {
      await result.current.confirmDeleteNote();
    });

    expect(mockDelete).toHaveBeenCalledWith("note-to-del");
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.noteToDelete).toBe(null);
    expect(toast.success).toHaveBeenCalledWith("Note moved to trash");
  });

  it("handleEmptyTrash should empty trash, reset selection, and show toast", async () => {
    const mockEmpty = vi.fn().mockResolvedValue({});
    vi.mocked(useNotesQuery.useEmptyTrash).mockReturnValue({
      mutateAsync: mockEmpty,
    } as unknown as ReturnType<typeof useNotesQuery.useEmptyTrash>);
    setupMockStore({ selectedNoteId: "trash-note" });

    const { result } = renderHook(() => useDashboardActions());

    await act(async () => {
      await result.current.handleEmptyTrash();
    });

    expect(mockEmpty).toHaveBeenCalled();
    const storeState = useNoteStore.getState();
    const dashboardState = useDashboardStore.getState();
    expect(storeState.selectedNoteId).toBe(null);
    expect(dashboardState.activeView).toBe("list");
    expect(toast.success).toHaveBeenCalledWith("Trash emptied");
  });
});
