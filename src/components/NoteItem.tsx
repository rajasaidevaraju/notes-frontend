import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import noteItemStyles from './NoteItem.module.css';
import { Note } from '@/types/Types';
import EditNoteFormModal from './EditNoteForm';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from '@/store/noteUiStore';

import ConfirmActionModal from './ConfirmActionModal';
import ViewNoteModal from './ViewNoteModal';
import ItemToolbar from './ItemToolbar';
import { useUpdateNoteMutation, useDeleteNoteMutation } from '@/hooks/useContentQuery';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelected,
  onToggleSelect,
  isSelectingMode,
}) => {
  const clearSelectedContent = useContentStore((state) => state.clearSelectedContent);
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();

  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const minimized = useNoteUiStore((state) => state.minimizedNotes[note.id] ?? false);
  const toggleNoteMinimize = useNoteUiStore((state) => state.toggleNoteMinimize);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectingMode) {
      onToggleSelect();
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    setItemError(null);
    clearSelectedContent();
    setCopyFeedback(null);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteNoteMutation.mutateAsync(note.id);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      let message = 'Failed to delete item';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateNoteMutation.mutateAsync({ ...note, pinned: !note.pinned });
    } catch (err: unknown) {
      if (err instanceof Error) setItemError(err.message);
    }
  };

  const handleHideToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHideModalOpen(true);
  };

  const confirmHide = async () => {
    try {
      await updateNoteMutation.mutateAsync({ ...note, hidden: !note.hidden });
      setIsHideModalOpen(false);
    } catch {
      setIsHideModalOpen(false);
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    setCopyFeedback(null);

    try {
      if (navigator.clipboard) {
        if (note.content) {
          await navigator.clipboard.writeText(note.content);
          setCopyFeedback('Copied!');
        } else {
          throw new Error('No content to copy.');
        }
        setTimeout(() => setCopyFeedback(null), 2000);
      } else {
        throw new Error('Clipboard API not supported.');
      }
    } catch (err: unknown) {
      let message = 'Failed to copy content';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      setTimeout(() => setItemError(null), 3000);
    }
  };

  const contentRef = React.useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [note.content, minimized]);

  return (
    <div
      className={`${noteItemStyles.noteItem} ${note.pinned ? noteItemStyles.pinnedNote : ''} ${
        note.hidden ? noteItemStyles.hiddenNote : ''
      } ${isSelected ? noteItemStyles.selectedNote : ''}`}
      onClick={handleClick}
    >
      {itemError && <ErrorMessage message={itemError} />}

      <>
        <div className={noteItemStyles.noteHeader}>
          <h3 className={noteItemStyles.noteTitle}>{truncateText(note.title, 50)}</h3>
          {isSelectingMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className={noteItemStyles.multiSelectCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <ItemToolbar
              pinned={note.pinned}
              hidden={note.hidden}
              minimized={minimized}
              copyFeedback={copyFeedback}
              onTogglePin={handleTogglePin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onCopy={handleCopyClick}
              onToggleHide={handleHideToggle}
              onToggleMinimize={(e) => {
                e.stopPropagation();
                toggleNoteMinimize(note.id);
              }}
            />
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <p ref={contentRef} className={noteItemStyles.noteContent}>
            {minimized ? '...' : note.content || 'No content'}
          </p>
          {isOverflowing && !minimized && (
            <div
              className={noteItemStyles.fadeOverlay}
              onClick={(e) => {
                e.stopPropagation();
                setIsViewModalOpen(true);
              }}
            >
              <span className={noteItemStyles.moreIndicator}>Read More</span>
            </div>
          )}
        </div>
      </>

      <ViewNoteModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        note={note}
      />

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Note Deletion"
        message="Are you sure you want to delete this Note?"
        confirmText="Yes, Delete"
        danger
      />

      <ConfirmActionModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={confirmHide}
        title={note.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
        message={`Are you sure you want to ${note.hidden ? 'un-hide' : 'hide'} this note?${
          !note.hidden
            ? ' It will be moved to the hidden section and require authentication to view.'
            : ''
        }`}
        confirmText={`Yes, ${note.hidden ? 'Un-Hide' : 'Hide'}`}
      />

      <EditNoteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
      />
    </div>
  );
};

export default NoteItem;