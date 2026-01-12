import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import { Note } from '@/types/Types';
import Modal from './Modal';
import EditNoteFormModal from './EditNoteForm';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from "@/store/noteUiStore";

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
  isSelectingMode
}) => {
  const { updateNoteApi, deleteNoteApi, clearSelectedContent } = useContentStore();

  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      return text.substring(0, maxLength) + '...';
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

  const handleUpdate = async (updatedItem: Note) => {
    setItemError(null);
    try {
      await updateNoteApi(updatedItem);
    } catch (err: unknown) {
      let message = "Failed to update item";
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      throw err;
    }
  };


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteNoteApi(note.id);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      let message = "Failed to delete item";
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdate({ ...note, pinned: !note.pinned });
  };

  const handleHideToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdate({ ...note, hidden: !note.hidden });
  }

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

  return (
    <div
      className={`${noteItemStyles.noteItem} ${note.pinned ? noteItemStyles.pinnedNote : ''} ${isSelected ? noteItemStyles.selectedNote : ''}`}
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
            <div className={noteItemStyles.buttonGroup}>
              <button
                onClick={handleTogglePin}
                className={`${styles.button}`}
                title={note.pinned ? 'Unpin' : 'Pin'}
              >
                {note.pinned ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleEditClick}
                className={`${styles.button}`}
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className={`${styles.button}`}
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
              <button
                onClick={handleCopyClick}
                className={`${styles.button}`}
                title="Copy Content"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>

                {copyFeedback && <span style={{ marginLeft: '0.3rem' }}>{copyFeedback}</span>}
              </button>
              <button
                onClick={handleHideToggle}
                className={`${styles.button} ${styles.hideButton}`}
                title={note.hidden ? 'Un-Hide' : 'Hide'}
                aria-label={note.hidden ? 'Un-Hide' : 'Hide'}
              >
                {note.hidden ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <path d="M3 3l18 18"></path> <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              <button className={`${styles.button}`} onClick={() => toggleNoteMinimize(note.id)} title={minimized ? 'Expand' : 'Minimize'} aria-label={minimized ? 'Expand' : 'Minimize'}>
                {minimized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <line x1="12" y1="5" x2="12" y2="19" />
                  </svg>

                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {minimized ? (
          <p className={noteItemStyles.noteContent}>...</p>
        ) : (
          <p className={noteItemStyles.noteContent}>{note.content || 'No content'}</p>
        )}

      </>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Confirm Note Deletion`}
      >
        <div className={styles.form}>
          <p className={styles.modalBodyText}>Are you sure you want to delete this Note?</p>
          <div className={styles.buttonGroup}>
            <button
              onClick={confirmDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={`${styles.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <EditNoteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
        onUpdateNote={handleUpdate}
      />
    </div>
  );
};

export default NoteItem;