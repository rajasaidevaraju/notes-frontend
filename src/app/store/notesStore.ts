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
  toggleSelectNote: (id: number) => void;
  clearSelectedNotes: () => void;
  deleteSelectedNotes: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  fetchHiddenNotes: (pin:string) => Promise<void>;
  addNoteApi: (title: string, content: string) => Promise<void>;
  updateNoteApi: (id: number, title: string, content: string, pinned: boolean, hidden: boolean) => Promise<void>;
  deleteNoteApi: (id: number) => Promise<void>;
  pasteToClipboardNoteApi: () => Promise<void>;
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
      return {
        notes: state.notes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        ),
      };
    }),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      selectedNoteIds: new Set(
        [...state.selectedNoteIds].filter((selectedId) => selectedId !== id)
      ),
    })),
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

    await handleApiRequest<{ message: string }>(
      () =>
        fetch('/api/notes/batch', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        }),
      () => {
        set((state) => ({
          notes: state.notes.filter((note) => !selectedIds.includes(note.id)),
          selectedNoteIds: new Set(),
        }));
      },
      (error) => get().setError(`Failed to delete selected notes: ${error}`)
    );
  },

  fetchNotes: async () => {
    set({ loading: true, error: null });

    await handleApiRequest<Note[]>(
      () => fetch('/api/notes'),
      (allNotes) => {
        const regularNotes = allNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE);
        const clipboardNote = allNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;
        set({ notes: regularNotes, clipboardNote, loading: false });
      },
      (error) => set({ error, loading: false })
    );
  },

  fetchHiddenNotes:async(pin:string)=>{
    set({ loading: true, error: null });
    await handleApiRequest<Note[]>(
      () => fetch('/api/notes/hidden', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pin}`,
        'Content-Type': 'application/json'
      }
    }),
      (hiddenNotes) => {set({ hiddenNotes, loading: false });},
      (error) => set({ error, loading: false })
    );
  },

  addNoteApi: async (title, content) => {
    get().setError(null);
    await handleApiRequest<Note>(
      () =>
        fetch(`/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        }),
      (addedNote) => get().addNote(addedNote),
      (error) => get().setError(`Failed to add note: ${error}`)
    );
  },

  updateNoteApi: async (id, title, content, pinned, hidden) => {
    get().setError(null);
    await handleApiRequest<Note>(
      () =>
        fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, pinned, hidden }),
        }),
      (updatedNote) => get().updateNote(updatedNote),
      (error) => get().setError(`Failed to update note: ${error}`)
    );
  },

  deleteNoteApi: async (id) => {
    get().setError(null);
    await handleApiRequest<void>(
      () =>
        fetch(`/api/notes/${id}`, {
          method: 'DELETE',
        }),
      () => get().deleteNote(id),
      (error) => get().setError(`Failed to delete note: ${error}`)
    );
  },

  pasteToClipboardNoteApi: async () => {
    get().setError(null);
    const clipboardNote = get().clipboardNote;
    if (!clipboardNote) {
      get().setError('Clipboard note not found. Please refresh the page.');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        await get().updateNoteApi(clipboardNote.id, clipboardNote.title, text, clipboardNote.pinned, false);
      } else {
        get().setError('Clipboard API not supported or permission denied.');
        console.warn('Clipboard API not supported or permission denied.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error
        ? `Failed to read clipboard: ${err.message}. Ensure you have granted permission.`
        : 'Failed to read clipboard. Ensure you have granted permission.';
      get().setError(message);
      console.error('Error reading clipboard:', err);
    }
  },
}));
