import { create } from 'zustand';
import { ContentKey, ContentType, contentKey } from '@/types/Types';

export type ContentTab = 'all' | 'hidden' | 'archived' | 'accounts';
export type TagMatchMode = 'all' | 'any';

export interface SelectedItem {
  id: number;
  type: ContentType;
}

interface ContentUiState {
  selectedContent: Map<ContentKey, SelectedItem>;
  searchQuery: string;
  hiddenUnlocked: boolean;
  activeTab: ContentTab;
  tagFilter: number[];
  tagMatchMode: TagMatchMode;
  onPinUnlocked: (() => void) | null;

  setSearchQuery: (query: string) => void;
  setHiddenUnlocked: (unlocked: boolean) => void;
  setActiveTab: (tab: ContentTab) => void;
  setTagFilter: (tagIds: number[]) => void;
  toggleTagFilter: (tagId: number) => void;
  clearTagFilter: () => void;
  setTagMatchMode: (mode: TagMatchMode) => void;
  toggleSelectContent: (item: SelectedItem) => void;
  clearSelectedContent: () => void;
  requestPin: (onUnlocked: () => void) => void;
  clearPinRequest: () => void;
}

export const useContentStore = create<ContentUiState>((set) => ({
  selectedContent: new Map(),
  searchQuery: '',
  hiddenUnlocked: false,
  activeTab: 'all',
  tagFilter: [],
  tagMatchMode: 'all',
  onPinUnlocked: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setHiddenUnlocked: (unlocked) =>
    set((state) => ({
      hiddenUnlocked: unlocked,
      activeTab: unlocked ? state.activeTab : (state.activeTab === 'hidden' ? 'all' : state.activeTab),
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTagFilter: (tagIds) => set({ tagFilter: tagIds }),
  toggleTagFilter: (tagId) =>
    set((state) => ({
      tagFilter: state.tagFilter.includes(tagId)
        ? state.tagFilter.filter((id) => id !== tagId)
        : [...state.tagFilter, tagId],
    })),
  clearTagFilter: () => set({ tagFilter: [] }),
  setTagMatchMode: (mode) => set({ tagMatchMode: mode }),

  toggleSelectContent: (item) =>
    set((state) => {
      const key = contentKey(item);
      const selectedContent = new Map(state.selectedContent);
      if (!selectedContent.delete(key)) selectedContent.set(key, item);
      return { selectedContent };
    }),

  clearSelectedContent: () => set({ selectedContent: new Map() }),
  requestPin: (onUnlocked) => set({ onPinUnlocked: onUnlocked }),
  clearPinRequest: () => set({ onPinUnlocked: null }),
}));
