import React, { useMemo } from 'react';
import styles from '@/Home.module.css';
import NoteItem from './note/NoteItem';
import CheckListItem from './checklist/CheckListItem';
import TrackerItem from './tracker/TrackerItem';
import { UnifiedContent, contentKey } from '@/types/Types';
import Loading from '@/components/LoadingSpinner';
import { useContentStore } from '@/store/contentStore';
import ClipboardNoteItem from './clipboard/ClipboardNoteItem';
import { useContentQuery, useHiddenContentQuery } from '@/hooks/useContentQuery';

interface ContentListProps {
  isSelectingMode: boolean;
}

const EMPTY: UnifiedContent[] = [];

const matchesQuery = (item: UnifiedContent, query: string): boolean => {
  if (item.title.toLowerCase().includes(query)) return true;
  switch (item.type) {
    case 'note':
      return item.content.toLowerCase().includes(query);
    case 'checklist':
      return item.items.some((i) => i.content.toLowerCase().includes(query));
    case 'tracker':
      return item.entries.some((e) => e.value.toLowerCase().includes(query));
  }
};

const byNewestFirst = (a: UnifiedContent, b: UnifiedContent) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Splits a list into pinned/unpinned, filtered by the search query and sorted. */
const partition = (items: UnifiedContent[], query: string) => {
  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed ? items.filter((item) => matchesQuery(item, trimmed)) : items;

  const pinned: UnifiedContent[] = [];
  const notPinned: UnifiedContent[] = [];
  for (const item of filtered) (item.pinned ? pinned : notPinned).push(item);

  return { pinned: pinned.sort(byNewestFirst), notPinned: notPinned.sort(byNewestFirst) };
};

const ContentList: React.FC<ContentListProps> = ({ isSelectingMode }) => {
  const { selectedContent, toggleSelectContent, searchQuery, hiddenUnlocked, activeTab } =
    useContentStore();
  const { data: contentData, isLoading: isContentLoading } = useContentQuery();
  const { data: hiddenContentData, isLoading: isHiddenLoading } =
    useHiddenContentQuery(hiddenUnlocked);

  // Stable fallbacks: a fresh `[]` here would change identity every render and
  // defeat the memos below.
  const regularContent = contentData?.regularContent ?? EMPTY;
  const hiddenContent = hiddenUnlocked ? hiddenContentData ?? EMPTY : EMPTY;
  const clipboardNote = contentData?.clipboardNote ?? null;

  const isLoading = isContentLoading || isHiddenLoading;

  const regular = useMemo(() => partition(regularContent, searchQuery), [regularContent, searchQuery]);
  const hidden = useMemo(() => partition(hiddenContent, searchQuery), [hiddenContent, searchQuery]);

  const renderItem = (item: UnifiedContent) => {
    const key = contentKey(item);
    const shared = {
      key,
      isSelected: selectedContent.has(key),
      onToggleSelect: () => toggleSelectContent({ id: item.id, type: item.type }),
      isSelectingMode,
    };

    switch (item.type) {
      case 'note':
        return <NoteItem {...shared} note={item} />;
      case 'checklist':
        return <CheckListItem {...shared} checklist={item} />;
      case 'tracker':
        return <TrackerItem {...shared} tracker={item} />;
    }
  };

  const isHiddenView = activeTab === 'hidden';
  const { pinned, notPinned } = isHiddenView ? hidden : regular;
  const hasItems = pinned.length > 0 || notPinned.length > 0;

  const emptyMessage = isHiddenView
    ? searchQuery
      ? 'No matching hidden notes found.'
      : 'No hidden notes stored.'
    : searchQuery
      ? 'No matching notes found.'
      : 'No notes or checklists yet. Add one above!';

  return (
    <div className={styles.notesList}>
      {/* The clipboard card always leads the regular view, before or after the pinned heading */}
      {!isHiddenView && clipboardNote && pinned.length === 0 && (
        <ClipboardNoteItem clipboardNote={clipboardNote} />
      )}

      {!hasItems ? (
        <p className={styles.infoMessage}>{emptyMessage}</p>
      ) : (
        <>
          {pinned.length > 0 && (
            <h3 className={styles.sectionHeading}>{isHiddenView ? 'Pinned Hidden' : 'Pinned'}</h3>
          )}
          {!isHiddenView && clipboardNote && pinned.length > 0 && (
            <ClipboardNoteItem clipboardNote={clipboardNote} />
          )}
          {pinned.map(renderItem)}
          {pinned.length > 0 && notPinned.length > 0 && (
            <h3 className={styles.sectionHeading}>
              {isHiddenView ? 'Other Hidden Notes' : 'Others'}
            </h3>
          )}
          {notPinned.map(renderItem)}
        </>
      )}
      {isLoading && <Loading />}
    </div>
  );
};

export default ContentList;
