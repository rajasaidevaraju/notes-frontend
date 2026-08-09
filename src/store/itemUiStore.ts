import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContentKey } from "@/types/Types";

interface ItemUiState {
  /**
   * Keyed by ContentKey, not by bare id: notes, checklists and trackers each
   * have their own id sequence, so a numeric key made `note-3` and `tracker-3`
   * share one collapsed/expanded flag.
   */
  minimizedItems: Record<string, boolean>;
  toggleItemMinimize: (key: ContentKey) => void;
  setItemMinimize: (key: ContentKey, minimized: boolean) => void;
}

// Renamed from the old numeric-keyed "note-ui-sync" store; persisted state under
// the previous name is stale by definition and is simply ignored.
const storeName = "item-ui-sync";
const channel = typeof window !== "undefined" ? new BroadcastChannel(storeName) : null;

export const useItemUiStore = create<ItemUiState>()(
  persist(
    (set) => {
      const apply = (key: ContentKey, minimized: (prev: boolean) => boolean) =>
        set((state) => {
          const next = {
            minimizedItems: {
              ...state.minimizedItems,
              [key]: minimized(state.minimizedItems[key] ?? false),
            },
          };
          // Other open tabs mirror the change; BroadcastChannel does not echo to
          // the sender, so this cannot loop.
          channel?.postMessage(next);
          return next;
        });

      return {
        minimizedItems: {},
        toggleItemMinimize: (key) => apply(key, (prev) => !prev),
        setItemMinimize: (key, minimized) => apply(key, () => minimized),
      };
    },
    { name: storeName }
  )
);

if (channel) {
  channel.onmessage = (event) => {
    useItemUiStore.setState(event.data);
  };
}
