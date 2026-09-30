import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContentKey } from "@/types/Types";

interface ItemUiState {
  minimizedItems: Record<string, boolean>;
  toggleItemMinimize: (key: ContentKey) => void;
  setItemMinimize: (key: ContentKey, minimized: boolean) => void;
}

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
