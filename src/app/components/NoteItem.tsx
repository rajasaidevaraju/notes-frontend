import { useState } from 'react';
import ErrorMessage from './ErrorMessage'; // Assuming this path is correct
import styles from '@/Home.module.css'; // Assuming this path is correct
import { Note } from '@/types/Notes'; // Assuming this path is correct

interface NoteItemProps {
  note: Note;
  onUpdateNote: (id: number, title: string, content: string) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdateNote, onDeleteNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteTitle, setEditingNoteTitle] = useState(note.title);
  const [editingNoteContent, setEditingNoteContent] = useState(note.content);
  const [itemError, setItemError] = useState<string | null>(null); // Local error for this item

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingNoteTitle(note.title); // Reset to current note's title
    setEditingNoteContent(note.content); // Reset to current note's content
    setItemError(null); // Clear any previous local error
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError(null); // Clear local error

    if (!editingNoteTitle.trim()) {
      setItemError('Title cannot be empty.');
      return;
    }

    try {
      await onUpdateNote(note.id, editingNoteTitle, editingNoteContent);
      setIsEditing(false); // Exit editing mode on success
    } catch (err: any) {
      // The error is handled by the parent (NotesContainer) which sets its global error state.
      // No need to set itemError here for API failures.
    }
  };

  const handleDelete = async () => {
    setItemError(null);
    try {
      await onDeleteNote(note.id);
    } catch (err: any) {
      // The error is handled by the parent (NotesContainer) which sets its global error state.
      // No need to set itemError here for API failures.
    }
  };

  return (
    <div className={styles.noteItem}>
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
          <div className={styles.noteHeader}> {/* New div for header layout */}
            <h3 className={styles.noteTitle}>{truncateText(note.title, 50)}</h3> {/* Truncate title */}
            <div className={styles.buttonGroup}>
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
