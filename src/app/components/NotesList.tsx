import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'
import NoteItem from './NoteItem'

interface NotesListProps {
    notes: Note[];
    loading: boolean;
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
  
  const NotesList: React.FC<NotesListProps> = ({
    notes,
    loading,
    editingNoteId,
    editingNoteTitle,
    setEditingNoteTitle,
    editingNoteContent,
    setEditingNoteContent,
    handleEditClick,
    handleUpdateNote,
    handleDeleteNote,
    setEditingNoteId,
  }) => {
    if (loading) {
      return <p className={styles.infoMessage}>Loading notes...</p>;
    }
  
    if (notes.length === 0) {
      return <p className={styles.infoMessage}>No notes yet. Add one above!</p>;
    }
  
    return (
      <div className={styles.notesList}>
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            editingNoteId={editingNoteId}
            editingNoteTitle={editingNoteTitle}
            setEditingNoteTitle={setEditingNoteTitle}
            editingNoteContent={editingNoteContent}
            setEditingNoteContent={setEditingNoteContent}
            handleEditClick={handleEditClick}
            handleUpdateNote={handleUpdateNote}
            handleDeleteNote={handleDeleteNote}
            setEditingNoteId={setEditingNoteId}
          />
        ))}
      </div>
    );
  };

  export default NotesList;