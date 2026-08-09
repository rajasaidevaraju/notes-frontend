import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import {
  UnifiedContent,
  Note,
  Checklist,
  ChecklistItem,
  Tracker,
  TrackerEntry,
  ContentType,
} from '@/types/Types';
import { apiFetch, apiSend } from '@/utils/api';
import { SPECIAL_NOTE_TITLES } from '@/constants';

export const CONTENT_QUERY_KEY = ['content'];
export const HIDDEN_CONTENT_QUERY_KEY = ['content', 'hidden'];
export const SERVER_IP_QUERY_KEY = ['server-ip'];
export const LAN_STATUS_QUERY_KEY = ['lan-status'];
export const AUTH_STATUS_QUERY_KEY = ['auth-status'];

/** Visible list only — a freshly created item is never hidden. */
const AFTER_CREATE = [CONTENT_QUERY_KEY];
/** Anything that can move an item between the two lists must refresh both. */
const AFTER_WRITE = [CONTENT_QUERY_KEY, HIDDEN_CONTENT_QUERY_KEY];
const AFTER_AUTH = [AUTH_STATUS_QUERY_KEY, HIDDEN_CONTENT_QUERY_KEY];

/**
 * Every mutation here does the same thing on success: invalidate the query keys
 * its write could have affected. This wrapper is that shared behaviour.
 */
function useApiMutation<TData, TVars = void>(
  mutationFn: (vars: TVars) => Promise<TData>,
  invalidate: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const queryKey of invalidate) queryClient.invalidateQueries({ queryKey });
    },
  });
}

export interface ContentQueryResult {
  regularContent: UnifiedContent[];
  clipboardNote: Note | null;
}

const isClipboardNote = (item: UnifiedContent): item is Note =>
  item.type === 'note' && item.title === SPECIAL_NOTE_TITLES.CLIPBOARD;

export function useContentQuery() {
  return useQuery<ContentQueryResult>({
    queryKey: CONTENT_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<UnifiedContent[]>('/api/content');
      return {
        regularContent: data.filter((item) => !isClipboardNote(item)),
        clipboardNote: data.find(isClipboardNote) ?? null,
      };
    },
  });
}

export function useHiddenContentQuery(enabled = false) {
  return useQuery<UnifiedContent[]>({
    queryKey: HIDDEN_CONTENT_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const hiddenContent = await apiFetch<UnifiedContent[]>('/api/content/hidden');
      return hiddenContent.map((item) => ({ ...item, hidden: true }));
    },
  });
}

export function useServerIpQuery() {
  return useQuery<{ ip: string }>({
    queryKey: SERVER_IP_QUERY_KEY,
    queryFn: () => apiFetch<{ ip: string }>('/api/server-ip'),
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
    queryFn: () => apiFetch<LanStatus>('/api/system/lan/status'),
    refetchInterval: 30000,
  });
}

export function useEnableLanMutation() {
  return useApiMutation(() => apiSend('/api/system/lan/enable', 'POST'), [LAN_STATUS_QUERY_KEY]);
}

export function useDisableLanMutation() {
  return useApiMutation(() => apiSend('/api/system/lan/disable', 'POST'), [LAN_STATUS_QUERY_KEY]);
}

export function useAuthStatusQuery() {
  return useQuery<{ loggedIn: boolean }>({
    queryKey: AUTH_STATUS_QUERY_KEY,
    // Only ever read on demand, when the user asks to open the hidden section.
    enabled: false,
    queryFn: () => apiFetch<{ loggedIn: boolean }>('/api/auth/status'),
  });
}

export function useSubmitPinMutation() {
  return useApiMutation((pin: string) => apiSend('/api/auth', 'POST', { pin }), AFTER_AUTH);
}

export function useLogoutMutation() {
  return useApiMutation(() => apiSend('/api/logout', 'POST'), AFTER_AUTH);
}

// --- CRUD Mutations ---

export function useAddNoteMutation() {
  return useApiMutation(
    (body: { title: string; content: string }) => apiSend<Note>('/api/notes', 'POST', body),
    AFTER_CREATE
  );
}

export function useUpdateNoteMutation() {
  return useApiMutation(
    ({ id, title, content, pinned, hidden }: Note) =>
      apiSend<Note>(`/api/notes/${id}`, 'PUT', { title, content, pinned, hidden }),
    AFTER_WRITE
  );
}

export function useDeleteNoteMutation() {
  return useApiMutation((id: number) => apiSend<void>(`/api/notes/${id}`, 'DELETE'), AFTER_WRITE);
}

export function useAddChecklistMutation() {
  return useApiMutation(
    (title: string) => apiSend<Checklist>('/api/checklists', 'POST', { title }),
    AFTER_CREATE
  );
}

export function useUpdateChecklistMutation() {
  return useApiMutation(
    ({ id, title, items, pinned, hidden }: Checklist) =>
      apiSend<Checklist>(`/api/checklists/${id}`, 'PUT', { title, items, pinned, hidden }),
    AFTER_WRITE
  );
}

export function useDeleteChecklistMutation() {
  return useApiMutation(
    (id: number) => apiSend<void>(`/api/checklists/${id}`, 'DELETE'),
    AFTER_WRITE
  );
}

export function useUpdateChecklistItemMutation() {
  return useApiMutation(
    ({
      itemId,
      updates,
    }: {
      itemId: number;
      updates: Partial<Pick<ChecklistItem, 'content' | 'checked' | 'position'>>;
    }) => apiSend<ChecklistItem>(`/api/checklists/items/${itemId}`, 'PUT', updates),
    AFTER_WRITE
  );
}

export function useAddTrackerMutation() {
  return useApiMutation(
    (body: { title: string; unit: string | null }) => apiSend<Tracker>('/api/trackers', 'POST', body),
    AFTER_CREATE
  );
}

export function useUpdateTrackerMutation() {
  return useApiMutation(
    ({ tracker, deletedEntryIds }: { tracker: Tracker; deletedEntryIds?: number[] }) => {
      const { id, title, unit, pinned, hidden } = tracker;
      return apiSend<Tracker>(`/api/trackers/${id}`, 'PUT', {
        title,
        unit,
        pinned,
        hidden,
        deletedEntryIds,
      });
    },
    AFTER_WRITE
  );
}

export function useDeleteTrackerMutation() {
  return useApiMutation((id: number) => apiSend<void>(`/api/trackers/${id}`, 'DELETE'), AFTER_WRITE);
}

export function useAddTrackerEntryMutation() {
  return useApiMutation(
    ({ trackerId, value }: { trackerId: number; value: string }) =>
      apiSend<TrackerEntry>(`/api/trackers/${trackerId}/entries`, 'POST', { value }),
    AFTER_WRITE
  );
}

export function useBatchDeleteMutation() {
  return useApiMutation(
    (items: Array<{ id: number; type: ContentType }>) =>
      apiSend<void>('/api/content/batch', 'DELETE', { items }),
    AFTER_WRITE
  );
}
