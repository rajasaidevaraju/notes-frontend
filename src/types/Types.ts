export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  hidden: boolean;
  archived: boolean;
  updatedAt: string;
  createdAt: string;
  type: 'note';
}

/**
 * Id the API expects for a checklist item that does not exist yet; the server
 * treats it as "insert" rather than "update".
 */
export const NEW_ITEM_ID = 0;

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
  archived: boolean;
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
  archived: boolean;
  updatedAt: string;
  createdAt: string;
  entries: TrackerEntry[];
  type: 'tracker';
}

export type UnifiedContent = Note | Checklist | Tracker;
export type ContentType = UnifiedContent['type'];

/** Stable identity for an item across the two id-spaces (`note-3` ≠ `tracker-3`). */
export type ContentKey = `${ContentType}-${number}`;
export const contentKey = (item: { id: number; type: ContentType }): ContentKey =>
  `${item.type}-${item.id}`;

