import React, { useState, useEffect, useMemo } from 'react';
import { Prompt, Folder } from '../types';
// import { generateUUID } from '../utils/uuid'; // Not used here, ID generation is in App.tsx
import TagInput from './TagInput';
import { DEFAULT_FOLDER_NAME } from '../constants';
import { buildFolderHierarchy, getFlattenedFolders } from '../utils/folderUtils';


interface PromptFormProps {
  promptToEdit?: Prompt | null; 
  folders: Folder[];
  onSave: (promptData: Omit<Prompt, 'id' | 'originalPromptId' | 'version' | 'createdAt' | 'lastUsedAt' | 'timesUsed'>, existingPrompt?: Prompt | null) => void;
  onClose: () => void;
  defaultFolderId: string | null;
}

const PromptForm: React.FC<PromptFormProps> = ({ promptToEdit, folders, onSave, onClose, defaultFolderId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);

  const hierarchicalFoldersForSelect = useMemo(() => {
    // Filter out the default "Uncategorized" folder before building hierarchy for user-selectable folders
    const userFolders = folders.filter(f => f.id !== defaultFolderId); 
    const hierarchy = buildFolderHierarchy(userFolders);
    return getFlattenedFolders(hierarchy);
  }, [folders, defaultFolderId]);
  
  // The default folder option should always be available and represent the "Uncategorized" folder
  const defaultFolderOption = useMemo(() => folders.find(f => f.id === defaultFolderId), [folders, defaultFolderId]);


  useEffect(() => {
    if (promptToEdit) {
      setTitle(promptToEdit.title);
      setDescription(promptToEdit.description);
      setPromptText(promptToEdit.promptText);
      setTags(promptToEdit.tags);
      setFolderId(promptToEdit.folderId); // This could be defaultFolderId or a user folder
    } else {
      // For new prompts, default to the "Uncategorized" folder
      setFolderId(defaultFolderId); 
    }
  }, [promptToEdit, defaultFolderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      alert("Title and Prompt Text are required.");
      return;
    }

    const promptData = {
      title: title.trim(),
      description: description.trim(),
      promptText: promptText.trim(),
      tags,
      folderId: folderId, // This will be defaultFolderId if "Uncategorized" is selected or if it's a new prompt
    };
    onSave(promptData, promptToEdit);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Short Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label htmlFor="promptText" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Prompt Text
          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">(Use &#123;&#123;variable_name&#125;&#125; for templates)</span>
        </label>
        <textarea
          id="promptText"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={6}
          required
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          placeholder="Enter your AI prompt. Example: Write a blog post about {{topic}}."
        />
      </div>
      
      <TagInput tags={tags} onTagsChange={setTags} />

      <div>
        <label htmlFor="folder" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Folder
        </label>
        <select
          id="folder"
          value={folderId || ''} // Ensure value is correctly handled if folderId is null (should be defaultFolderId's value)
          onChange={(e) => setFolderId(e.target.value || null )} // If '' selected, treat as default/uncategorized
          className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100"
        >
          {defaultFolderOption && <option value={defaultFolderOption.id}>{DEFAULT_FOLDER_NAME}</option>}
          {/* If somehow defaultFolderOption is not available but defaultFolderId is, provide a fallback.
              This case should ideally not happen if defaultFolderId is always set from a valid folder. */}
          {!defaultFolderOption && defaultFolderId && <option value={defaultFolderId}>{DEFAULT_FOLDER_NAME} (Default)</option>} 
          
          {hierarchicalFoldersForSelect.map(folder => (
            // The style for indentation might need adjustment based on final CSS processing of Tailwind classes for option
            <option key={folder.id} value={folder.id} style={{ paddingLeft: `${(folder.level || 0) * 10 + 5}px` }}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-light"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary"
        >
          {promptToEdit ? 'Save as New Version' : 'Create Prompt'}
        </button>
      </div>
    </form>
  );
};

export default PromptForm;
