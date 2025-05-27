'use client'

import React, { useState } from 'react';
import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'
import ErrorMessage from './ErrorMessage';
import NotesList from './NotesList';
import AddNoteForm from './AddNoteForm'
import Modal from './Modal';


interface NotesContainerProps {
    initialNotes:Note[];
    initialError: string | null;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

const NotesContainer: React.FC<NotesContainerProps> = ({initialNotes, initialError}) => {
    const initialRegularNotes = initialNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE);
    const initialClipboardNote = initialNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;

    const [notes, setNotes] = useState<Note[]>(initialRegularNotes);
    const [clipboardNote, setClipboardNote] = useState<Note | null>(initialClipboardNote);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(initialError);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  

    const handleAddNote = async (title: string, content: string) => {
      setError(null);
      try {
        const response = await fetch(`/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const addedNote: Note = await response.json();
        setNotes((prevNotes) => [addedNote, ...prevNotes]);
        setIsAddNoteModalOpen(false);
      } catch (err: any) {
        setError(`Failed to add note: ${err.message}`);
        console.error('Error adding note:', err);
        throw err;
      }
    };
  
    const handleUpdateNote = async (id: number, title: string, content: string, pinned: boolean) => {
      setError(null); 
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content, pinned }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const updatedNote: Note = await response.json();
        
        // If the updated note is the clipboard note, update its specific state
        if (updatedNote.title === CLIPBOARD_NOTE_TITLE) {
          setClipboardNote(updatedNote);
        } else {
          // Otherwise, update the regular notes list
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
          );
        }
      } catch (err: any) {
        setError(`Failed to update note: ${err.message}`);
        console.error('Error updating note:', err);
        throw err;
      }
    };
  
    const handleDeleteNote = async (id: number) => {
      setError(null); 
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      } catch (err: any) {
        setError(`Failed to delete note: ${err.message}`);
        console.error('Error deleting note:', err);
        throw err;
      }
    };

    // Function to handle pasting content directly to the clipboard note
    const handlePasteToClipboardNote = async () => {
      setError(null); 
      if (!clipboardNote) {
        setError('Clipboard note not found. Please refresh the page.');
        return;
      }
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          await handleUpdateNote(clipboardNote.id, clipboardNote.title, text, clipboardNote.pinned);
        } else {
          setError('Clipboard API not supported or permission denied. Please ensure your browser supports it and you have granted permission.');
          console.warn('Clipboard API (readText) not supported or permission denied.');
        }
      } catch (err: any) {
        setError(`Failed to read clipboard: ${err.message}. Ensure you have granted permission.`);
        console.error('Error reading clipboard for paste:', err);
      }
    };
  
    return (
      <>
        <ErrorMessage message={error} />
        <div className={styles.noteHeader}>
        <h2 className={styles.notesSectionTitle}>Your Notes</h2>
            <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className={`${styles.button} ${styles.primaryButton} ${styles.createNoteButton}`}
            >
            Create New Note
            </button>
        </div>
       
  
        <Modal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          title="Add New Note"
        >
          <AddNoteForm
            onAddNote={handleAddNote}
            onClose={() => setIsAddNoteModalOpen(false)}
          />
        </Modal>
  
       
        <NotesList
          notes={notes}
          loading={loading}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          clipboardNote={clipboardNote} 
          onPasteToClipboardNote={handlePasteToClipboardNote}
        />
      </>
    );
  };

  export default NotesContainer;
