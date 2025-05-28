import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, label = "Tags" }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim() !== '') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label htmlFor="tag-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {label} (comma or Enter to add)
      </label>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white dark:bg-neutral-700">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary-light text-white text-xs font-medium rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-dark hover:text-white" /* Consider dark mode for this button text if needed */
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="flex-grow p-1 border-none outline-none focus:ring-0 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          placeholder={tags.length === 0 ? "Add tags..." : ""}
        />
      </div>
    </div>
  );
};

export default TagInput;