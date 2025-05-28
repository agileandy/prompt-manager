
import { openDB, IDBPDatabase, IDBPTransaction } from 'idb';
import { Prompt, Folder, AIPMPRDB } from '../types';
import { generateUUID } from './uuid';
import { DEFAULT_FOLDER_NAME } from '../constants';

const DB_NAME = 'AIPromptManagerDB';
const DB_VERSION = 1;
const PROMPTS_STORE_NAME = 'prompts';
const FOLDERS_STORE_NAME = 'folders';

let dbPromise: Promise<IDBPDatabase<AIPMPRDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<AIPMPRDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<AIPMPRDB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<AIPMPRDB>, oldVersion: number, newVersion: number | null, tx: IDBPTransaction<AIPMPRDB, (typeof PROMPTS_STORE_NAME | typeof FOLDERS_STORE_NAME)[], "versionchange">, event: IDBVersionChangeEvent) {
        console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
        if (!db.objectStoreNames.contains(PROMPTS_STORE_NAME)) {
          const promptsStore = db.createObjectStore(PROMPTS_STORE_NAME, { keyPath: 'id' });
          promptsStore.createIndex('originalPromptId', 'originalPromptId');
          promptsStore.createIndex('folderId', 'folderId');
          promptsStore.createIndex('version', 'version');
          promptsStore.createIndex('createdAt', 'createdAt');
          promptsStore.createIndex('lastUsedAt', 'lastUsedAt');
          promptsStore.createIndex('title', 'title');
        }
        if (!db.objectStoreNames.contains(FOLDERS_STORE_NAME)) {
          const foldersStore = db.createObjectStore(FOLDERS_STORE_NAME, { keyPath: 'id' });
          foldersStore.createIndex('parentId', 'parentId');
          foldersStore.createIndex('name', 'name');
        }
      },
      blocked(currentVersion: number, blockedVersion: number | null, event: IDBVersionChangeEvent) {
        console.error(`IndexedDB open blocked. Current version: ${currentVersion}, Attempted version: ${blockedVersion}. Please close other tabs running this application and refresh.`);
        alert("The application database is blocked by an older version in another tab. Please close other tabs and refresh the page.");
      },
      blocking(this: IDBPDatabase<AIPMPRDB>, currentVersion: number, blockedVersion: number | null, event: IDBVersionChangeEvent) {
        console.warn(`IndexedDB connection (version ${currentVersion}) is blocking an attempt to open version ${blockedVersion}. Closing this blocking connection.`);
        this.close(); 
        alert("The application database needs to upgrade. This tab was blocking it and has closed its database connection. Please refresh the page for the changes to take effect.");
      },
      terminated() {
        console.warn('IndexedDB connection was terminated by the browser.');
        dbPromise = null; 
      }
    }).catch(error => {
      console.error("Failed to open IndexedDB:", error);
      dbPromise = null; 
      throw error; 
    });
  }
  return dbPromise;
};


export const initDefaultFolderDB = async (): Promise<Folder> => {
  const db = await getDB();
  const tx = db.transaction(FOLDERS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(FOLDERS_STORE_NAME);
  let defaultFolder = (await store.getAll()).find(f => f.name === DEFAULT_FOLDER_NAME && f.parentId === null);

  if (!defaultFolder) {
    defaultFolder = {
      id: generateUUID(),
      name: DEFAULT_FOLDER_NAME,
      parentId: null,
      isDeletable: false,
      isRenamable: false,
    };
    await store.add(defaultFolder);
  }
  await tx.done;
  return defaultFolder;
};


// Prompt Functions
export const getAllPromptsDB = async (): Promise<Prompt[]> => {
  const db = await getDB();
  return db.getAll(PROMPTS_STORE_NAME);
};

export const getPromptByIdDB = async (id: string): Promise<Prompt | undefined> => {
  const db = await getDB();
  return db.get(PROMPTS_STORE_NAME, id);
};

export const getPromptsByOriginalIdDB = async (originalPromptId: string): Promise<Prompt[]> => {
  const db = await getDB();
  return db.getAllFromIndex(PROMPTS_STORE_NAME, 'originalPromptId', originalPromptId);
};

export const addPromptDB = async (prompt: Prompt): Promise<string> => {
  const db = await getDB();
  return db.add(PROMPTS_STORE_NAME, prompt);
};

export const updatePromptDB = async (prompt: Prompt): Promise<string> => {
  const db = await getDB();
  return db.put(PROMPTS_STORE_NAME, prompt);
};

export const deletePromptsByOriginalIdDB = async (originalPromptId: string): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(PROMPTS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PROMPTS_STORE_NAME);
  const index = store.index('originalPromptId');
  let cursor = await index.openCursor(originalPromptId);
  while (cursor) {
    await store.delete(cursor.primaryKey); 
    cursor = await cursor.continue();
  }
  await tx.done;
};

export const clearAllPromptsDB = async (): Promise<void> => {
  const db = await getDB();
  await db.clear(PROMPTS_STORE_NAME);
};

// Folder Functions
export const getAllFoldersDB = async (): Promise<Folder[]> => {
  const db = await getDB();
  return db.getAll(FOLDERS_STORE_NAME);
};

export const addFolderDB = async (folder: Folder): Promise<string> => {
  const db = await getDB();
  return db.add(FOLDERS_STORE_NAME, folder);
};

export const updateFolderDB = async (folder: Folder): Promise<string> => {
  const db = await getDB();
  return db.put(FOLDERS_STORE_NAME, folder);
};

export const deleteFolderDB = async (folderId: string): Promise<void> => {
  const db = await getDB();
  await db.delete(FOLDERS_STORE_NAME, folderId);
};

export const getFolderByIdDB = async (id: string): Promise<Folder | undefined> => {
    const db = await getDB();
    return db.get(FOLDERS_STORE_NAME, id);
};

export const clearAllFoldersDB = async (): Promise<void> => {
  const db = await getDB();
  await db.clear(FOLDERS_STORE_NAME);
};
