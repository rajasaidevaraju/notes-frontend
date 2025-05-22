import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'
import NoteItem from './NoteItem'
interface NotesListProps {
    notes: Note[];
    loading: boolean;
    onUpdateNote: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
    onDeleteNote: (id: number) => Promise<void>;
  }
  
  const NotesList: React.FC<NotesListProps> = ({ notes, loading, onUpdateNote, onDeleteNote }) => {
    console.log(notes);
    if (loading) {
      return <p className={styles.infoMessage}>Loading notes...</p>;
    }
  
    if (notes.length === 0) {
      return <p className={styles.infoMessage}>No notes yet. Add one above!</p>;
    }
  
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1; 
      if (!a.pinned && b.pinned) return 1;  
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
      <div className={styles.notesList}>
        {sortedNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
          />
        ))}
      </div>
    );
  };
  export default NotesList;
