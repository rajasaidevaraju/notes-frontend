import { useLayoutEffect, useRef } from 'react';

// Keyed on open, not on the item: background refetches would otherwise wipe what the user typed.
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const wasOpen = useRef(false);

  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) reset();
    wasOpen.current = isOpen;
  });
}
