import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ClipboardIcon from './icons/ClipboardIcon';
import IconButton from './IconButton';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTitle: string;
  inputText: string;
  generatedText: string | null;
  isGenerating: boolean;
  onGenerate: (textToGenerateFrom: string) => void;
  errorMessage?: string | null; 
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  promptTitle,
  inputText,
  generatedText,
  isGenerating,
  onGenerate,
  errorMessage,
}) => {
  const [copiedOutput, setCopiedOutput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopiedOutput(false); // Reset copied state when modal opens/re-opens
    }
  }, [isOpen]);

  const handleCopyToClipboard = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText).then(() => {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }).catch(err => {
        console.error('Failed to copy AI generated text: ', err);
        alert('Failed to copy text.');
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate with AI: "${promptTitle}"`}>
      <div className="space-y-6">
        <div>
          <label htmlFor="ai-input-prompt" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Your Prompt:
          </label>
          <textarea
            id="ai-input-prompt"
            readOnly
            value={inputText}
            rows={5}
            className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-none"
            aria-label="Input prompt text for AI generation"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onGenerate(inputText)}
            disabled={isGenerating}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : (generatedText ? 'Regenerate' : 'Generate Text')}
          </button>
        </div>

        {errorMessage && !isGenerating && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-200 text-sm">
                <p><strong>Error:</strong> {errorMessage}</p>
            </div>
        )}

        {(isGenerating || generatedText) && !errorMessage && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="ai-generated-output" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                AI Output:
              </label>
              {generatedText && !isGenerating && (
                <IconButton
                  onClick={handleCopyToClipboard}
                  label={copiedOutput ? "Copied!" : "Copy AI output"}
                  className="text-xs p-1"
                >
                  <ClipboardIcon className="w-4 h-4 mr-1" />
                  {copiedOutput ? "Copied!" : "Copy Output"}
                </IconButton>
              )}
            </div>
            {isGenerating ? (
              <div className="flex items-center justify-center h-32 p-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700">
                <svg className="animate-spin h-8 w-8 text-primary dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-neutral-600 dark:text-neutral-300">Generating text...</span>
              </div>
            ) : (
              generatedText && (
                <textarea
                  id="ai-generated-output"
                  readOnly
                  value={generatedText}
                  rows={8}
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-y"
                  aria-label="AI generated text output"
                />
              )
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-light"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AIGenerationModal;