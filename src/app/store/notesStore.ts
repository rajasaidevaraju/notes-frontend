import { create } from 'zustand';
import { Note } from '@/types/Notes';

interface NotesState {
  notes: Note[];
  clipboardNote: Note | null;
  selectedNoteIds: Set<number>;
  loading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  setClipboardNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNote: (note: Note) => void;
  updateNote: (updatedNote: Note) => void;
  deleteNote: (id: number) => void; // This will likely be used internally by batch delete now
  toggleSelectNote: (id: number) => void;
  clearSelectedNotes: () => void;
  deleteSelectedNotes: () => Promise<void>; // This will use the batch API
  // Async actions
  fetchNotes: () => Promise<void>;
  addNoteApi: (title: string, content: string) => Promise<void>;
  updateNoteApi: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
  deleteNoteApi: (id: number) => Promise<void>; // Kept for single delete fallback or other uses
  pasteToClipboardNoteApi: () => Promise<void>;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
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
    get().setError(null);
    const selectedIds = Array.from(get().selectedNoteIds);
    if (selectedIds.length === 0) {
      return;
    }

    try {
      // Use the new batch delete API endpoint
      const response = await fetch('/api/notes/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // If the batch delete is successful, update the store's notes and clear selections
      // The API should return which IDs were successfully deleted or a success message.
      // For simplicity, we assume all requested IDs were deleted on success.
      set((state) => ({
        notes: state.notes.filter((note) => !selectedIds.includes(note.id)),
        selectedNoteIds: new Set(), // Clear all selected notes
      }));

      // You could also log a success message from the API if it returns one
      const successData = await response.json(); // If your batch delete returns JSON
      console.log(successData.message);

    } catch (err: any) {
      get().setError(`Failed to delete selected notes: ${err.message}`);
      console.error('Error deleting selected notes:', err);
    }
  },

  // Async API actions
  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const allNotes: Note[] = await response.json();
      const regularNotes = allNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE);
      const clipboardNote = allNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;
      set({ notes: regularNotes, clipboardNote, loading: false });
    } catch (err: any) {
      set({ error: `Failed to fetch notes: ${err.message}`, loading: false });
      console.error('Error fetching notes:', err);
    }
  },

  addNoteApi: async (title, content) => {
    get().setError(null);
    try {
      const response = await fetch(`/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const addedNote: Note = await response.json();
      get().addNote(addedNote);
    } catch (err: any) {
      get().setError(`Failed to add note: ${err.message}`);
      console.error('Error adding note:', err);
      throw err;
    }
  },

  updateNoteApi: async (id, title, content, pinned) => {
    get().setError(null);
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, pinned }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const updatedNote: Note = await response.json();
      get().updateNote(updatedNote);
    } catch (err: any) {
      get().setError(`Failed to update note: ${err.message}`);
      console.error('Error updating note:', err);
      throw err;
    }
  },

  deleteNoteApi: async (id) => {
    get().setError(null);
    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      get().deleteNote(id);
    } catch (err: any) {
      get().setError(`Failed to delete note: ${err.message}`);
      console.error('Error deleting note:', err);
      throw err;
    }
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
        await get().updateNoteApi(clipboardNote.id, clipboardNote.title, text, clipboardNote.pinned);
      } else {
        get().setError('Clipboard API not supported or permission denied. Please ensure your browser supports it and you have granted permission.');
        console.warn('Clipboard API (readText) not supported or permission denied.');
      }
    } catch (err: any) {
      get().setError(`Failed to read clipboard: ${err.message}. Ensure you have granted permission.`);
      console.error('Error reading clipboard for paste:', err);
    }
  },
}));