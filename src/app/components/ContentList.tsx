import React, { useMemo } from 'react';
import styles from '@/Home.module.css';
import NoteItem from './NoteItem';
import CheckListItem from './CheckListItem';
import { UnifiedContent, Note, Checklist } from '@/types/Types';
import Loading from '@/components/LoadingSpinner';
import { useContentStore } from '@/store/contentStore';
import ClipboardNoteItem from './ClipboardNoteItem';

interface ContentListProps {
  isSelectingMode: boolean;
}

const ContentList: React.FC<ContentListProps> = ({ isSelectingMode }) => {
  const { content, loading, clipboardNote, selectedContentKeys, toggleSelectContent, hiddenContent, searchQuery } = useContentStore();

  const { pinned, notPinned, hiddenNotesSorted } = useMemo(() => {
    const sortByCreated = (a: UnifiedContent, b: UnifiedContent) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const filterContent = (items: UnifiedContent[]) => {
      if (!searchQuery.trim()) return items;
      const lowerQuery = searchQuery.toLowerCase();
      return items.filter(item => {
        if (item.type === 'note') {
          const note = item as Note;
          return note.title.toLowerCase().includes(lowerQuery) || note.content.toLowerCase().includes(lowerQuery);
        } else {
          const checklist = item as Checklist;
          return checklist.title.toLowerCase().includes(lowerQuery) || checklist.items.some(i => i.content.toLowerCase().includes(lowerQuery));
        }
      });
    };

    const filteredContent = filterContent(content);
    const filteredHiddenContent = filterContent(hiddenContent);

    const pinned: UnifiedContent[] = [];
    const notPinned: UnifiedContent[] = [];
    const pinnedHidden: UnifiedContent[] = [];
    const notPinnedHidden: UnifiedContent[] = [];

    for (const item of filteredContent) {
      (item.pinned ? pinned : notPinned).push(item);
    }

    for (const item of filteredHiddenContent) {
      (item.pinned ? pinnedHidden : notPinnedHidden).push(item);
    }

    pinned.sort(sortByCreated);
    notPinned.sort(sortByCreated);
    pinnedHidden.sort(sortByCreated);
    notPinnedHidden.sort(sortByCreated);

    const hiddenNotesSorted = [...pinnedHidden, ...notPinnedHidden];

    return { pinned, notPinned, hiddenNotesSorted };
  }, [content, hiddenContent, searchQuery]);

  const renderItem = (item: UnifiedContent) => {
    if (item.type === 'note') {
      return (
        <NoteItem
          key={`${item.type}-${item.id}`}
          note={item as Note}
          isSelected={selectedContentKeys.has(`${item.type}-${item.id}`)}
          onToggleSelect={() => toggleSelectContent(item.id, item.type)}
          isSelectingMode={isSelectingMode}
        />
      );
    } else {
      return (
        <CheckListItem
          key={`${item.type}-${item.id}`}
          checklist={item as Checklist}
          isSelected={selectedContentKeys.has(`${item.type}-${item.id}`)}
          onToggleSelect={() => toggleSelectContent(item.id, item.type)}
          isSelectingMode={isSelectingMode}
        />
      );
    }
  };

  return (
    <div className={styles.notesList}>
      {clipboardNote && pinned.length === 0 && (
        <ClipboardNoteItem />
      )}

      {pinned.length === 0 && notPinned.length === 0 ? (
        hiddenNotesSorted.length === 0 && (
          <p className={styles.infoMessage}>
            {searchQuery ? "No matches found." : "No notes or checklists yet. Add one above!"}
          </p>
        )
      ) : (
        <>
          {pinned.length > 0 && <h3 className={styles.sectionHeading}>Pinned</h3>}
          {clipboardNote && pinned.length > 0 && (
            <ClipboardNoteItem />
          )}
          {pinned.map(renderItem)}
          {(pinned.length > 0 && notPinned.length > 0) && <h3 className={styles.sectionHeading}>Others</h3>}
          {notPinned.map(renderItem)}
        </>
      )}
      {hiddenNotesSorted.length > 0 && (
        <>
          <h3 className={styles.sectionHeading}>Hidden</h3>
          {hiddenNotesSorted.map(renderItem)}
        </>
      )}

      {loading && <Loading />}
    </div>
  );
};

export default ContentList;