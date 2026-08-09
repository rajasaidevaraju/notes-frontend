import { create } from 'zustand';
import { ContentKey, ContentType, contentKey } from '@/types/Types';

export type ContentTab = 'all' | 'hidden';

export interface SelectedItem {
  id: number;
  type: ContentType;
}

interface ContentUiState {
  /**
   * Keyed by ContentKey for lookup, but the value keeps the id/type pair so the
   * bulk-delete caller never has to parse a key back apart.
   */
  selectedContent: Map<ContentKey, SelectedItem>;
  searchQuery: string;
  /**
   * Whether the hidden section is unlocked and on screen. Lives here rather than
   * in component state so the global 401 handler can lock it back down.
   */
  hiddenUnlocked: boolean;
  activeTab: ContentTab;

  setSearchQuery: (query: string) => void;
  setHiddenUnlocked: (unlocked: boolean) => void;
  setActiveTab: (tab: ContentTab) => void;
  toggleSelectContent: (item: SelectedItem) => void;
  clearSelectedContent: () => void;
}

export const useContentStore = create<ContentUiState>((set) => ({
  selectedContent: new Map(),
  searchQuery: '',
  hiddenUnlocked: false,
  activeTab: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setHiddenUnlocked: (unlocked) =>
    set((state) => ({
      hiddenUnlocked: unlocked,
      activeTab: unlocked ? state.activeTab : (state.activeTab === 'hidden' ? 'all' : state.activeTab),
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleSelectContent: (item) =>
    set((state) => {
      const key = contentKey(item);
      const selectedContent = new Map(state.selectedContent);
      if (!selectedContent.delete(key)) selectedContent.set(key, item);
      return { selectedContent };
    }),

  clearSelectedContent: () => set({ selectedContent: new Map() }),
}));
