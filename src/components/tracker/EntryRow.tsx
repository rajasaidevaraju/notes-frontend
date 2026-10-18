import React from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackerEntry } from '@/types/Types';

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

const EntryRow: React.FC<EntryRowProps> = ({ entry, unit, onDelete }) => (
  <div className="flex items-center gap-2 border-b py-1.5 text-sm last:border-b-0">
    <span className="[overflow-wrap:anywhere] text-foreground/75">
      {entry.value}
      {unit ? ` ${unit}` : ''}
    </span>
    <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-foreground">
      {formatEntryTime(entry.recordedAt)}
    </span>
    {onDelete && (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive max-sm:size-9"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        title="Delete entry"
        aria-label="Delete entry"
      >
        <XIcon />
      </Button>
    )}
  </div>
);

export default EntryRow;
