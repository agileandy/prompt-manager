
import { SortOption } from './types';

export const ALL_PROMPTS_FOLDER_ID = 'all_prompts_folder_id';

export const SORT_OPTIONS_MAP: Record<SortOption, string> = {
  [SortOption.NAME_ASC]: 'Name (A-Z)',
  [SortOption.NAME_DESC]: 'Name (Z-A)',
  [SortOption.MOST_USED]: 'Most Used',
  [SortOption.RECENTLY_USED]: 'Recently Used',
  [SortOption.DATE_CREATED_ASC]: 'Date Created (Oldest)',
  [SortOption.DATE_CREATED_DESC]: 'Date Created (Newest)',
};

export const DEFAULT_FOLDER_NAME = "Uncategorized";

export const PROMPTS_PER_PAGE = 12;
