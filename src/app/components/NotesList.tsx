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

    console.log(notes);
  
    const pinned=notes.filter((note)=>note.pinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const notPinned=notes.filter((note)=>!note.pinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
  
          {pinned.length === 0 && notPinned.length===0 ? (
            <p className={styles.infoMessage}>No notes yet. Add one above!</p>
          ) : (
            <>
            {pinned.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
                onPasteToClipboardNote={onPasteToClipboardNote}
              />
            ))}
            {
              notPinned.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  onPasteToClipboardNote={onPasteToClipboardNote}
                />
              ))
            }
            </>
          )}
        </div>
      );
    };
    export default NotesList;