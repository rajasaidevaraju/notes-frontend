import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import { Note } from '@/types/Notes';
import Modal from './Modal';
import ClipboardNoteItem from './ClipboardNoteItem';

interface NoteItemProps {
  note: Note;
  onUpdateNote: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  onPasteToClipboardNote: () => Promise<void>;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdateNote, onDeleteNote, onPasteToClipboardNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteTitle, setEditingNoteTitle] = useState(note.title);
  const [editingNoteContent, setEditingNoteContent] = useState(note.content);
  const [isPinned, setIsPinned] = useState(note.pinned); 
  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingNoteTitle(note.title);
    setEditingNoteContent(note.content);
    setIsPinned(note.pinned);
    setItemError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError(null);

    if (!editingNoteTitle.trim()) {
      setItemError('Title cannot be empty.');
      return;
    }

    try {
      await onUpdateNote(note.id, editingNoteTitle, editingNoteContent, isPinned);
      setIsEditing(false);
    } catch (err: any) {
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await onDeleteNote(note.id);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleTogglePin = async () => {
    setItemError(null);
    try {
      await onUpdateNote(note.id, note.title, note.content, !isPinned); 
      setIsPinned(!isPinned);
    } catch (err: any) {
    }
  };

  if (note.title === CLIPBOARD_NOTE_TITLE) {
    return (
     <ClipboardNoteItem note={note} onPaste={onPasteToClipboardNote}></ClipboardNoteItem>
    );
  }

  return (
    <div className={`${styles.noteItem} ${isPinned ? styles.pinnedNote : ''}`}>
      {itemError && <ErrorMessage message={itemError} />}
      {isEditing ? (
        <form onSubmit={handleUpdate} className={styles.form}>
          <div>
            <label htmlFor={`editTitle-${note.id}`} className={styles.formLabel}>
              Title
            </label>
            <input
              type="text"
              id={`editTitle-${note.id}`}
              value={editingNoteTitle}
              onChange={(e) => setEditingNoteTitle(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>
          <div>
            <label htmlFor={`editContent-${note.id}`} className={styles.formLabel}>
              Content
            </label>
            <textarea
              id={`editContent-${note.id}`}
              value={editingNoteContent}
              onChange={(e) => setEditingNoteContent(e.target.value)}
              rows={3}
              className={styles.formTextarea}
            ></textarea>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id={`pinNote-${note.id}`}
              checked={isPinned}
              onChange={() => setIsPinned(!isPinned)}
              className={styles.checkboxInput}
            />
            <label htmlFor={`pinNote-${note.id}`} className={styles.checkboxLabel}>
              Pin Note
            </label>
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.successButton}`}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.noteHeader}>
            <h3 className={styles.noteTitle}>{truncateText(note.title, 50)}</h3>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleTogglePin}
                className={`${styles.button} ${styles.pinButton} ${isPinned ? styles.pinned : ''}`}
                title={isPinned ? 'Unpin Note' : 'Pin Note'}
              >
                {isPinned ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                    <path d="M17 17L12 22L7 17V10H17V17Z" />
                    <path d="M12 2V10" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                    <path d="M12 17V22" />
                    <path d="M7 10V17L12 22L17 17V10" />
                    <path d="M17 10H7V5H17V10Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleEditClick}
                className={`${styles.button} ${styles.editButton}`}
                title="Edit Note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className={`${styles.button} ${styles.deleteButton}`}
                title="Delete Note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
          <p className={styles.noteContent}>{note.content || 'No content'}</p>
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className={styles.modalBodyText}>Are you sure you want to delete this note?</p>
        <div className={styles.buttonGroup}>
          <button
            onClick={confirmDelete}
            className={`${styles.button} ${styles.dangerButton}`}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NoteItem;
