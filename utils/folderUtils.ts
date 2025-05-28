
import { Folder, Prompt, HierarchicalFolder } from '../types';

export const buildFolderHierarchy = (folders: Folder[], parentId: string | null = null, level = 0): HierarchicalFolder[] => {
  return folders
    .filter(folder => folder.parentId === parentId)
    .map(folder => ({
      ...folder,
      level,
      children: buildFolderHierarchy(folders, folder.id, level + 1),
    }))
    .sort((a,b) => a.name.localeCompare(b.name));
};

export const getAllFolderIdsInBranch = (folderId: string, allFolders: Folder[]): string[] => {
  const ids: string[] = [folderId];
  const children = allFolders.filter(f => f.parentId === folderId);
  for (const child of children) {
    ids.push(...getAllFolderIdsInBranch(child.id, allFolders));
  }
  return ids;
};

export const isFolderBranchEmpty = (folderId: string, prompts: Prompt[], allFolders: Folder[]): boolean => {
  const folderIdsToCheck = getAllFolderIdsInBranch(folderId, allFolders);
  return !prompts.some(prompt => prompt.folderId !== null && folderIdsToCheck.includes(prompt.folderId));
};

// Flattens the hierarchy for select dropdowns, prefixing names for clarity
export const getFlattenedFolders = (folders: HierarchicalFolder[]): Folder[] => {
  const flatList: Folder[] = [];
  const traverse = (currentFolders: HierarchicalFolder[], prefix = '') => {
    for (const folder of currentFolders) {
      flatList.push({ ...folder, name: `${prefix}${folder.name}` });
      if (folder.children && folder.children.length > 0) {
        traverse(folder.children, `${prefix}${folder.name} / `);
      }
    }
  };
  traverse(folders);
  return flatList;
};
