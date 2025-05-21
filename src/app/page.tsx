'use client'

import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import {Note} from '@/types/Notes'
import ErrorMessage from './components/ErrorMessage';
import NotesList from './components/NotesList';
import AddNoteForm from './components/AddNoteForm'
import Modal from './components/Modal';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false); // New state for modal

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (err: any) {
      setError(`Failed to fetch notes: ${err.message}`);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newNoteTitle, content: newNoteContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const addedNote: Note = await response.json();
      setNotes((prevNotes) => [...prevNotes, addedNote]);
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsAddNoteModalOpen(false); // Close modal on successful add
    } catch (err: any) {
      setError(`Failed to add note: ${err.message}`);
      console.error('Error adding note:', err);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteTitle(note.title);
    setEditingNoteContent(note.content);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId) return;
    if (!editingNoteTitle.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingNoteTitle, content: editingNoteContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedNote: Note = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      setEditingNoteId(null);
      setEditingNoteTitle('');
      setEditingNoteContent('');
    } catch (err: any) {
      setError(`Failed to update note: ${err.message}`);
      console.error('Error updating note:', err);
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
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>My Notes App</h1>

        <ErrorMessage message={error} />

        <button
          onClick={() => setIsAddNoteModalOpen(true)}
          className={`${styles.button} ${styles.primaryButton} ${styles.createNoteButton}`}
        >
          Create New Note
        </button>

        <Modal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          title="Add New Note"
        >
          <AddNoteForm
            newNoteTitle={newNoteTitle}
            setNewNoteTitle={setNewNoteTitle}
            newNoteContent={newNoteContent}
            setNewNoteContent={setNewNoteContent}
            handleAddNote={handleAddNote}
            onSuccess={() => setIsAddNoteModalOpen(false)} // Close modal on success
          />
        </Modal>

        <h2 className={styles.notesSectionTitle}>Your Notes</h2>
        <NotesList
          notes={notes}
          loading={loading}
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
      </div>
    </div>
  );
}