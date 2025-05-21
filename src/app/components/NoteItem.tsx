import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'



interface NoteItemProps {
    note: Note;
    editingNoteId: number | null;
    editingNoteTitle: string;
    setEditingNoteTitle: (title: string) => void;
    editingNoteContent: string;
    setEditingNoteContent: (content: string) => void;
    handleEditClick: (note: Note) => void;
    handleUpdateNote: (e: React.FormEvent) => void;
    handleDeleteNote: (id: number) => void;
    setEditingNoteId: (id: number | null) => void;
  }
  
  const NoteItem: React.FC<NoteItemProps> = ({
    note,
    editingNoteId,
    editingNoteTitle,
    setEditingNoteTitle,
    editingNoteContent,
    setEditingNoteContent,
    handleEditClick,
    handleUpdateNote,
    handleDeleteNote,
    setEditingNoteId,
  }) => (
    <div className={styles.noteItem}>
      {editingNoteId === note.id ? (
        <form onSubmit={handleUpdateNote} className={styles.form}>
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
              onClick={() => setEditingNoteId(null)}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 className={styles.noteTitle}>{note.title}</h3>
          <p className={styles.noteContent}>{note.content || 'No content'}</p>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => handleEditClick(note)}
              className={`${styles.button} ${styles.editButton}`}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteNote(note.id)}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );

  export default NoteItem;