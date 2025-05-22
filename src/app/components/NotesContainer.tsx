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
}

const NotesContainer: React.FC<NotesContainerProps> = ({initialNotes}) => {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  

    const handleAddNote = async (title: string, content: string) => {
      setError(null); // Clear previous errors
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
        setNotes((prevNotes) => [...prevNotes, addedNote]);
      } catch (err: any) {
        setError(`Failed to add note: ${err.message}`);
        console.error('Error adding note:', err);
        throw err;
      }
    };
  
    const handleUpdateNote = async (id: number, title: string, content: string) => {
      setError(null); 
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
  
        const updatedNote: Note = await response.json();
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        );
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
        />
      </>
    );
  };

  export default NotesContainer;