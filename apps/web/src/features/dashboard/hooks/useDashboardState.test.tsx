import { renderHook, act } from '@testing-library/react';
import { useDashboardState } from '@/features/dashboard/hooks/useDashboardState';
import { useDashboardStore } from '@/features/dashboard/store';
import { useNoteStore } from '@/features/notes/store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dexieHooks from 'dexie-react-hooks';
import * as hooks from '@/features/notes/hooks';
import * as useDashboardActionsHook from '@/features/dashboard/hooks/useDashboardActions';

vi.mock('dexie-react-hooks');
vi.mock('@/features/notes/hooks');
vi.mock('./useDashboardActions');

const setupStores = (dashboardState: any = {}, noteState: any = {}) => {
  useDashboardStore.setState({
    searchQuery: '',
    selectedTag: null,
    isTrashSelected: false,
    activeView: 'list',
    isSidebarOpen: false,
    ...dashboardState,
  });
  useNoteStore.setState({
    selectedNoteId: null,
    ...noteState,
  });
};

describe('useDashboardState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();

    vi.mocked(dexieHooks.useLiveQuery).mockReturnValue([
      { id: '1', content: 'note 1', deletedAt: null },
      { id: '2', content: 'note 2', deletedAt: null },
      { id: 'trash-1', content: 'trash 1', deletedAt: '2023-01-01' },
    ]);

    vi.mocked(hooks.useSync).mockReturnValue({ isLoading: false } as any);

    vi.mocked(hooks.useOramaSearch).mockReturnValue({
      filteredNotes: [{ id: '1', content: 'note 1', deletedAt: null } as any],
      searchNotes: vi.fn().mockReturnValue([{ id: '1', content: 'note 1', deletedAt: null }]),
      oramaDb: {} as any,
    });

    vi.mocked(useDashboardActionsHook.useDashboardActions).mockReturnValue({
      isDeleteModalOpen: false,
      setIsDeleteModalOpen: vi.fn(),
      noteToDelete: null,
      handleCreateNote: vi.fn(),
      handleDeleteClick: vi.fn(),
      confirmDeleteNote: vi.fn(),
      handleCancelDelete: vi.fn(),
      handleEmptyTrash: vi.fn(),
    } as any);
  });

  it('selects correct notes and delegates to oramaSearch based on isTrashSelected', () => {
    setupStores({ isTrashSelected: false });
    const { result } = renderHook(() => useDashboardState());

    expect(hooks.useOramaSearch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({ id: '2' }),
      ]),
      null,
      ''
    );
    expect(result.current.filteredNotes).toHaveLength(1);
    expect(result.current.isTrashSelected).toBe(false);
  });

  it('filters trash notes correctly when isTrashSelected is true', () => {
    setupStores({ isTrashSelected: true });
    renderHook(() => useDashboardState());

    // oramaSearch should receive only the trash-1 note
    expect(hooks.useOramaSearch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'trash-1' })]),
      null,
      ''
    );
  });

  it('updates selection correctly through updateSelection', () => {
    const { result } = renderHook(() => useDashboardState());

    act(() => {
      result.current.updateSelection('React', false, 'test query');
    });

    const dState = useDashboardStore.getState();
    expect(dState.selectedTag).toBe('React');
    expect(dState.searchQuery).toBe('test query');
    expect(dState.isTrashSelected).toBe(false);
    expect(dState.isSidebarOpen).toBe(false);

    // searchNotes mocked to return note 1, so selectedNoteId should be '1'
    const nState = useNoteStore.getState();
    expect(nState.selectedNoteId).toBe('1');
  });

  it('returns the currently selected note object', () => {
    setupStores({}, { selectedNoteId: '1' });
    const { result } = renderHook(() => useDashboardState());

    expect(result.current.selectedNote).toEqual(expect.objectContaining({ id: '1' }));
  });

  it('auto-selects the first filtered note if current selection is invalid', () => {
    // Current selection is 'invalid', filteredNotes has '1'
    setupStores({}, { selectedNoteId: 'invalid' });
    renderHook(() => useDashboardState());

    // Should auto-select the first one
    expect(useNoteStore.getState().selectedNoteId).toBe('1');
  });

  it('clears selection if filtered notes is empty', () => {
    vi.mocked(hooks.useOramaSearch).mockReturnValue({
      filteredNotes: [],
      searchNotes: vi.fn().mockReturnValue([]),
      oramaDb: {} as any,
    });
    setupStores({}, { selectedNoteId: '1' });
    renderHook(() => useDashboardState());

    // Should clear selection
    expect(useNoteStore.getState().selectedNoteId).toBeNull();
  });
});
