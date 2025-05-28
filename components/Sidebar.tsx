import React, { useState, useMemo } from 'react';
import { Folder, HierarchicalFolder } from '../types';
import { ALL_PROMPTS_FOLDER_ID, DEFAULT_FOLDER_NAME } from '../constants';
import FolderIcon from './icons/FolderIcon';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import IconButton from './IconButton';
import { getFlattenedFolders } from '../utils/folderUtils'; 

interface FolderItemProps {
  folder: HierarchicalFolder;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (folderId: string) => void;
  level: number;
  promptsInFolderBranchEmpty: boolean;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  selectedFolderId,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  isExpanded,
  onToggleExpand,
  level,
  promptsInFolderBranchEmpty
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);

  const handleRename = () => {
    if (renameValue.trim() && renameValue.trim() !== folder.name) {
      onRenameFolder(folder.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const canDelete = folder.isDeletable && promptsInFolderBranchEmpty && folder.children.length === 0;

  return (
    <div style={{ paddingLeft: `${level * 1.25}rem` }}>
      <div
        className={`group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${selectedFolderId === folder.id 
                      ? 'bg-primary-light text-white' 
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-50'}`}
      >
        <button onClick={() => onSelectFolder(folder.id)} className="flex items-center flex-grow truncate mr-2">
          {folder.children.length > 0 && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); onToggleExpand(folder.id); }}
              className={`mr-1 p-0.5 ${selectedFolderId === folder.id 
                ? 'text-white hover:bg-primary dark:hover:bg-primary-dark' 
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'}`}
              label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
            </IconButton>
          )}
          <FolderIcon className={`w-5 h-5 mr-2 ${folder.children.length === 0 && level > 0 ? 'ml-[1.125rem]' : folder.children.length === 0 && level === 0 ? 'ml-[1.125rem]' : ''}  
                               ${selectedFolderId === folder.id ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="text-sm bg-transparent border border-primary-light dark:border-primary rounded px-1 py-0.5 w-full text-neutral-800 dark:text-neutral-100 dark:bg-neutral-600"
              autoFocus
            />
          ) : (
            <span className="truncate">{folder.name}</span>
          )}
        </button>
        {!isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            {folder.isRenamable && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
                label="Rename folder"
                className={`p-1 ${selectedFolderId === folder.id 
                  ? 'text-white hover:bg-primary dark:hover:bg-primary-dark' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-primary-dark dark:hover:text-primary-light'}`}
              >
                <PencilIcon className="w-4 h-4" />
              </IconButton>
            )}
            {folder.isDeletable && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                label="Delete folder"
                disabled={!canDelete}
                className={`p-1 ${selectedFolderId === folder.id 
                  ? 'text-white hover:bg-red-400 dark:hover:bg-red-500' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-500'} 
                  ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!canDelete ? "Folder must be empty and have no subfolders to delete" : "Delete folder"}
              >
                <TrashIcon className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        )}
      </div>
      {isExpanded && folder.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {/* Recursive rendering handled by parent in renderFolderItems */}
        </div>
      )}
    </div>
  );
};


interface SidebarProps {
  hierarchicalFolders: HierarchicalFolder[]; 
  allFolders: Folder[]; 
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddFolder: (folderName: string, parentId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  isFolderBranchEmpty: (folderId: string) => boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  hierarchicalFolders, 
  allFolders, 
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  isFolderBranchEmpty
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const defaultFolderForDisplay = useMemo(() => allFolders.find(f => f.name === DEFAULT_FOLDER_NAME && f.parentId === null), [allFolders]);

  const flattenedFoldersForParentSelect = useMemo(() => {
    return getFlattenedFolders(hierarchicalFolders); 
  }, [hierarchicalFolders]);


  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleAddFolderSubmit = () => {
    if (newFolderName.trim() === '') return;
     const siblingFolders = allFolders.filter(f => f.parentId === newFolderParentId);
    if (siblingFolders.find(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase())) {
        alert(`A folder named "${newFolderName.trim()}" already exists in this location.`);
        return;
    }
    onAddFolder(newFolderName.trim(), newFolderParentId);
    setNewFolderName('');
    setNewFolderParentId(null);
    setShowAddFolderInput(false);
  };
  

  const renderFolderItems = (foldersToRender: HierarchicalFolder[], level: number) => {
    return foldersToRender.map(folder => (
      <React.Fragment key={folder.id}>
        <FolderItem
          folder={folder}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          isExpanded={!!expandedFolders[folder.id]}
          onToggleExpand={handleToggleExpand}
          level={level}
          promptsInFolderBranchEmpty={isFolderBranchEmpty(folder.id)}
        />
        {expandedFolders[folder.id] && folder.children && folder.children.length > 0 && (
          <div className="pl-0 mt-1 space-y-1">
            {renderFolderItems(folder.children, level + 1)}
          </div>
        )}
      </React.Fragment>
    ));
  };


  return (
    <aside className="w-72 bg-neutral-50 dark:bg-neutral-800 p-4 border-r border-neutral-200 dark:border-neutral-700 space-y-6 h-full overflow-y-auto flex flex-col transition-colors duration-300">
      <div className="flex-grow">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 px-3">Folders</h2>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectFolder(ALL_PROMPTS_FOLDER_ID)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${selectedFolderId === ALL_PROMPTS_FOLDER_ID 
                          ? 'bg-primary-light text-white' 
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-50'}`}
          >
            <FolderIcon className={`w-5 h-5 mr-3 ${selectedFolderId === ALL_PROMPTS_FOLDER_ID ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
            All Prompts
          </button>
          {defaultFolderForDisplay && ( 
            <button
              onClick={() => onSelectFolder(null)} 
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                          ${selectedFolderId === null 
                            ? 'bg-primary-light text-white' 
                            : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-50'}`}
            >
              <FolderIcon className={`w-5 h-5 mr-3 ${selectedFolderId === null ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
              {DEFAULT_FOLDER_NAME}
            </button>
          )}
          {renderFolderItems(hierarchicalFolders, 0)}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
        {showAddFolderInput ? (
          <div className="space-y-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-md">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-500 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-neutral-600 text-neutral-900 dark:text-neutral-50"
            />
            <select
              value={newFolderParentId || ''}
              onChange={(e) => setNewFolderParentId(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-500 bg-white dark:bg-neutral-600 rounded-md focus:ring-primary focus:border-primary text-neutral-900 dark:text-neutral-50"
            >
              <option value="" className="text-neutral-900 dark:text-neutral-50">Root Level</option>
              {flattenedFoldersForParentSelect.map(folder => (
                <option key={folder.id} value={folder.id} className="text-neutral-900 dark:text-neutral-50">{folder.name}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleAddFolderSubmit}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
              >
                Add Folder
              </button>
              <button
                onClick={() => { setShowAddFolderInput(false); setNewFolderName(''); setNewFolderParentId(null); }}
                className="flex-1 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-400 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddFolderInput(true)}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-primary dark:text-primary-light hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark dark:hover:text-white border-2 border-dashed border-primary-light dark:border-primary rounded-md transition-colors"
            aria-label="Add new folder"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Folder
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;