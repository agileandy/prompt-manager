
import React, { useState } from 'react';
import { Prompt } from '../types';
import { formatDate } from '../utils/dateFormatter';
import Modal from './Modal';
import IconButton from './IconButton';
import ClipboardIcon from './icons/ClipboardIcon';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptVersions: Prompt[]; // All versions of a single prompt, sorted newest first ideally
  originalPromptTitle: string;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, promptVersions, originalPromptTitle }) => {
  const [copiedVersionId, setCopiedVersionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyVersionText = (textToCopy: string, versionId: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedVersionId(versionId);
      setTimeout(() => setCopiedVersionId(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy version text: ', err);
      alert('Failed to copy text.');
    });
  };

  // Sort versions by version number descending (newest first)
  const sortedVersions = [...promptVersions].sort((a, b) => b.version - a.version);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Version History for "${originalPromptTitle}"`}>
      {sortedVersions.length > 0 ? (
        <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
          {sortedVersions.map((version) => (
            <li key={version.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm bg-neutral-50 dark:bg-neutral-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-primary-dark dark:text-primary-light">Version {version.version}</h4>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Created: {formatDate(version.createdAt)}</span>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-200 mb-1"><strong>Title:</strong> {version.title}</p>
              {version.description && <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-1"><strong>Description:</strong> {version.description}</p>}
              
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300"><strong>Prompt Text:</strong></p>
                    <IconButton
                        onClick={() => handleCopyVersionText(version.promptText, version.id)}
                        label={copiedVersionId === version.id ? "Copied!" : "Copy prompt text"}
                        className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light"
                        title={copiedVersionId === version.id ? "Copied!" : "Copy prompt text"}
                    >
                        <ClipboardIcon className="w-4 h-4" />
                         {copiedVersionId === version.id && <span className="ml-1 text-xs">Copied!</span>}
                    </IconButton>
                </div>
                <pre className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 p-3 rounded whitespace-pre-wrap break-words max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-600">
                  {version.promptText}
                </pre>
              </div>

              {version.tags.length > 0 && (
                <div className="mt-2">
                  <strong className="text-sm text-neutral-600 dark:text-neutral-300">Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {version.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-secondary text-white text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
               <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                <span>Used: {version.timesUsed} times</span> | <span>Last Used: {formatDate(version.lastUsedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-300">No version history available for this prompt.</p>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-neutral-800"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default VersionHistoryModal;
