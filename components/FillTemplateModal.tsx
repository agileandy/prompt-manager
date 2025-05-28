import React, { useState, useEffect, useCallback } from 'react';
import { Prompt } from '../types';
import { extractVariables, fillTemplate } from '../utils/templateUtils';
import Modal from './Modal';

interface FillTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templatePrompt: Prompt;
  onGenerateAndCopy: (originalPrompt: Prompt, filledText: string) => void; // Modified to pass original prompt
}

const FillTemplateModal: React.FC<FillTemplateModalProps> = ({
  isOpen,
  onClose,
  templatePrompt,
  onGenerateAndCopy,
}) => {
  const [variables, setVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && templatePrompt) {
      const extracted = extractVariables(templatePrompt.promptText);
      setVariables(extracted);
      const initialValues: Record<string, string> = {};
      extracted.forEach(v => initialValues[v] = '');
      setVariableValues(initialValues);
      setCopied(false); 
    }
  }, [isOpen, templatePrompt]);

  const handleValueChange = (variableName: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [variableName]: value }));
  };

  const handleGenerateAndCopyClick = () => {
    const filledText = fillTemplate(templatePrompt.promptText, variableValues);
    // For normal copy, show "Copied!" and close. For AI flow, App.tsx will handle modal transitions.
    // The onGenerateAndCopy callback now signals completion to App.tsx.
    onGenerateAndCopy(templatePrompt, filledText); 
    
    // Show "Copied!" feedback if not immediately transitioning to another modal
    // This visual feedback might be less relevant if App.tsx immediately opens AI modal
    // For now, let's assume onGenerateAndCopy itself might trigger UI changes in App.tsx
    // which might include closing this modal or opening another.
    // We can set copied for a brief moment for visual feedback regardless.
    navigator.clipboard.writeText(filledText).then(() => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            // onClose(); // App.tsx will now control closing based on flow.
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy filled template: ', err);
        alert('Failed to copy text.');
    });
  };

  if (!isOpen || !templatePrompt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Use Template: "${templatePrompt.title}"`}>
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Fill in the values for the variables in this prompt template.
        </p>
        
        {variables.length > 0 ? (
          variables.map(variable => (
            <div key={variable}>
              <label htmlFor={`var-${variable}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 capitalize">
                {variable.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                id={`var-${variable}`}
                value={variableValues[variable] || ''}
                onChange={(e) => handleValueChange(variable, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          ))
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400">No variables found in this prompt.</p>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerateAndCopyClick}
            disabled={variables.length === 0 || copied}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 focus:ring-primary
                        ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-dark'}
                        ${variables.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {copied ? 'Copied & Done!' : 'Complete & Use Text'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FillTemplateModal;