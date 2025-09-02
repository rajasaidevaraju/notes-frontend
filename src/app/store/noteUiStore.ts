"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NoteUiState {
  minimizedNotes: Record<number, boolean>;
  toggleNoteMinimize: (id: number) => void;
  setNoteMinimize: (id: number, minimized: boolean) => void;
}

const storeName="note-ui-sync";
const channel = typeof window !== "undefined" ? new BroadcastChannel(storeName) : null;

export const useNoteUiStore = create<NoteUiState>()(
  persist(
    (set) => ({
      minimizedNotes: {},
      toggleNoteMinimize: (id) => {
        set((state) => {
          const newState = {
            minimizedNotes: {
              ...state.minimizedNotes,
              [id]: !state.minimizedNotes[id],
            },
          };
          channel?.postMessage(newState);
          return newState;
        });
      },
      setNoteMinimize: (id, minimized) => {
        set((state) => {
          const newState = {
            minimizedNotes: { ...state.minimizedNotes, [id]: minimized },
          };
          channel?.postMessage(newState); 
          return newState;
        });
      },
    }),
    {
      name: storeName,
    }
  )
);


if (channel) {
  channel.onmessage = (event) => {
    useNoteUiStore.setState(event.data);
  };
}
