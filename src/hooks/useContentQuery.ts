import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UnifiedContent,
  Note,
  Checklist,
  ChecklistItem,
  Tracker,
  TrackerEntry,
} from '@/types/Types';
import { handleApiRequest } from '@/utils/api';
import { SPECIAL_NOTE_TITLES } from '@/constants';

export const CONTENT_QUERY_KEY = ['content'];
export const HIDDEN_CONTENT_QUERY_KEY = ['content', 'hidden'];
export const SERVER_IP_QUERY_KEY = ['server-ip'];
export const LAN_STATUS_QUERY_KEY = ['lan-status'];
export const AUTH_STATUS_QUERY_KEY = ['auth-status'];

export interface ContentQueryResult {
  allContent: UnifiedContent[];
  regularContent: UnifiedContent[];
  clipboardNote: Note | null;
}

export function useContentQuery() {
  return useQuery<ContentQueryResult>({
    queryKey: CONTENT_QUERY_KEY,
    queryFn: async () => {
      let regularContent: UnifiedContent[] = [];
      let clipboardNote: Note | null = null;
      let allContent: UnifiedContent[] = [];

      await handleApiRequest<UnifiedContent[]>(
        () => fetch('/api/content'),
        (data) => {
          allContent = data;
          regularContent = data.filter(
            (item) => !(item.type === 'note' && item.title === SPECIAL_NOTE_TITLES.CLIPBOARD)
          );
          clipboardNote =
            (data.find(
              (item) => item.type === 'note' && item.title === SPECIAL_NOTE_TITLES.CLIPBOARD
            ) as Note) || null;
        }
      );

      return { allContent, regularContent, clipboardNote };
    },
  });
}

export function useHiddenContentQuery(enabled = false) {
  return useQuery<UnifiedContent[]>({
    queryKey: HIDDEN_CONTENT_QUERY_KEY,
    enabled,
    queryFn: async () => {
      let result: UnifiedContent[] = [];
      await handleApiRequest<UnifiedContent[]>(
        () =>
          fetch('/api/content/hidden', {
            method: 'GET',
            credentials: 'include',
          }),
        (hiddenContent) => {
          result = hiddenContent.map((item) => ({ ...item, hidden: true }));
        }
      );
      return result;
    },
  });
}

export function useServerIpQuery() {
  return useQuery<{ ip: string }>({
    queryKey: SERVER_IP_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/server-ip');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
}

export interface LanStatus {
  enabled: boolean;
  remainingMs: number;
  canManage: boolean;
}

export function useLanStatusQuery() {
  return useQuery<LanStatus>({
    queryKey: LAN_STATUS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/system/lan/status');
      if (!res.ok) throw new Error('Failed to fetch LAN status');
      return res.json();
    },
    refetchInterval: 30000,
  });
}

export function useEnableLanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/system/lan/enable', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to enable LAN sharing');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAN_STATUS_QUERY_KEY });
    },
  });
}

export function useDisableLanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/system/lan/disable', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to disable LAN sharing');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAN_STATUS_QUERY_KEY });
    },
  });
}

export function useAuthStatusQuery() {
  return useQuery<{ loggedIn: boolean }>({
    queryKey: AUTH_STATUS_QUERY_KEY,
    queryFn: async () => {
      let loggedIn = false;
      await handleApiRequest<{ loggedIn: boolean }>(
        () => fetch('/api/auth/status', { method: 'GET', credentials: 'include' }),
        (data) => {
          loggedIn = data.loggedIn;
        }
      );
      return { loggedIn };
    },
  });
}

export function useSubmitPinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pin: string) => {
      await handleApiRequest<{ message: string }>(
        () =>
          fetch('/api/auth', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin }),
          }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await handleApiRequest<{ message: string }>(
        () =>
          fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

// --- CRUD Mutations ---

export function useAddNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      let added: Note | null = null;
      await handleApiRequest<Note>(
        () =>
          fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content }),
          }),
        (note) => {
          added = note;
        }
      );
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Note) => {
      const { id, title, content, pinned, hidden } = note;
      let updated: Note | null = null;
      await handleApiRequest<Note>(
        () =>
          fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, pinned, hidden }),
          }),
        (res) => {
          updated = res;
        }
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await handleApiRequest<void>(
        () => fetch(`/api/notes/${id}`, { method: 'DELETE' }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useAddChecklistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      let added: Checklist | null = null;
      await handleApiRequest<Checklist>(
        () =>
          fetch('/api/checklists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          }),
        (checklist) => {
          added = checklist;
        }
      );
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
    },
  });
}

export function useUpdateChecklistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: Checklist) => {
      const { id, title, items, pinned, hidden } = checklist;
      let updated: Checklist | null = null;
      await handleApiRequest<Checklist>(
        () =>
          fetch(`/api/checklists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, items, pinned, hidden }),
          }),
        (res) => {
          updated = res;
        }
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useDeleteChecklistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await handleApiRequest<void>(
        () => fetch(`/api/checklists/${id}`, { method: 'DELETE' }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useAddTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, unit }: { title: string; unit: string | null }) => {
      let added: Tracker | null = null;
      await handleApiRequest<Tracker>(
        () =>
          fetch('/api/trackers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, unit }),
          }),
        (tracker) => {
          added = tracker;
        }
      );
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
    },
  });
}

export function useUpdateTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tracker, deletedEntryIds }: { tracker: Tracker; deletedEntryIds?: number[] }) => {
      const { id, title, unit, pinned, hidden } = tracker;
      let updated: Tracker | null = null;
      await handleApiRequest<Tracker>(
        () =>
          fetch(`/api/trackers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, unit, pinned, hidden, deletedEntryIds }),
          }),
        (res) => {
          updated = res;
        }
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useAddTrackerEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackerId, value }: { trackerId: number; value: string }) => {
      let added: TrackerEntry | null = null;
      await handleApiRequest<TrackerEntry>(
        () =>
          fetch(`/api/trackers/${trackerId}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
          }),
        (entry) => {
          added = entry;
        }
      );
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useUpdateChecklistItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: number;
      updates: Partial<Pick<ChecklistItem, 'content' | 'checked' | 'position'>>;
    }) => {
      let updated: ChecklistItem | null = null;
      await handleApiRequest<ChecklistItem>(
        () =>
          fetch(`/api/checklists/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }),
        (res) => {
          updated = res;
        }
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useDeleteTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await handleApiRequest<void>(
        () => fetch(`/api/trackers/${id}`, { method: 'DELETE' }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}

export function useBatchDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: number; type: string }>) => {
      await handleApiRequest<{ message: string }>(
        () =>
          fetch('/api/content/batch', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          }),
        () => {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HIDDEN_CONTENT_QUERY_KEY });
    },
  });
}
