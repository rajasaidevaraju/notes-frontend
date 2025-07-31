import styles from '@/Home.module.css';
import NoteItem from './NoteItem';
import {Note} from '@/types/Notes';
import Loading from '@/components/LoadingSpinner';
import { useNotesStore } from '@/store/notesStore';
import ClipboardNoteItem from './ClipboardNoteItem';

interface NotesListProps {
  isSelectingMode: boolean;
}

const NotesList: React.FC<NotesListProps> = ({ isSelectingMode }) => {
  const { notes, loading, clipboardNote, selectedNoteIds, toggleSelectNote,hiddenNotes } = useNotesStore();

  const sortByUpdated = (a:Note, b:Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  const pinned:Note[] = [];
  const notPinned:Note[] = [];
  const pinnedHidden: Note[] = [];
  const notPinnedHidden: Note[] = [];

  for (const note of notes) {
    (note.pinned ? pinned : notPinned).push(note);
  }

  for (const note of hiddenNotes) {
    (note.pinned ? pinnedHidden : notPinnedHidden).push(note);
  }


  pinned.sort(sortByUpdated);
  notPinned.sort(sortByUpdated);

  
  pinnedHidden.sort(sortByUpdated);
  notPinnedHidden.sort(sortByUpdated);

  const hiddenNotesSorted=[...pinnedHidden,...notPinnedHidden];


  return (
    <div className={styles.notesList}>
      {clipboardNote &&pinned.length==0 && (
        <ClipboardNoteItem
        />
      )}

      {pinned.length === 0 && notPinned.length === 0 ? (
        <p className={styles.infoMessage}>No notes yet. Add one above!</p>
      ) : (
        <>
          {pinned.length > 0 && <h3 className={styles.sectionHeading}>Pinned Notes</h3>}
          {clipboardNote &&pinned.length>0 && (
            <ClipboardNoteItem
            />
          )}
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
      {hiddenNotesSorted.length > 0 && (
        <>
          <h3 className={styles.sectionHeading}>Hidden Notes</h3>
            {hiddenNotesSorted.map((note) => (
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

      {loading && <Loading />}
    </div>
  );
};

export default NotesList;