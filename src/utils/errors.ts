export function toMessage(err: unknown, prefix?: string): string {
  const detail = err instanceof Error ? err.message : '';
  if (!prefix) return detail || 'Unexpected error.';
  return detail ? `${prefix}: ${detail}` : prefix;
}
