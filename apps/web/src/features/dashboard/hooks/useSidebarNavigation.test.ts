import { renderHook, act } from '@testing-library/react';
import { useSidebarNavigation } from './useSidebarNavigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useNotesQuery from '@/features/notes/hooks/useNotesQuery';
import { useDashboardStore } from '@/features/dashboard/store';
import React from 'react';

// Mock dependencies
vi.mock('@/features/notes/hooks/useNotesQuery');

const setupMockStore = (initialState: any = {}) => {
  useDashboardStore.setState({
    selectedTag: initialState.selectedTag ?? null,
    isTrashSelected: initialState.isTrashSelected ?? false,
  });
};

describe('useSidebarNavigation', () => {
  let mockFocus: any;
  let updateSelection: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStore();

    updateSelection = vi.fn();

    vi.mocked(useNotesQuery.useTags).mockReturnValue({
      data: [
        { id: '1', name: 'React' },
        { id: '2', name: 'TypeScript' },
      ],
    } as any);

    // Mock document.getElementById for focus tracking
    mockFocus = vi.fn();
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'note-list-container') {
        return { focus: mockFocus } as unknown as HTMLElement;
      }
      return null;
    });
  });

  it('navigates downwards with ArrowDown', () => {
    // Current state: All Notes (first item) selected
    setupMockStore({ selectedTag: null, isTrashSelected: false });

    const { result } = renderHook(() => useSidebarNavigation(updateSelection));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleNavKeyDown({
        key: 'ArrowDown',
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    // 'all' -> next is 'trash'
    expect(updateSelection).toHaveBeenCalledWith(null, true);
  });

  it('navigates upwards with ArrowUp', () => {
    // Current state: Trash selected
    setupMockStore({ selectedTag: null, isTrashSelected: true });

    const { result } = renderHook(() => useSidebarNavigation(updateSelection));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleNavKeyDown({
        key: 'ArrowUp',
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    // 'trash' -> prev is 'all'
    expect(updateSelection).toHaveBeenCalledWith(null, false, '');
  });

  it('navigates into tags list correctly', () => {
    // Current state: Untagged selected
    setupMockStore({ selectedTag: '__untagged__', isTrashSelected: false });

    const { result } = renderHook(() => useSidebarNavigation(updateSelection));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleNavKeyDown({
        key: 'ArrowDown',
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    // Next item after 'untagged' is the first real tag: 'React'
    expect(updateSelection).toHaveBeenCalledWith('React', false);
  });

  it('does not navigate past the end of the list', () => {
    // Current state: TypeScript (last tag)
    setupMockStore({ selectedTag: 'TypeScript', isTrashSelected: false });

    const { result } = renderHook(() => useSidebarNavigation(updateSelection));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleNavKeyDown({
        key: 'ArrowDown',
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    // Remains on 'TypeScript'
    expect(updateSelection).toHaveBeenCalledWith('TypeScript', false);
  });

  it('shifts focus to note list on ArrowRight', () => {
    const { result } = renderHook(() => useSidebarNavigation(updateSelection));
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleNavKeyDown({
        key: 'ArrowRight',
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mockFocus).toHaveBeenCalled();
    expect(updateSelection).not.toHaveBeenCalled();
  });
});
