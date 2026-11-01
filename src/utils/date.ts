const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const formatRelativeDate = (iso: string, now = new Date()): string => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';

  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (startOfDay(date) === startOfDay(now)) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (Math.round((startOfDay(now) - startOfDay(date)) / (24 * HOUR)) === 1) return 'Yesterday';

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

export const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
