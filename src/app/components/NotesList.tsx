import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'
import NoteItem from './NoteItem'

interface NotesListProps {
    notes: Note[];
    loading: boolean;
    onUpdateNote: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
    onDeleteNote: (id: number) => Promise<void>;
    clipboardNote: Note | null;
    onPasteToClipboardNote: () => Promise<void>;
  }
  
  const NotesList: React.FC<NotesListProps> = ({ 
    notes, 
    loading, 
    onUpdateNote, 
    onDeleteNote,
    clipboardNote,
    onPasteToClipboardNote
  }) => {
    if (loading) {
      return <p className={styles.infoMessage}>Loading notes...</p>;
    }
  

    const  sortedNotes = [...notes].sort((a, b) => {

      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });


    return (
        <div className={styles.notesList}>
         
         {clipboardNote && (
            <NoteItem
            key={`clipboard-${clipboardNote.id}`} 
              note={clipboardNote}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
              onPasteToClipboardNote={onPasteToClipboardNote}
            />
          )}
  
          {sortedNotes.length === 0 && !clipboardNote ? (
            <p className={styles.infoMessage}>No notes yet. Add one above!</p>
          ) : (
            sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
                onPasteToClipboardNote={onPasteToClipboardNote}
              />
            ))
          )}
        </div>
      );
    };
    export default NotesList;