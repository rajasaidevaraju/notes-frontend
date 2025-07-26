import { create } from 'zustand';
import { Note } from '@/types/Notes';
import { handleApiRequest } from '@/utils/api';

interface NotesState {
  notes: Note[];
  clipboardNote: Note | null;
  hiddenNotes: Note[];
  selectedNoteIds: Set<number>;
  loading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  setClipboardNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNote: (note: Note) => void;
  updateNote: (updatedNote: Note) => void;
  deleteNote: (id: number) => void;
  hideHiddenNotes: () => void;
  toggleSelectNote: (id: number) => void;
  clearSelectedNotes: () => void;
  deleteSelectedNotes: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  fetchHiddenNotesApi: () => Promise<void>;
  logoutApi:()=>Promise<void>;
  submitPinApi: (pin: string) => Promise<void>;
  addNoteApi: (title: string, content: string) => Promise<void>;
  updateNoteApi: (note: Note) => Promise<void>;
  deleteNoteApi: (id: number) => Promise<void>;
  pasteToClipboardNoteApi: () => Promise<void>;
  CheckAuthStatusApi:()=>Promise<boolean>;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  hiddenNotes: [],
  clipboardNote: null,
  selectedNoteIds: new Set(),
  loading: false,
  error: null,

  setNotes: (notes) => set({ notes }),
  setClipboardNote: (note) => set({ clipboardNote: note }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  
  updateNote: (updatedNote) =>
    set((state) => {
      if (updatedNote.title === CLIPBOARD_NOTE_TITLE) {
        return { clipboardNote: updatedNote };
      }

      if (updatedNote.hidden) {
        
        const isAlreadyHidden = state.hiddenNotes.some(note => note.id === updatedNote.id);

        if(state.hiddenNotes.length==0 ){
          return {notes:state.notes.filter((note) => note.id !== updatedNote.id)};
        }
        return {
          notes: state.notes.filter((note) => note.id !== updatedNote.id),
          hiddenNotes: isAlreadyHidden
            ? state.hiddenNotes.map(note =>
                note.id === updatedNote.id ? updatedNote : note
              )
            : [...state.hiddenNotes, updatedNote],
        };
      } 
      else if (!updatedNote.hidden && state.hiddenNotes.some(note => note.id === updatedNote.id)) {
        return {
          hiddenNotes: state.hiddenNotes.filter((note) => note.id !== updatedNote.id),
          notes: [updatedNote, ...state.notes],
        };
      }
      else {
        return {
          notes: state.notes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          ),
        };
      }
    }),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      hiddenNotes: state.hiddenNotes.filter((note) => note.id !== id), 
      selectedNoteIds: new Set(
        [...state.selectedNoteIds].filter((selectedId) => selectedId !== id)
      ),
    })),

  hideHiddenNotes:()=>{
    set(()=>({hiddenNotes:[]}))
    try{
      get().logoutApi();
    }catch{
      // do nothing
    }
  },

  toggleSelectNote: (id) =>
    set((state) => {
      const newSelectedNoteIds = new Set(state.selectedNoteIds);
      if (newSelectedNoteIds.has(id)) {
        newSelectedNoteIds.delete(id);
      } else {
        newSelectedNoteIds.add(id);
      }
      return { selectedNoteIds: newSelectedNoteIds };
    }),

  clearSelectedNotes: () => set({ selectedNoteIds: new Set() }),

  deleteSelectedNotes: async () => {
    const selectedIds = Array.from(get().selectedNoteIds);
    if (selectedIds.length === 0) return;
    set({ loading: true, error: null });
    await handleApiRequest<{ message: string }>(
      () =>
        fetch('/api/notes/batch', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        }),
      () => {
        set((state) => ({
          loading: false,
          notes: state.notes.filter((note) => !selectedIds.includes(note.id)),
          hiddenNotes: state.hiddenNotes.filter((note) => !selectedIds.includes(note.id)),
          selectedNoteIds: new Set(),
        }));
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenNotes: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to delete notes: ${error}`, loading: false });
        }
      }
    );
  },

  fetchNotes: async () => {
    set({ loading: true, error: null });

    await handleApiRequest<Note[]>(
      () => fetch('/api/notes'),
      (allNotes) => {
        const regularNotes = allNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE && !note.hidden);
        const clipboardNote = allNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;
        set({ notes: regularNotes, clipboardNote, loading: false });
      },
      (error) => set({ error, loading: false })
    );
  },

  fetchHiddenNotesApi: async () => {
    set({ loading: true, error: null });
    await handleApiRequest<Note[]>(
      () => fetch('/api/notes/hidden', {
        method: 'GET',
        credentials: 'include'
      }),
      (hiddenNotes) => { set({ hiddenNotes, loading: false }); },
      (error) => set({ error, loading: false })
    );
  },

  submitPinApi: async (pin: string) => {
  set({ loading: true, error: null });
  await handleApiRequest<{ message: string }>(
    () =>
      fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      }),
    async () => { set({loading: false });},
    (error) => set({ error: `Login failed: ${error}`,loading: false})
    );
  },

  logoutApi: async () => {
  set({ loading: true, error: null });
  await handleApiRequest<{ message: string }>(
    () =>
      fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }),
    async () => { set({loading: false });},
    (error) => set({ error: `Logout failed: ${error}`,loading: false})
    );
  },

  addNoteApi: async (title, content) => {
    set({ loading: true, error: null });
    await handleApiRequest<Note>(
      () =>
        fetch(`/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        }),
      (addedNote) => {set({ loading: false });get().addNote(addedNote)},
      (error) => set({ error:`Failed to add note: ${error}`,loading: false})
    );
  },

  updateNoteApi: async (note: Note) => {
    const { id, title, content, pinned, hidden } = note;
    set({ loading: true, error: null });

    await handleApiRequest<Note>(
      () =>
        fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, pinned, hidden }),
        }),
      (updatedNote) => {
        set({ loading: false });
        get().updateNote(updatedNote);
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenNotes: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to update note: ${error}`, loading: false });
        }
      }
    );
  },


  deleteNoteApi: async (id) => {
    set({ loading: true, error: null });

    await handleApiRequest<void>(
      () =>
        fetch(`/api/notes/${id}`, {
          method: 'DELETE',
        }),
      () => {
        set({ loading: false });
        get().deleteNote(id);
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenNotes: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to delete note: ${error}`, loading: false });
        }
      }
    );
  },

  CheckAuthStatusApi:async()=>{
    set({ loading: true, error: null });
    let isLoggedIn = false;
    await handleApiRequest<{ loggedIn: boolean }>(
      () =>
        fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include',
    }),
    (data) => {
      isLoggedIn = data.loggedIn;
      set({ loading: false });
    },
    (error) => set({ error: `Login failed: ${error}`,loading: false}))
    return isLoggedIn;
  },

  pasteToClipboardNoteApi: async () => {
    set({error: null });
    const clipboardNote = get().clipboardNote;
    if (!clipboardNote) {
      get().setError('Clipboard note not found. Please refresh the page.');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        clipboardNote.content = text;
        await get().updateNoteApi(clipboardNote);
      } else {
        set({ error: 'Clipboard API not supported or permission denied.'});
      }
    } catch (err: unknown) {
      const message = err instanceof Error
        ? `Failed to read clipboard: ${err.message}. Ensure you have granted permission.`
        : 'Failed to read clipboard. Ensure you have granted permission.';
      set({ error: message})
    }
  }
}));