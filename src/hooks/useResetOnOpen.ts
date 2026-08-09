import { useLayoutEffect, useRef } from 'react';

/**
 * Runs `reset` on the closed → open transition only.
 *
 * Modal forms seed their state from the item they are editing. Doing that in an
 * effect keyed on the item object instead re-seeds on every background refetch —
 * and with a 5s staleTime plus refetch-on-focus, that silently discards whatever
 * the user had typed. Keying on the transition makes the form authoritative for
 * as long as it is open.
 */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const wasOpen = useRef(false);

  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) reset();
    wasOpen.current = isOpen;
  });
}
