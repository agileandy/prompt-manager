
import React from 'react';
import PlusIcon from './icons/PlusIcon';
import ThemeToggleButton from './ThemeToggleButton';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import DownloadIcon from './icons/DownloadIcon'; 
import UploadIcon from './icons/UploadIcon';   
import IconButton from './IconButton';

interface HeaderProps {
  onAddPrompt: () => void;
  onToggleHelp: () => void;
  onExportData: () => void; 
  onImportDataTrigger: () => void; 
}

const Header: React.FC<HeaderProps> = ({ onAddPrompt, onToggleHelp, onExportData, onImportDataTrigger }) => {
  return (
    <header className="bg-white dark:bg-neutral-800 shadow-md dark:shadow-neutral-700/50 sticky top-0 z-40 transition-colors duration-300">
      {/* Removed 'container mx-auto' and adjusted padding for full width */}
      <div className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* App Title - Responsive */}
        <div className="flex-shrink-0">
          <h1 className="font-bold text-primary-dark dark:text-primary-light flex items-center">
            <span role="img" aria-label="brain emoji" className="mr-2 text-2xl">🧠</span>
            <span className="hidden sm:inline text-xl md:text-2xl">AI Prompt Manager</span>
            <span className="sm:hidden text-xl">Prompts</span>
          </h1>
        </div>
        
        {/* Action Buttons - Responsive */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <ThemeToggleButton />
          <IconButton 
            onClick={onImportDataTrigger} 
            label="Import Data"
            className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light"
            title="Import Data (replaces existing data)"
          >
            <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </IconButton>
           <IconButton 
            onClick={onExportData} 
            label="Export Data"
            className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light"
            title="Export All Data"
          >
            <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </IconButton>
          <IconButton 
            onClick={onToggleHelp} 
            label="Help"
            className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light"
          >
            <QuestionMarkCircleIcon className="w-6 h-6" />
          </IconButton>
          
          {/* Responsive Add Prompt Button */}
          <button
            onClick={onAddPrompt}
            className="hidden sm:flex items-center bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-3 md:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out text-sm md:text-base"
            title="Add New Prompt"
          >
            <PlusIcon className="w-5 h-5 mr-1 md:mr-2" />
            <span className="hidden md:inline">Add Prompt</span>
            <span className="md:hidden">Add</span>
          </button>
          {/* Icon-only Add Prompt Button for xs screens */}
          <IconButton
            onClick={onAddPrompt}
            label="Add new prompt"
            className="sm:hidden text-white bg-primary hover:bg-primary-dark p-2" 
            title="Add New Prompt"
          >
            <PlusIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
