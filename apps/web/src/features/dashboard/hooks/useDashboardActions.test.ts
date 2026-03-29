import { renderHook, act } from '@testing-library/react';
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useNotesQuery from '@/features/notes/hooks';
import { useNoteStore } from '@/features/notes/store';
import { useDashboardStore } from '@/features/dashboard/store';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/features/notes/hooks');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const setupMockStore = (initialState: any = {}) => {
  useNoteStore.setState({
    selectedNoteId: initialState.selectedNoteId ?? null,
  });
  useDashboardStore.setState({
    selectedTag: initialState.selectedTag ?? null,
    isTrashSelected: initialState.isTrashSelected ?? false,
    activeView: initialState.activeView ?? 'list',
  });
};

describe('useDashboardActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStore();

    // Default mocks for queries
    vi.mocked(useNotesQuery.useCreateNote).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'new-note-1', content: '' }),
    } as any);

    vi.mocked(useNotesQuery.useDeleteNote).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(useNotesQuery.usePermanentDeleteNote).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(useNotesQuery.useEmptyTrash).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  it('handleCreateNote should create a note, select it, and show success toast', async () => {
    const { result } = renderHook(() => useDashboardActions());

    await act(async () => {
      await result.current.handleCreateNote();
    });

    const storeState = useNoteStore.getState();
    const dashboardState = useDashboardStore.getState();
    expect(storeState.selectedNoteId).toBe('new-note-1');
    expect(dashboardState.activeView).toBe('editor');
    expect(toast.success).toHaveBeenCalledWith('Note created');
  });

  it('handleDeleteClick should open delete modal', () => {
    const { result } = renderHook(() => useDashboardActions());

    act(() => {
      result.current.handleDeleteClick('note-to-del');
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.noteToDelete).toBe('note-to-del');
  });

  it('confirmDeleteNote should call delete endpoint and close modal', async () => {
    const mockDelete = vi.fn().mockResolvedValue({});
    vi.mocked(useNotesQuery.useDeleteNote).mockReturnValue({ mutateAsync: mockDelete } as any);

    const { result } = renderHook(() => useDashboardActions());

    // 1. Open modal
    act(() => {
      result.current.handleDeleteClick('note-to-del');
    });

    // 2. Confirm
    await act(async () => {
      await result.current.confirmDeleteNote();
    });

    expect(mockDelete).toHaveBeenCalledWith('note-to-del');
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.noteToDelete).toBe(null);
    expect(toast.success).toHaveBeenCalledWith('Note moved to trash');
  });

  it('handleEmptyTrash should empty trash, reset selection, and show toast', async () => {
    const mockEmpty = vi.fn().mockResolvedValue({});
    vi.mocked(useNotesQuery.useEmptyTrash).mockReturnValue({ mutateAsync: mockEmpty } as any);
    setupMockStore({ selectedNoteId: 'trash-note' });

    const { result } = renderHook(() => useDashboardActions());

    await act(async () => {
      await result.current.handleEmptyTrash();
    });

    expect(mockEmpty).toHaveBeenCalled();
    const storeState = useNoteStore.getState();
    const dashboardState = useDashboardStore.getState();
    expect(storeState.selectedNoteId).toBe(null);
    expect(dashboardState.activeView).toBe('list');
    expect(toast.success).toHaveBeenCalledWith('Trash emptied');
  });
});
