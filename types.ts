
import type { DBSchema } from 'idb';

export interface Prompt {
  id: string; // Unique ID for this specific version
  originalPromptId: string; // ID of the first version of this prompt. For the first version, id === originalPromptId.
  version: number; // Version number, starting from 1
  title: string;
  description: string;
  promptText: string;
  tags: string[];
  folderId: string | null; // ID of the folder it belongs to
  createdAt: string; // ISO date string (when this version was created)
  lastUsedAt: string | null; // ISO date string
  timesUsed: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // ID of the parent folder, or null if it's a root folder
  isDeletable: boolean;
  isRenamable: boolean;
  children?: HierarchicalFolder[]; // transient property for UI, not stored directly in DB as such
  level?: number; // for indentation in dropdowns, transient
}

export interface HierarchicalFolder extends Folder {
  children: HierarchicalFolder[];
  level: number;
}

export enum SortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  MOST_USED = 'most_used',
  RECENTLY_USED = 'recently_used',
  DATE_CREATED_ASC = 'date_created_asc', // Based on the version's createdAt
  DATE_CREATED_DESC = 'date_created_desc', // Based on the version's createdAt
}

// Structure for JSON import/export
export interface ExportData {
  prompts: Prompt[];
  folders: Folder[];
  // Could add app settings/metadata here in the future
}

// Schema for IndexedDB
export interface AIPMPRDB extends DBSchema {
  prompts: {
    key: string; // id of the prompt version
    value: Prompt;
    indexes: {
      originalPromptId: string;
      folderId: string;
      version: number;
      createdAt: string;
      lastUsedAt: string;
      title: string;
    };
  };
  folders: {
    key: string; // id of the folder
    value: Folder;
    indexes: {
      parentId: string;
      name: string;
    };
  };
}
