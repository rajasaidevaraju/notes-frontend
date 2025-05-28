import styles from '@/Home.module.css';
import { Note } from '@/types/Notes';
import NoteItem from './NoteItem';
import { useNotesStore } from '../store/notesStore'; // Adjust path as needed
import ClipboardNoteItem from './ClipboardNoteItem';

interface NotesListProps {
  isSelectingMode: boolean;
}

const NotesList: React.FC<NotesListProps> = ({ isSelectingMode }) => { // Accept the new prop
  const { notes, loading, clipboardNote, selectedNoteIds, toggleSelectNote, clearSelectedNotes } = useNotesStore();

  if (loading) {
    return <p className={styles.infoMessage}>Loading notes...</p>;
  }

  const pinned = notes
    .filter((note) => note.pinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const notPinned = notes
    .filter((note) => !note.pinned)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className={styles.notesList}>
      {clipboardNote && (
        <ClipboardNoteItem
        />
      )}

      {pinned.length === 0 && notPinned.length === 0 ? (
        <p className={styles.infoMessage}>No notes yet. Add one above!</p>
      ) : (
        <>
          {pinned.length > 0 && <h3 className={styles.sectionHeading}>Pinned Notes</h3>}
          {pinned.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNoteIds.has(note.id)}
              onToggleSelect={() => toggleSelectNote(note.id)}
              isSelectingMode={isSelectingMode}
            />
          ))}
          {pinned.length > 0 && notPinned.length > 0 && <h3 className={styles.sectionHeading}>Other Notes</h3>}
          {notPinned.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNoteIds.has(note.id)}
              onToggleSelect={() => toggleSelectNote(note.id)}
              isSelectingMode={isSelectingMode}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default NotesList;