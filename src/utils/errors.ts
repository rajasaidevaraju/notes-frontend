/**
 * Turns an unknown catch value into a user-facing string, optionally prefixed
 * with what was being attempted: `toMessage(err, 'Failed to delete item')`.
 *
 * Where the message goes is a deliberate split:
 *  - failures caused by something the user just did (save, delete, copy) render
 *    inline via <ErrorMessage> next to the control that failed;
 *  - app-wide events with no obvious anchor on screen (session expiry) go to the
 *    notification store.
 * Anything caught in a component belongs in the first group.
 */
export function toMessage(err: unknown, prefix?: string): string {
  const detail = err instanceof Error ? err.message : '';
  if (!prefix) return detail || 'Unexpected error.';
  return detail ? `${prefix}: ${detail}` : prefix;
}
