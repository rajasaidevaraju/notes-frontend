import { create } from 'zustand';
import { Note, Checklist, ChecklistItem, UnifiedContent, ContentType } from '@/types/Types';
import { handleApiRequest } from '@/utils/api';

interface ContentState {
  content: UnifiedContent[];
  clipboardNote: Note | null;
  hiddenContent: UnifiedContent[];
  selectedContentKeys: Set<string>;
  loading: boolean;
  error: string | null;
  setContent: (content: UnifiedContent[]) => void;
  setClipboardNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addContent: (newContent: UnifiedContent) => void;
  updateContent: (updatedContent: UnifiedContent) => void;
  deleteContent: (id: number, type: ContentType) => void;
  hideHiddenContent: () => void;
  toggleSelectContent: (id: number, type: ContentType) => void;
  clearSelectedContent: () => void;
  deleteSelectedContentApi: () => Promise<void>;
  fetchContentApi: () => Promise<void>;
  fetchHiddenContentApi: () => Promise<void>;
  logoutApi: () => Promise<void>;
  submitPinApi: (pin: string) => Promise<void>;
  addNoteApi: (title: string, content: string) => Promise<void>;
  addChecklistApi: (title: string) => Promise<void>;
  updateNoteApi: (note: Note) => Promise<void>;
  updateChecklistApi: (checklist: Checklist) => Promise<void>;
  deleteNoteApi: (id: number) => Promise<void>;
  deleteChecklistApi: (id: number) => Promise<void>;
  addChecklistItemApi: (checklistId: number, content: string) => Promise<void>;
  updateChecklistItemApi: (checklistId: number, itemId: number, updates: Partial<{ content: string, checked: boolean, position: number }>) => Promise<void>;
  deleteChecklistItemApi: (checklistId: number, itemId: number) => Promise<void>;
  pasteToClipboardNoteApi: () => Promise<void>;
  CheckAuthStatusApi: () => Promise<boolean>;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  hiddenContent: [],
  clipboardNote: null,
  selectedContentKeys: new Set(),
  loading: false,
  error: null,

  setContent: (content) => set({ content }),
  setClipboardNote: (note) => set({ clipboardNote: note }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addContent: (newContent) => set((state) => ({ content: [newContent, ...state.content] })),

  updateContent: (updatedContent) =>
    set((state) => {
      if (updatedContent.type === 'note' && updatedContent.title === CLIPBOARD_NOTE_TITLE) {
        return { clipboardNote: updatedContent as Note };
      }

      const isHidden = updatedContent.hidden;

      if (isHidden) {
        const isAlreadyHidden = state.hiddenContent.some(c => c.id === updatedContent.id && c.type === updatedContent.type);

        if (state.hiddenContent.length === 0) {
          return { content: state.content.filter((c) => !(c.id === updatedContent.id && c.type === updatedContent.type)) };
        }
        return {
          content: state.content.filter((c) => !(c.id === updatedContent.id && c.type === updatedContent.type)),
          hiddenContent: isAlreadyHidden
            ? state.hiddenContent.map(c =>
              (c.id === updatedContent.id && c.type === updatedContent.type) ? updatedContent : c
            )
            : [...state.hiddenContent, updatedContent],
        };
      }
      else if (!isHidden && state.hiddenContent.some(c => c.id === updatedContent.id && c.type === updatedContent.type)) {
        return {
          hiddenContent: state.hiddenContent.filter((c) => !(c.id === updatedContent.id && c.type === updatedContent.type)),
          content: [updatedContent, ...state.content],
        };
      }
      else {
        return {
          content: state.content.map((c) =>
            (c.id === updatedContent.id && c.type === updatedContent.type) ? updatedContent : c
          ),
          hiddenContent: state.hiddenContent.map((c) =>
            (c.id === updatedContent.id && c.type === updatedContent.type) ? updatedContent : c
          ),
        };
      }
    }),

  deleteContent: (id, type) =>
    set((state) => {
      return {
        content: state.content.filter((c) => !(c.type === type && c.id === id)),
        hiddenContent: state.hiddenContent.filter((c) => !(c.type === type && c.id === id)),
        selectedContentKeys: new Set(),
      };
    }),

  hideHiddenContent: () => {
    set(() => ({ hiddenContent: [] }))
    try {
      get().logoutApi();
    } catch {
      // do nothing
    }
  },

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

  deleteSelectedContentApi: async () => {
    const selectedKeys = Array.from(get().selectedContentKeys);
    if (selectedKeys.length === 0) return;

    const contentToDelete = selectedKeys.map(key => {
      const [type, idStr] = key.split('-');
      return { id: Number(idStr), type };
    });

    set({ loading: true, error: null });
    await handleApiRequest<{ message: string }>(
      () =>
        fetch('/api/content/batch', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: contentToDelete }),
        }),
      () => {
        set((state) => ({
          loading: false,
          content: state.content.filter((c) => !state.selectedContentKeys.has(`${c.type}-${c.id}`)),
          hiddenContent: state.hiddenContent.filter((c) => !state.selectedContentKeys.has(`${c.type}-${c.id}`)),
          selectedContentKeys: new Set(),
        }));
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenContent: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to delete items: ${error}`, loading: false });
        }
      }
    );
  },

  fetchContentApi: async () => {
    set({ loading: true, error: null });

    await handleApiRequest<UnifiedContent[]>(
      () => fetch('/api/content'),
      (allContent) => {
        const regularContent = allContent.filter(item => !(item.type === 'note' && item.title === CLIPBOARD_NOTE_TITLE));
        const clipboardNote = allContent.find(item => item.type === 'note' && item.title === CLIPBOARD_NOTE_TITLE) as Note || null;
        set({ content: regularContent, clipboardNote, loading: false });
      },
      (error) => set({ error, loading: false })
    );
  },

  fetchHiddenContentApi: async () => {
    set({ loading: true, error: null });
    await handleApiRequest<UnifiedContent[]>(
      () => fetch('/api/content/hidden', {
        method: 'GET',
        credentials: 'include'
      }),
      (hiddenContent) => { set({ hiddenContent: hiddenContent, loading: false }); },
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
      async () => { set({ loading: false }); },
      (error) => set({ error: `Login failed: ${error}`, loading: false })
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
      async () => { set({ loading: false }); },
      (error) => set({ error: `Logout failed: ${error}`, loading: false })
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
      (addedNote: any) => {
        set({ loading: false });
        const transformedNote: Note = {
          ...addedNote,
          type: 'note',
          pinned: Boolean(addedNote.pinned),
          hidden: Boolean(addedNote.hidden)
        };
        get().addContent(transformedNote);
      },
      (error) => set({ error: `Failed to add note: ${error}`, loading: false })
    );
  },

  addChecklistApi: async (title) => {
    set({ loading: true, error: null });
    await handleApiRequest<Checklist>(
      () =>
        fetch(`/api/checklists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }),
      (addedChecklist: any) => {
        set({ loading: false });
        const transformedChecklist: Checklist = {
          ...addedChecklist,
          type: 'checklist',
          pinned: Boolean(addedChecklist.pinned),
          hidden: Boolean(addedChecklist.hidden),
          items: (addedChecklist.items || []).map((item: any) => ({
            ...item,
            checked: Boolean(item.checked)
          }))
        };
        get().addContent(transformedChecklist);
      },
      (error) => set({ error: `Failed to add checklist: ${error}`, loading: false })
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
      (updatedNote: any) => {
        set({ loading: false });
        const transformedNote: Note = {
          ...updatedNote,
          type: 'note',
          pinned: Boolean(updatedNote.pinned),
          hidden: Boolean(updatedNote.hidden)
        };
        get().updateContent(transformedNote);
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenContent: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to update note: ${error}`, loading: false });
        }
      }
    );
  },

  updateChecklistApi: async (checklist: Checklist) => {
    const { id, title, items, pinned, hidden } = checklist;
    set({ loading: true, error: null });

    await handleApiRequest<Checklist>(
      () => {
        return fetch(`/api/checklists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, items, pinned, hidden }),
        });
      },
      (updatedChecklist: any) => {
        set({ loading: false });

        const transformedChecklist: Checklist = {
          ...updatedChecklist,
          type: 'checklist',
          pinned: Boolean(updatedChecklist.pinned),
          hidden: Boolean(updatedChecklist.hidden),
          items: (updatedChecklist.items || []).map((item: any) => ({
            ...item,
            checked: Boolean(item.checked)
          }))
        };

        get().updateContent(transformedChecklist);
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenContent: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to update checklist: ${error}`, loading: false });
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
        get().deleteContent(id, 'note');
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenContent: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to delete note: ${error}`, loading: false });
        }
      }
    );
  },

  deleteChecklistApi: async (id) => {
    set({ loading: true, error: null });

    await handleApiRequest<void>(
      () =>
        fetch(`/api/checklists/${id}`, {
          method: 'DELETE',
        }),
      () => {
        set({ loading: false });
        get().deleteContent(id, 'checklist');
      },
      (error, status) => {
        if (status === 403) {
          set({ hiddenContent: [], error: 'Session expired.', loading: false });
        } else {
          set({ error: `Failed to delete checklist: ${error}`, loading: false });
        }
      }
    );
  },

  addChecklistItemApi: async (checklistId, content) => {
    await handleApiRequest<ChecklistItem>(
      () => fetch(`/api/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }),
      (addedItem) => {
        set((state) => ({
          content: state.content.map(item =>
            (item.type === 'checklist' && item.id === checklistId)
              ? { ...item, items: [...item.items, addedItem], updatedAt: new Date().toISOString() }
              : item
          )
        }));
      },
      (error) => set({ error: `Failed to add item: ${error}` })
    );
  },

  updateChecklistItemApi: async (checklistId, itemId, updates) => {
    await handleApiRequest<ChecklistItem>(
      () => fetch(`/api/checklists/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
      (updatedContent) => {
        set((state) => ({
          content: state.content.map(item =>
            (item.type === 'checklist' && item.id === checklistId)
              ? {
                ...item,
                items: item.items.map((i: ChecklistItem) => i.id === itemId ? updatedContent : i),
                updatedAt: new Date().toISOString()
              }
              : item
          )
        }));
      },
      (error) => set({ error: `Failed to update item: ${error}` })
    );
  },

  deleteChecklistItemApi: async (checklistId, itemId) => {
    await handleApiRequest<void>(
      () => fetch(`/api/checklists/items/${itemId}`, {
        method: 'DELETE',
      }),
      () => {
        set((state) => ({
          content: state.content.map(item =>
            (item.type === 'checklist' && item.id === checklistId)
              ? {
                ...item,
                items: item.items.filter((i: ChecklistItem) => i.id !== itemId),
                updatedAt: new Date().toISOString()
              }
              : item
          )
        }));
      },
      (error) => set({ error: `Failed to delete item: ${error}` })
    );
  },

  CheckAuthStatusApi: async () => {
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
      (error) => set({ error: `Login failed: ${error}`, loading: false }))
    return isLoggedIn;
  },

  pasteToClipboardNoteApi: async () => {
    set({ error: null });
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
        set({ error: 'Clipboard API not supported or permission denied.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error
        ? `Failed to read clipboard: ${err.message}. Ensure you have granted permission.`
        : 'Failed to read clipboard. Ensure you have granted permission.';
      set({ error: message })
    }
  }
}));