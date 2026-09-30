import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/utils/api';
import { useContentStore } from '@/store/contentStore';
import { useNotificationStore } from '@/store/notificationStore';
import { AUTH_STATUS_QUERY_KEY, CONTENT_COUNTS_QUERY_KEY } from '@/hooks/useContentQuery';


function handleSessionExpiry(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401) return;

  const { hiddenUnlocked, setHiddenUnlocked } = useContentStore.getState();

  setHiddenUnlocked(false);
  queryClient.setQueryData(AUTH_STATUS_QUERY_KEY, { loggedIn: false });
  queryClient.invalidateQueries({ queryKey: CONTENT_COUNTS_QUERY_KEY });

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
      staleTime: 5000,
      refetchOnWindowFocus: true,
    },
  },
});
