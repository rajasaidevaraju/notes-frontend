import { create } from 'zustand';
import { ContentType } from '@/types/Types';

interface ContentUiState {
  selectedContentKeys: Set<string>;
  searchQuery: string;
  /**
   * Whether the hidden section is unlocked and on screen. Lives here rather than
   * in component state so the global 401 handler can lock it back down.
   */
  hiddenUnlocked: boolean;

  setSearchQuery: (query: string) => void;
  setHiddenUnlocked: (unlocked: boolean) => void;
  toggleSelectContent: (id: number, type: ContentType) => void;
  clearSelectedContent: () => void;
}

export const useContentStore = create<ContentUiState>((set) => ({
  selectedContentKeys: new Set(),
  searchQuery: '',
  hiddenUnlocked: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setHiddenUnlocked: (unlocked) => set({ hiddenUnlocked: unlocked }),

  toggleSelectContent: (id, type) =>
    set((state) => {
      const key = `${type}-${id}`;
      const newSelectedKeys = new Set(state.selectedContentKeys);
      if (newSelectedKeys.has(key)) {
        newSelectedKeys.delete(key);
      } else {
        newSelectedKeys.add(key);
      }
      return { selectedContentKeys: newSelectedKeys };
    }),

  clearSelectedContent: () => set({ selectedContentKeys: new Set() }),
}));
