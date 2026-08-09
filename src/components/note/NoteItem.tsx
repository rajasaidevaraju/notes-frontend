import React, { useLayoutEffect, useRef, useState } from 'react';
import styles from '@/components/ItemCard.module.css';
import { Note } from '@/types/Types';
import EditNoteFormModal from './EditNoteForm';
import ViewNoteModal from './ViewNoteModal';
import ItemCard from '@/components/ItemCard';
import { useItemCard } from '@/components/useItemCard';
import { useUpdateNoteMutation, useDeleteNoteMutation } from '@/hooks/useContentQuery';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, isSelected, onToggleSelect, isSelectingMode }) => {
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();

  const card = useItemCard({
    item: note,
    updateItem: (changes) => updateNoteMutation.mutateAsync({ ...note, ...changes }),
    deleteItem: () => deleteNoteMutation.mutateAsync(note.id),
    copyText: () => note.content,
  });

  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [note.content, card.minimized]);

  return (
    <ItemCard
      item={note}
      card={card}
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
      isSelectingMode={isSelectingMode}
      modals={
        <>
          <ViewNoteModal isOpen={card.isViewModalOpen} onClose={card.closeView} note={note} />
          <EditNoteFormModal isOpen={card.isEditModalOpen} onClose={card.closeEdit} note={note} />
        </>
      }
    >
      <div className={styles.bodyAnchor}>
        <p ref={contentRef} className={styles.noteContent}>
          {card.minimized ? '...' : note.content || 'No content'}
        </p>
        {isOverflowing && !card.minimized && (
          <div
            className={styles.fadeOverlay}
            onClick={(e) => {
              e.stopPropagation();
              card.openView();
            }}
          >
            <span className={styles.moreIndicator}>Read More</span>
          </div>
        )}
      </div>
    </ItemCard>
  );
};

export default NoteItem;
