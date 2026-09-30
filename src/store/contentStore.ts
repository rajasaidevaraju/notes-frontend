import { create } from 'zustand';
import { ContentKey, ContentType, contentKey } from '@/types/Types';

export type ContentTab = 'all' | 'hidden' | 'archived';

export interface SelectedItem {
  id: number;
  type: ContentType;
}

interface ContentUiState {
  selectedContent: Map<ContentKey, SelectedItem>;
  searchQuery: string;
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
