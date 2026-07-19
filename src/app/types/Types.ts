export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  hidden: boolean;
  updatedAt: string;
  createdAt: string;
  type: 'note';
}

export interface ChecklistItem {
  id: number;
  checklistId: number;
  content: string;
  checked: boolean;
  position: number;
}

export interface Checklist {
  id: number;
  title: string;
  pinned: boolean;
  hidden: boolean;
  updatedAt: string;
  createdAt: string;
  items: ChecklistItem[];
  type: 'checklist';
}

export interface TrackerEntry {
  id: number;
  trackerId: number;
  value: string;
  recordedAt: string;
}

export interface Tracker {
  id: number;
  title: string;
  unit: string | null;
  pinned: boolean;
  hidden: boolean;
  updatedAt: string;
  createdAt: string;
  entries: TrackerEntry[];
  type: 'tracker';
}

export type UnifiedContent = Note | Checklist | Tracker;
export const CONTENT_TYPES = ['note', 'checklist', 'tracker'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export interface ErrorMessageProps {
  message: string | null;
}

