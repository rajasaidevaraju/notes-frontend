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

export type UnifiedContent = Note | Checklist;
export const CONTENT_TYPES = ['note', 'checklist'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export interface ErrorMessageProps {
  message: string | null;
}

