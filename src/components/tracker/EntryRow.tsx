import React from 'react';
import trackerStyles from './Tracker.module.css';
import { TrackerEntry } from '@/types/Types';

/** Recent entries read as "today 14:30" / "yesterday 09:00"; older ones get a date. */
export const formatEntryTime = (recordedAt: string): string => {
  const date = new Date(recordedAt);
  if (isNaN(date.getTime())) return recordedAt;

  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (sameDay(date, now)) return `today ${time}`;
  if (sameDay(date, yesterday)) return `yesterday ${time}`;

  const dateStr = date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
  return `${dateStr}, ${time}`;
};

interface EntryRowProps {
  entry: TrackerEntry;
  unit: string | null;
  onDelete?: (entryId: number) => void;
}

/** A single tracker reading. The delete button only appears where editing is allowed. */
const EntryRow: React.FC<EntryRowProps> = ({ entry, unit, onDelete }) => (
  <div className={trackerStyles.entryRow}>
    <span className={trackerStyles.entryValue}>
      {entry.value}{unit ? ` ${unit}` : ''}
    </span>
    <span className={trackerStyles.entryTime}>{formatEntryTime(entry.recordedAt)}</span>
    {onDelete && (
      <button
        type="button"
        className={trackerStyles.entryDelete}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        title="Delete entry"
        aria-label="Delete entry"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

export default EntryRow;
