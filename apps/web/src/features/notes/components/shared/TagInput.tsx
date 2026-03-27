import React, { useState } from 'react';

import { Tag as TagIcon, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/**
 * Simplenote風のステートレスな手触りのタグ入力コンポーネント
 * カンマやスペース、Enterで入力を確定させ、親コンポーネントに通知する
 */
export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = 'Add tags...' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // カンマまたはスペースが含まれているかチェック
    if (value.includes(',') || value.includes(' ')) {
      const newTags = value
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(t => t !== '' && !tags.includes(t));
      
      if (newTags.length > 0) {
        onChange([...tags, ...newTags]);
        setInputValue('');
      } else {
        setInputValue(value.replace(/[,\s]+$/, ''));
      }
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-1 min-h-[40px] border-t border-slate-800/50">
      <div className="flex items-center gap-1.5 text-slate-500 mr-1">
        <TagIcon size={14} />
      </div>
      
      {tags.map((tag) => (
        <Badge 
          key={tag} 
          variant="secondary"
          className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700/50 flex items-center gap-1 pr-1"
        >
          {tag}
          <button 
            onClick={() => removeTag(tag)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
          >
            <X size={10} />
          </button>
        </Badge>
      ))}
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 bg-transparent border-none focus:outline-none text-slate-300 text-sm py-1 min-w-[120px] placeholder:text-slate-600"
      />
    </div>
  );
};
