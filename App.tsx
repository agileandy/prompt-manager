
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Prompt, Folder, SortOption, HierarchicalFolder, ExportData } from './types';
import { ALL_PROMPTS_FOLDER_ID, SORT_OPTIONS_MAP, DEFAULT_FOLDER_NAME, PROMPTS_PER_PAGE as IMPORTED_PROMPTS_PER_PAGE } from './constants';
import { generateUUID } from './utils/uuid';
import { buildFolderHierarchy, isFolderBranchEmpty as checkFolderBranchEmptyLogic, getAllFolderIdsInBranch } from './utils/folderUtils';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PromptTile from './components/PromptTile';
import Modal from './components/Modal';
import PromptForm from './components/PromptForm';
import TagIcon from './components/icons/TagIcon';
import VersionHistoryModal from './components/VersionHistoryModal';
import HelpModal from './components/HelpModal';
import PaginationControls from './components/PaginationControls';
import {
  getAllPromptsDB,
  addPromptDB,
  updatePromptDB,
  deletePromptsByOriginalIdDB,
  getPromptsByOriginalIdDB,
  getAllFoldersDB,
  addFolderDB,
  updateFolderDB,
  deleteFolderDB,
  initDefaultFolderDB,
  getFolderByIdDB,
  clearAllPromptsDB,
  clearAllFoldersDB,
} from './utils/idb';
import useTheme from './hooks/useTheme';
import { extractVariables } from './utils/templateUtils';
import FillTemplateModal from './components/FillTemplateModal';
import ChevronDownIcon from './components/icons/ChevronDownIcon';
import AIGenerationModal from './components/AIGenerationModal'; 
import { generateTextWithOllama } from './utils/ollamaApi'; // Changed to Ollama API utility

const PROMPTS_PER_PAGE = IMPORTED_PROMPTS_PER_PAGE || 12;

const App = () => {
  const [_theme, _toggleTheme] = useTheme();
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(ALL_PROMPTS_FOLDER_ID);
  const [currentSortOption, setCurrentSortOption] = useState<SortOption>(SortOption.RECENTLY_USED);
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyPromptVersions, setHistoryPromptVersions] = useState<Prompt[]>([]);
  const [historyPromptTitle, setHistoryPromptTitle] = useState<string>('');

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingData, setIsProcessingData] = useState(false); // For import/export

  // State for FillTemplateModal
  const [isFillTemplateModalOpen, setIsFillTemplateModalOpen] = useState(false);
  const [templateToFill, setTemplateToFill] = useState<Prompt | null>(null);

  // State for AI Generation Flow
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [promptForAIGeneration, setPromptForAIGeneration] = useState<Prompt | null>(null);
  const [inputTextForAIGeneration, setInputTextForAIGeneration] = useState<string>('');
  const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState<boolean>(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);
  const [originatingAIFlow, setOriginatingAIFlow] = useState<boolean>(false);


  const importFileRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);


  const loadData = useCallback(async (context: string = "initial") => {
    console.log(`[loadData called from ${context}] Starting data load...`);
    setIsLoading(true);
    try {
      const [dbPrompts, dbFolders, dbDefaultFolder] = await Promise.all([
        getAllPromptsDB(),
        getAllFoldersDB(),
        initDefaultFolderDB()
      ]);
      setAllPrompts(dbPrompts);
      setFolders(dbFolders);
      setDefaultFolderId(dbDefaultFolder.id);

      if (!dbFolders.find(f => f.id === dbDefaultFolder.id)) {
         setFolders(prev => [...prev, dbDefaultFolder]);
      }
      
      const promptsToMigrate = dbPrompts.filter(p => p.folderId === null);
      if (promptsToMigrate.length > 0 && dbDefaultFolder.id) {
        const migratedPrompts = await Promise.all(promptsToMigrate.map(async p => {
          const updatedPrompt = { ...p, folderId: dbDefaultFolder.id };
          await updatePromptDB(updatedPrompt);
          return updatedPrompt;
        }));
        setAllPrompts(currentPrompts => currentPrompts.map(p => {
          const migrated = migratedPrompts.find(mp => mp.id === p.id);
          return migrated || p;
        }));
      }
    } catch (error) {
      console.error(`[loadData from ${context}] Error loading data from IndexedDB:`, error);
      alert("Error loading data. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData("initial useEffect");
  }, [loadData]);


  const latestPrompts = useMemo(() => {
    const groupedByOriginalId = allPrompts.reduce((acc, prompt) => {
      acc[prompt.originalPromptId] = acc[prompt.originalPromptId] || [];
      acc[prompt.originalPromptId].push(prompt);
      return acc;
    }, {} as Record<string, Prompt[]>);

    return Object.values(groupedByOriginalId).map(versions => 
      versions.sort((a, b) => b.version - a.version)[0]
    );
  }, [allPrompts]);
  
  const promptVersionsCount = useMemo(() => {
    return allPrompts.reduce((acc, prompt) => {
      acc[prompt.originalPromptId] = (acc[prompt.originalPromptId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allPrompts]);


  const hierarchicalFolders = useMemo(() => buildFolderHierarchy(folders.filter(f => f.id !== defaultFolderId)), [folders, defaultFolderId]);

  const handleAddPromptClick = () => {
    setPromptToEdit(null);
    setIsPromptModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setIsPromptModalOpen(true);
  };

  const handleDeletePrompt = async (originalPromptId: string) => {
    const promptToDelete = latestPrompts.find(p => p.originalPromptId === originalPromptId);
    if (window.confirm(`Are you sure you want to delete the prompt "${promptToDelete?.title || 'this prompt'}" and all its versions?`)) {
      await deletePromptsByOriginalIdDB(originalPromptId);
      setAllPrompts(prev => prev.filter(p => p.originalPromptId !== originalPromptId));
    }
  };

  const handleSavePrompt = async (
    promptData: Omit<Prompt, 'id' | 'originalPromptId' | 'version' | 'createdAt' | 'lastUsedAt' | 'timesUsed'>,
    existingPromptVersion?: Prompt | null
  ) => {
    let newPromptVersion: Prompt;
    if (existingPromptVersion) {
      newPromptVersion = {
        ...promptData,
        id: generateUUID(),
        originalPromptId: existingPromptVersion.originalPromptId,
        version: existingPromptVersion.version + 1,
        createdAt: new Date().toISOString(),
        lastUsedAt: null, 
        timesUsed: 0,    
      };
    } else {
      const newId = generateUUID();
      newPromptVersion = {
        ...promptData,
        id: newId,
        originalPromptId: newId,
        version: 1,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        timesUsed: 0,
      };
    }
    await addPromptDB(newPromptVersion);
    setAllPrompts(prev => [...prev, newPromptVersion]);
    setIsPromptModalOpen(false);
    setPromptToEdit(null);
  };

  const updatePromptStats = useCallback(async (promptToUpdateStatsFor: Prompt) => {
    const latestVersionOfPrompt = allPrompts
      .filter(p => p.originalPromptId === promptToUpdateStatsFor.originalPromptId)
      .sort((a,b) => b.version - a.version)[0] || promptToUpdateStatsFor;

    const updatedPrompt = { 
      ...latestVersionOfPrompt, 
      timesUsed: latestVersionOfPrompt.timesUsed + 1, 
      lastUsedAt: new Date().toISOString() 
    };
    await updatePromptDB(updatedPrompt);
    setAllPrompts(prevAllPrompts => 
      prevAllPrompts.map(p => (p.id === updatedPrompt.id ? updatedPrompt : p))
    );
  }, [allPrompts]);


  // Handles "Use Template" button click OR direct copy from PromptTile
  const handleCopyOrUseTemplate = useCallback((prompt: Prompt) => {
    const variables = extractVariables(prompt.promptText);
    if (variables.length > 0) {
      setTemplateToFill(prompt);
      setOriginatingAIFlow(false); // This is for normal template usage, not AI flow
      setIsFillTemplateModalOpen(true);
    } else {
      // Direct copy is handled in PromptTile, here we just update stats
      updatePromptStats(prompt);
    }
  }, [updatePromptStats]);
  
  // Callback from FillTemplateModal
  const handleTemplateCompleted = useCallback(async (originalTemplatePrompt: Prompt, filledText: string) => {
    setIsFillTemplateModalOpen(false); // Close template fill modal first
    await updatePromptStats(originalTemplatePrompt); // Update stats for the original template
    
    if (originatingAIFlow) {
      setOriginatingAIFlow(false); // Reset the flag
      setPromptForAIGeneration(originalTemplatePrompt); // The original prompt whose template was filled
      setInputTextForAIGeneration(filledText); // The text with variables filled
      setAiGeneratedText(null); // Clear previous AI text
      setAiGenerationError(null); // Clear previous error
      setIsAIGenerationModalOpen(true); // Open AI generation modal
    } else {
      // This was a normal "Use Template" flow, text is already copied by FillTemplateModal
      // No further action needed here beyond stats update and closing modal
      setTemplateToFill(null);
    }
  }, [originatingAIFlow, updatePromptStats]);


  const handleViewHistory = async (originalPromptId: string) => {
    const versions = await getPromptsByOriginalIdDB(originalPromptId);
    const latestVersion = versions.sort((a,b) => b.version - a.version)[0];
    setHistoryPromptVersions(versions);
    setHistoryPromptTitle(latestVersion?.title || "Prompt");
    setIsHistoryModalOpen(true);
  };

  const handleAddFolder = async (folderName: string, parentId: string | null) => {
    const newFolder: Folder = { 
      id: generateUUID(), 
      name: folderName, 
      parentId,
      isDeletable: true,
      isRenamable: true,
    };
    await addFolderDB(newFolder);
    setFolders(prev => [...prev, newFolder]);
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const folderToRename = folders.find(f => f.id === folderId);
    if (folderToRename && folderToRename.isRenamable) {
        const siblings = folders.filter(s => s.parentId === folderToRename.parentId && s.id !== folderId);
        if (siblings.some(s => s.name.toLowerCase() === newName.toLowerCase())) {
          alert(`A folder named "${newName}" already exists in this location.`);
          return;
        }
      const updatedFolder = { ...folderToRename, name: newName };
      await updateFolderDB(updatedFolder);
      setFolders(prev => prev.map(f => (f.id === folderId ? updatedFolder : f)));
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folderToDelete = folders.find(f => f.id === folderId);
    if (!folderToDelete || !folderToDelete.isDeletable) {
      alert("This folder cannot be deleted.");
      return;
    }
    const hasChildFolders = folders.some(f => f.parentId === folderId);
    if (hasChildFolders) {
      alert("Please delete all subfolders before deleting this folder.");
      return;
    }
    if (!checkFolderBranchEmptyLogic(folderId, latestPrompts, folders)) {
      alert("Folder is not empty. Please remove or move prompts before deleting.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete the folder "${folderToDelete.name}"? This action cannot be undone.`)) {
      await deleteFolderDB(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId(ALL_PROMPTS_FOLDER_ID);
      }
    }
  };
  
  const isFolderBranchEmptyCallback = useCallback((folderId: string) => {
    return checkFolderBranchEmptyLogic(folderId, latestPrompts, folders);
  }, [latestPrompts, folders]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    latestPrompts.forEach(prompt => prompt.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [latestPrompts]);

  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = latestPrompts;
    if (selectedFolderId === ALL_PROMPTS_FOLDER_ID) { /* Show all */ }
    else if (selectedFolderId === null && defaultFolderId) { 
      filtered = filtered.filter(p => p.folderId === defaultFolderId);
    } else if (selectedFolderId) {
      const branchFolderIds = getAllFolderIdsInBranch(selectedFolderId, folders);
      filtered = filtered.filter(p => p.folderId !== null && branchFolderIds.includes(p.folderId));
    } else if (selectedFolderId === null && !defaultFolderId) {
        // This case should ideally not be reached if defaultFolderId is always available
        // but as a fallback, show prompts with no folderId explicitly set.
        filtered = filtered.filter(p => p.folderId === null); 
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lowerSearchTerm) ||
        p.description.toLowerCase().includes(lowerSearchTerm) ||
        p.promptText.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }
    return [...filtered].sort((a, b) => {
      switch (currentSortOption) {
        case SortOption.NAME_ASC: return a.title.localeCompare(b.title);
        case SortOption.NAME_DESC: return b.title.localeCompare(a.title);
        case SortOption.MOST_USED: return b.timesUsed - a.timesUsed;
        case SortOption.RECENTLY_USED:
          if (!a.lastUsedAt && !b.lastUsedAt) return 0;
          if (!a.lastUsedAt) return 1; if (!b.lastUsedAt) return -1;
          return new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime();
        case SortOption.DATE_CREATED_ASC: return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case SortOption.DATE_CREATED_DESC: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: // Default to recently used
          if (!a.lastUsedAt && !b.lastUsedAt) return 0;
          if (!a.lastUsedAt) return 1; if (!b.lastUsedAt) return -1;
          return new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime();
      }
    });
  }, [latestPrompts, selectedFolderId, defaultFolderId, folders, searchTerm, selectedTag, currentSortOption]);

  useEffect(() => { setCurrentPage(1); }, [selectedFolderId, searchTerm, selectedTag, currentSortOption]);

  const totalPages = useMemo(() => Math.ceil(filteredAndSortedPrompts.length / PROMPTS_PER_PAGE), [filteredAndSortedPrompts.length]);
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * PROMPTS_PER_PAGE;
    return filteredAndSortedPrompts.slice(startIndex, startIndex + PROMPTS_PER_PAGE);
  }, [filteredAndSortedPrompts, currentPage]);


  // --- AI Generation Handlers ---
  const handleTriggerAIGeneration = useCallback((prompt: Prompt) => {
    const variables = extractVariables(prompt.promptText);
    setAiGeneratedText(null); // Clear previous results
    setAiGenerationError(null); // Clear previous error
    
    if (variables.length > 0) {
      setTemplateToFill(prompt);
      setOriginatingAIFlow(true); // Signal that FillTemplateModal is part of AI flow
      setIsFillTemplateModalOpen(true);
    } else {
      // No template variables, proceed directly to AI generation modal
      setPromptForAIGeneration(prompt);
      setInputTextForAIGeneration(prompt.promptText);
      setIsAIGenerationModalOpen(true);
    }
  }, []);

  const handleExecuteAIGeneration = useCallback(async (textToGenerateFrom: string) => {
    if (!promptForAIGeneration) {
        setAiGenerationError("Cannot generate AI text: No base prompt selected.");
        return; 
    }

    setIsAIGenerating(true);
    setAiGeneratedText(null);
    setAiGenerationError(null);
    try {
      // Use the new Ollama utility function
      const generatedText = await generateTextWithOllama(textToGenerateFrom);
      setAiGeneratedText(generatedText);
      // Optionally update usage stats for the prompt used for generation
      await updatePromptStats(promptForAIGeneration);
    } catch (error: any) {
      console.error("AI Generation failed (Ollama):", error);
      // The ollamaApi.ts should have already alerted the user for specific errors.
      // Here, we set the error message for display in the AIGenerationModal.
      setAiGenerationError(error.message || "An unknown error occurred during AI generation with Ollama.");
    } finally {
      setIsAIGenerating(false);
    }
  }, [promptForAIGeneration, updatePromptStats]);

  const handleCloseAIGenerationModal = useCallback(() => {
    setIsAIGenerationModalOpen(false);
    setPromptForAIGeneration(null);
    setInputTextForAIGeneration('');
    setAiGeneratedText(null);
    setIsAIGenerating(false);
    setAiGenerationError(null);
  }, []);

  // --- Import/Export Handlers ---
  const handleExportData = async () => {
    setIsProcessingData(true);
    try {
      const promptsToExport = await getAllPromptsDB();
      const foldersToExport = await getAllFoldersDB();
      const exportData: ExportData = {
        prompts: promptsToExport,
        folders: foldersToExport,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `ai-prompt-manager-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Check console for details.');
    } finally {
      setIsProcessingData(false);
    }
  };

  const handleImportDataTrigger = () => {
    if (importFileRef.current) {
      importFileRef.current.click();
    }
  };

  const handleImportFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const confirmation = window.confirm(
      "WARNING: Importing data will replace ALL current prompts and folders. This action CANNOT BE UNDONE. Are you sure?"
    );
    if (!confirmation) {
       if (importFileRef.current) importFileRef.current.value = ''; 
      return;
    }
    setIsProcessingData(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        const importedData = JSON.parse(jsonString) as ExportData;
        if (!importedData || !Array.isArray(importedData.prompts) || !Array.isArray(importedData.folders)) {
          throw new Error('Invalid file format.');
        }
        await clearAllPromptsDB();
        await clearAllFoldersDB();
        for (const folder of importedData.folders) await addFolderDB(folder);
        for (const prompt of importedData.prompts) await addPromptDB(prompt);
        alert('Data imported successfully! Reloading data.');
        await loadData("after import"); 
      } catch (error: any) {
        alert(`Failed to import data: ${error.message}`);
        console.error('Import error:', error);
      } finally {
        setIsProcessingData(false);
        if (importFileRef.current) importFileRef.current.value = ''; 
      }
    };
    reader.onerror = () => {
      alert('Failed to read the import file.');
      setIsProcessingData(false);
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsText(file);
  };


  if (isLoading || isProcessingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900">
        <div className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">
          {isProcessingData ? 'Processing Data...' : 'Loading Prompts...'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-100 dark:bg-neutral-900">
      <Header 
        onAddPrompt={handleAddPromptClick} 
        onToggleHelp={() => setIsHelpModalOpen(true)}
        onExportData={handleExportData}
        onImportDataTrigger={handleImportDataTrigger}
      />
      <input type="file" accept=".json" ref={importFileRef} onChange={handleImportFileSelect} style={{ display: 'none' }} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          hierarchicalFolders={hierarchicalFolders}
          allFolders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onAddFolder={handleAddFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          isFolderBranchEmpty={isFolderBranchEmptyCallback}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Search and Filter Controls */}
            <div className="relative w-full sm:max-w-xs">
              <input type="search" placeholder="Search prompts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100" />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {allTags.length > 0 && (
                <div className="relative w-full sm:w-auto">
                  <select value={selectedTag || ''} onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="w-full appearance-none pl-3 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                    <option value="">All Tags</option>
                    {allTags.map(tag => (<option key={tag} value={tag}>{tag}</option>))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><TagIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" /></div>
                </div>
              )}
              <div className="relative w-full sm:w-auto">
                <select value={currentSortOption} onChange={(e) => setCurrentSortOption(e.target.value as SortOption)}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
                  {Object.entries(SORT_OPTIONS_MAP).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                </select>
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" /></div>
              </div>
            </div>
          </div>

          {paginatedPrompts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedPrompts.map(prompt => (
                  <PromptTile
                    key={prompt.id}
                    prompt={prompt}
                    onCopy={handleCopyOrUseTemplate}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onViewHistory={handleViewHistory}
                    onGenerateWithAI={handleTriggerAIGeneration} 
                    hasMultipleVersions={(promptVersionsCount[prompt.originalPromptId] || 1) > 1}
                  />
                ))}
              </div>
              {totalPages > 1 && (<PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />)}
            </>
          ) : ( 
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No prompts found</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {searchTerm || selectedTag || (selectedFolderId && selectedFolderId !== ALL_PROMPTS_FOLDER_ID) ? "Try adjusting your search or filters, or " : "Get started by "}
                <button onClick={handleAddPromptClick} className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">adding a new prompt</button>.
              </p>
            </div>
          )}
        </main>
      </div>

      {isPromptModalOpen && defaultFolderId && (
        <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={promptToEdit ? 'Edit Prompt (New Version)' : 'Add New Prompt'}>
          <PromptForm promptToEdit={promptToEdit} folders={folders} onSave={handleSavePrompt} onClose={() => { setIsPromptModalOpen(false); setPromptToEdit(null); }} defaultFolderId={defaultFolderId} />
        </Modal>
      )}

      {isHistoryModalOpen && (<VersionHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} promptVersions={historyPromptVersions} originalPromptTitle={historyPromptTitle} />)}
      {isHelpModalOpen && (<HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />)}

      {isFillTemplateModalOpen && templateToFill && (
        <FillTemplateModal
          isOpen={isFillTemplateModalOpen}
          onClose={() => { setIsFillTemplateModalOpen(false); setTemplateToFill(null); setOriginatingAIFlow(false); }}
          templatePrompt={templateToFill}
          onGenerateAndCopy={handleTemplateCompleted} 
        />
      )}

      {isAIGenerationModalOpen && promptForAIGeneration && (
        <AIGenerationModal
          isOpen={isAIGenerationModalOpen}
          onClose={handleCloseAIGenerationModal}
          promptTitle={promptForAIGeneration.title}
          inputText={inputTextForAIGeneration}
          generatedText={aiGeneratedText}
          isGenerating={isAIGenerating}
          onGenerate={handleExecuteAIGeneration}
          errorMessage={aiGenerationError}
        />
      )}
    </div>
  );
};

export default App;