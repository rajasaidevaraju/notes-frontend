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

export interface AccountGroup {
  id: number;
  name: string;
}

export interface Account {
  id: number;
  groupId: number | null;
  identifier: string;
  password: string | null;
  notes: string | null;
  locked: boolean;
  pinned: boolean;
  updatedAt: string;
  createdAt: string;
  type: 'account';
}

export type UnifiedContent = Note | Checklist | Tracker;
export type CardItem = UnifiedContent | Account;
export type ContentType = CardItem['type'];

export const itemTitle = (item: CardItem): string =>
  item.type === 'account' ? item.identifier : item.title;

export type ContentKey = `${ContentType}-${number}`;
export const contentKey = (item: { id: number; type: ContentType }): ContentKey =>
  `${item.type}-${item.id}`;

