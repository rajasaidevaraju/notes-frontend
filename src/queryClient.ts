import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/utils/api';
import { useContentStore } from '@/store/contentStore';
import { useNotificationStore } from '@/store/notificationStore';
import { AUTH_STATUS_QUERY_KEY } from '@/hooks/useContentQuery';

/**
 * The PIN cookie can expire while the hidden section is on screen. Any 401 means
 * the session is gone, so lock the section back down and drop the stale hidden
 * items instead of leaving them visible with silently failing edits.
 */
function handleSessionExpiry(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401) return;

  const { hiddenUnlocked, setHiddenUnlocked } = useContentStore.getState();

  // Locking the section is what takes the stale items off screen. Deliberately
  // not removing the cached hidden data: the query observer is still enabled
  // until React re-renders, so dropping it here would just trigger another 401.
  // useSubmitPinMutation invalidates it on the next successful unlock.
  setHiddenUnlocked(false);
  queryClient.setQueryData(AUTH_STATUS_QUERY_KEY, { loggedIn: false });

  if (hiddenUnlocked) {
    useNotificationStore
      .getState()
      .addNotification('Session expired. Re-enter your PIN to view hidden items.', 'warning');
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleSessionExpiry }),
  mutationCache: new MutationCache({ onError: handleSessionExpiry }),
  defaultOptions: {
    queries: {
      // Content is shared across devices on the LAN, so cached data goes stale
      // almost immediately. Keep the window short and refetch when a tab is
      // brought back to the foreground.
      staleTime: 5000,
      refetchOnWindowFocus: true,
    },
  },
});
