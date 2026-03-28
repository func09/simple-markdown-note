import { renderHook, act } from '@testing-library/react';
import { useNoteActions } from './useNoteActions';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useNotesQuery from '@/features/notes/hooks/useNotesQuery';
import { useNoteStore } from '@/features/notes/store';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/features/notes/hooks/useNotesQuery');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const setupMockStore = (initialState = {}) => {
  useNoteStore.setState({
    selectedNoteId: null,
    selectedTag: null,
    isTrashSelected: false,
    ...initialState,
  });
};

describe('useNoteActions', () => {
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
    const { result } = renderHook(() => useNoteActions());

    await act(async () => {
      await result.current.handleCreateNote();
    });

    const storeState = useNoteStore.getState();
    expect(storeState.selectedNoteId).toBe('new-note-1');
    expect(storeState.activeView).toBe('editor');
    expect(toast.success).toHaveBeenCalledWith('Note created');
  });

  it('handleDeleteClick should open delete modal', () => {
    const { result } = renderHook(() => useNoteActions());

    act(() => {
      result.current.handleDeleteClick('note-to-del');
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.noteToDelete).toBe('note-to-del');
  });

  it('confirmDeleteNote should call delete endpoint and close modal', async () => {
    const mockDelete = vi.fn().mockResolvedValue({});
    vi.mocked(useNotesQuery.useDeleteNote).mockReturnValue({ mutateAsync: mockDelete } as any);

    const { result } = renderHook(() => useNoteActions());

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

    const { result } = renderHook(() => useNoteActions());

    await act(async () => {
      await result.current.handleEmptyTrash();
    });

    expect(mockEmpty).toHaveBeenCalled();
    const storeState = useNoteStore.getState();
    expect(storeState.selectedNoteId).toBe(null);
    expect(storeState.activeView).toBe('list');
    expect(toast.success).toHaveBeenCalledWith('Trash emptied');
  });
});
