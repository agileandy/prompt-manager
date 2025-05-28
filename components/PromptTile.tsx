import React, { useState } from 'react';
import { Prompt } from '../types';
import { formatDate } from '../utils/dateFormatter';
import IconButton from './IconButton';
import ClipboardIcon from './icons/ClipboardIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import TagIcon from './icons/TagIcon';
import HistoryIcon from './icons/HistoryIcon'; 
import SparklesIcon from './icons/SparklesIcon'; // New icon for AI generation
import { extractVariables } from '../utils/templateUtils'; 

interface PromptTileProps {
  prompt: Prompt; 
  onCopy: (prompt: Prompt) => void; 
  onEdit: (prompt: Prompt) => void; 
  onDelete: (originalPromptId: string) => void; 
  onViewHistory: (originalPromptId: string) => void; 
  onGenerateWithAI: (prompt: Prompt) => void; // New prop for AI generation
  hasMultipleVersions: boolean;
}

const PromptTile: React.FC<PromptTileProps> = ({ prompt, onCopy, onEdit, onDelete, onViewHistory, onGenerateWithAI, hasMultipleVersions }) => {
  const [copiedDirectly, setCopiedDirectly] = useState(false); 

  const variables = extractVariables(prompt.promptText);
  const isTemplate = variables.length > 0;

  const handleAction = () => {
    if (isTemplate) {
      onCopy(prompt); 
    } else {
      navigator.clipboard.writeText(prompt.promptText).then(() => {
        onCopy(prompt); 
        setCopiedDirectly(true);
        setTimeout(() => setCopiedDirectly(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
      });
    }
  };

  const buttonText = isTemplate 
    ? "Use Template" 
    : copiedDirectly 
      ? "Copied!" 
      : "Copy Prompt";

  return (
    <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl p-6 hover:shadow-xl dark:hover:shadow-neutral-700/50 transition-all duration-300 ease-in-out flex flex-col justify-between h-full border border-neutral-200 dark:border-neutral-700">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light truncate mr-2" title={prompt.title}>{prompt.title}</h3>
          <div className="flex items-center space-x-1">
            {hasMultipleVersions && (
              <IconButton onClick={() => onViewHistory(prompt.originalPromptId)} label="View prompt history" className="text-neutral-500 dark:text-neutral-400 hover:text-secondary dark:hover:text-secondary p-1">
                <HistoryIcon className="w-5 h-5" />
              </IconButton>
            )}
            {/* AI Generation Button - always shown */}
            <IconButton 
              onClick={() => onGenerateWithAI(prompt)} 
              label="Generate with AI" 
              className="text-neutral-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 p-1"
              title="Generate with AI"
            >
              <SparklesIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
         <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Version: {prompt.version}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 h-10 overflow-hidden text-ellipsis" title={prompt.description}>
          {prompt.description || "No description provided."}
        </p>
        
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <TagIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            {prompt.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-secondary text-white text-xs rounded-full">
                {tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">+{prompt.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 space-y-1">
          <p>Used: <span className="font-medium text-neutral-700 dark:text-neutral-200">{prompt.timesUsed} times</span></p>
          <p>Last Used: <span className="font-medium text-neutral-700 dark:text-neutral-200">{formatDate(prompt.lastUsedAt)}</span></p>
          <p>Version Created: <span className="font-medium text-neutral-700 dark:text-neutral-200">{formatDate(prompt.createdAt)}</span></p>
        </div>

        <div className="flex items-center justify-between space-x-2 border-t pt-4 mt-4 border-neutral-200 dark:border-neutral-700">
          <button
            onClick={handleAction}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150
                        ${(copiedDirectly && !isTemplate) ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary-dark text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-light'}`}
          >
            <ClipboardIcon className="w-5 h-5 mr-2" />
            {buttonText}
          </button>
          <div className="flex">
            <IconButton onClick={() => onEdit(prompt)} label="Edit prompt (creates new version)" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light">
              <PencilIcon className="w-5 h-5" />
            </IconButton>
            <IconButton onClick={() => onDelete(prompt.originalPromptId)} label="Delete prompt (all versions)" className="text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-500">
              <TrashIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTile;