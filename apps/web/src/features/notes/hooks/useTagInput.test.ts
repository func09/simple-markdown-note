import { renderHook, act } from '@testing-library/react';
import { useTagInput } from '@/features/notes/hooks/useTagInput';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('useTagInput', () => {
  it('should initialize with an empty input value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTagInput(['existing'], onChange));

    expect(result.current.inputValue).toBe('');
  });

  describe('handleInputChange', () => {
    it('should update inputValue without calling onChange if no comma or space is present', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput([], onChange));

      act(() => {
        result.current.handleInputChange({
          target: { value: 'tag1' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.inputValue).toBe('tag1');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should split tags by space and call onChange', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['existing'], onChange));

      act(() => {
        result.current.handleInputChange({
          target: { value: 'tag1 tag2 ' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(onChange).toHaveBeenCalledWith(['existing', 'tag1', 'tag2']);
      expect(result.current.inputValue).toBe('');
    });

    it('should split tags by comma and ignore duplicates or empty strings', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['existing'], onChange));

      act(() => {
        result.current.handleInputChange({
          target: { value: 'tag1,, existing,tag2,' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // 'existing' is ignored as it's already in tags
      expect(onChange).toHaveBeenCalledWith(['existing', 'tag1', 'tag2']);
    });
  });

  describe('handleKeyDown', () => {
    it('should add tag on Enter if inputValue is not empty or duplicate', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['existing'], onChange));

      act(() => {
        result.current.handleInputChange({
          target: { value: 'newTag' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      const preventDefault = vi.fn();
      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith(['existing', 'newTag']);
      expect(result.current.inputValue).toBe('');
    });

    it('should remove the last tag on Backspace if inputValue is empty', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['tag1', 'tag2'], onChange));

      act(() => {
        result.current.handleKeyDown({ key: 'Backspace' } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(onChange).toHaveBeenCalledWith(['tag1']);
    });

    it('should NOT remove the last tag on Backspace if inputValue is NOT empty', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['tag1', 'tag2'], onChange));

      act(() => {
        result.current.handleInputChange({
          target: { value: 'typing' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleKeyDown({ key: 'Backspace' } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('removeTag', () => {
    it('should filter out the specified tag', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useTagInput(['tag1', 'tag2', 'tag3'], onChange));

      act(() => {
        result.current.removeTag('tag2');
      });

      expect(onChange).toHaveBeenCalledWith(['tag1', 'tag3']);
    });
  });
});
