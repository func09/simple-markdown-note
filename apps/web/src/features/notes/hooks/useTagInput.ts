import { useState, useCallback } from 'react';

/**
 * タグ入力フィールドの状態と各種イベントハンドリング（分割、確定、削除）を管理するカスタムフック
 *
 * @param tags 現在選択・付与されているタグ名の配列
 * @param onChange タグの一覧に変更があったときに呼ばれるコールバック
 */
export const useTagInput = (tags: string[], onChange: (tags: string[]) => void) => {
  const [inputValue, setInputValue] = useState('');

  /**
   * テキスト入力の変更ハンドラー
   * 入力値にカンマやスペースが含まれていれば、自動で区切ってタグとして追加（確定）します
   * 既存のタグと重複するものは省かれます
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value.includes(',') || value.includes(' ')) {
        const newTags = value
          .split(/[,\s]+/)
          .map((t) => t.trim())
          .filter((t) => t !== '' && !tags.includes(t));

        if (newTags.length > 0) {
          onChange([...tags, ...newTags]);
          setInputValue('');
        } else {
          setInputValue(value.replace(/[,\s]+$/, ''));
        }
      } else {
        setInputValue(value);
      }
    },
    [tags, onChange]
  );

  /**
   * キーボード入力のハンドラー
   * - Enter: 現在の入力中テキストをタグとして確定して追加
   * - Backspace: 未入力の状態で押された場合、最後に付与されたタグを削除
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !tags.includes(trimmedValue)) {
          onChange([...tags, trimmedValue]);
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        // 最後のタグを削除
        onChange(tags.slice(0, -1));
      }
    },
    [inputValue, tags, onChange]
  );

  /**
   * 特定のタグをリストから削除するハンドラー
   * @param tagToRemove 削除したいタグの名称
   */
  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onChange]
  );

  return {
    inputValue,
    handleInputChange,
    handleKeyDown,
    removeTag,
  };
};
