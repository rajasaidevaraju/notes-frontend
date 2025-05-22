import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import { Note } from '@/types/Notes';

interface NoteItemProps {
  note: Note;
  onUpdateNote: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdateNote, onDeleteNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteTitle, setEditingNoteTitle] = useState(note.title);
  const [editingNoteContent, setEditingNoteContent] = useState(note.content);
  const [isPinned, setIsPinned] = useState(note.pinned); 
  const [itemError, setItemError] = useState<string | null>(null);

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
    setIsPinned(note.pinned); // Initialize pinned state when editing
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

  const handleDelete = async () => {
    setItemError(null);
    try {
      await onDeleteNote(note.id);
    } catch (err: any) {
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
                {isPinned ? 'pinned' : 'pin'}
              </button>
              <button
                onClick={handleEditClick}
                className={`${styles.button} ${styles.editButton}`}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className={`${styles.button} ${styles.deleteButton}`}
              >
                Delete
              </button>
            </div>
          </div>
          <p className={styles.noteContent}>{note.content || 'No content'}</p>
        </>
      )}
    </div>
  );
};

export default NoteItem;
