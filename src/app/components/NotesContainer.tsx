'use client'

import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import NotesList from './NotesList';
import AddNoteForm from './AddNoteForm';
import Modal from './Modal';
import { useNotesStore } from '../store/notesStore'; // Adjust path as needed
import { Note } from '@/types/Notes'; // Import Note type

interface NotesContainerProps {
    initialNotes: Note[]; 
    initialError: string | null;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard'; // Define this constant here as well for clarity

const NotesContainer: React.FC<NotesContainerProps> = ({ initialNotes, initialError }) => {
    const {
        error,
        setNotes, 
        setClipboardNote,
        setLoading,
        setError, 
        addNoteApi,
        selectedNoteIds,
        clearSelectedNotes,
        deleteSelectedNotes,
    } = useNotesStore();

    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
    const [isSelectingMode, setIsSelectingMode] = useState(false);

    // Use useEffect to initialize the Zustand store with initial data
    useEffect(() => {
        const initialRegularNotes = initialNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE);
        const initialClipboardNote = initialNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;

        setNotes(initialRegularNotes);
        setClipboardNote(initialClipboardNote);
        setError(initialError);
        setLoading(false); 
    }, [initialNotes, initialError, setNotes, setClipboardNote, setError, setLoading]);

    const handleAddNoteSubmit = async (title: string, content: string) => {
        try {
            await addNoteApi(title, content);
            setIsAddNoteModalOpen(false);
        } catch (err) {
            // Error is already set by the store's addNoteApi action
            console.error("Error adding note in container:", err);
        }
    };

    const handleConfirmMultiDelete = async () => {
        await deleteSelectedNotes();
        setIsMultiDeleteModalOpen(false);
        setIsSelectingMode(false); // Exit selection mode after deleting
    };

    const toggleSelectingMode = () => {
        setIsSelectingMode(prev => !prev);
        clearSelectedNotes(); // Clear any existing selection when toggling mode
    };

    return (
        <>
            <ErrorMessage message={error} />
            <div className={styles.noteHeader}>
                <h2 className={styles.notesSectionTitle}></h2>
                <div className={styles.mainActionButtons}>
                    {/* Multi-select controls */}
                    {isSelectingMode ? (
                        <>
                            {selectedNoteIds.size > 0 && (
                                <button
                                    onClick={() => setIsMultiDeleteModalOpen(true)}
                                    className={`${styles.button} ${styles.dangerButton}`}
                                    title={`Delete ${selectedNoteIds.size} selected notes`}
                                >
                                    Delete Selected ({selectedNoteIds.size})
                                </button>
                            )}
                            <button
                                onClick={toggleSelectingMode}
                                className={`${styles.button} ${styles.secondaryButton}`}
                                title="Cancel Selection"
                            >
                                Cancel Selection
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={toggleSelectingMode}
                            className={`${styles.button} ${styles.secondaryButton}`}
                            title="Select Notes for Deletion"
                        >
                            Select Notes
                        </button>
                    )}

                   
                    <button
                        onClick={() => setIsAddNoteModalOpen(true)}
                        className={`${styles.button} ${styles.primaryButton}`}
                    >
                        Create New Note
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isAddNoteModalOpen}
                onClose={() => setIsAddNoteModalOpen(false)}
                title="Add New Note"
            >
                <AddNoteForm
                    onAddNote={handleAddNoteSubmit}
                    onClose={() => setIsAddNoteModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isMultiDeleteModalOpen}
                onClose={() => setIsMultiDeleteModalOpen(false)}
                title="Confirm Bulk Deletion"
            >
                <p className={styles.modalBodyText}>
                    Are you sure you want to delete {selectedNoteIds.size} selected notes?
                </p>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleConfirmMultiDelete}
                        className={`${styles.button} ${styles.dangerButton}`}
                    >
                        Yes, Delete All
                    </button>
                    <button
                        onClick={() => {
                            setIsMultiDeleteModalOpen(false);
                            clearSelectedNotes(); 
                            setIsSelectingMode(false);
                        }}
                        className={`${styles.button} ${styles.cancelButton}`}
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <NotesList
                isSelectingMode={isSelectingMode}
            />
        </>
    );
};

export default NotesContainer;