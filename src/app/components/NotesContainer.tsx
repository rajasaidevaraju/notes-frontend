'use client'

import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import NotesList from './NotesList';
import AddNoteForm from './AddNoteForm';
import PinForm from './PinForm';
import Modal from './Modal';
import { useNotesStore } from '../store/notesStore';
import { Note } from '@/types/Notes';

interface NotesContainerProps {
    initialNotes: Note[]; 
    initialError: string | null;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

const NotesContainer: React.FC<NotesContainerProps> = ({ initialNotes, initialError }) => {
    const {
        error,
        setNotes, 
        setClipboardNote,
        setLoading,
        setError, 
        selectedNoteIds,
        hiddenNotes,
        hideHiddenNotes,
        clearSelectedNotes,
        deleteSelectedNotes,
        fetchHiddenNotes
    } = useNotesStore();

    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
    const [isSelectingMode, setIsSelectingMode] = useState(false);

    useEffect(() => {
        const initialRegularNotes = initialNotes.filter(note => note.title !== CLIPBOARD_NOTE_TITLE);
        const initialClipboardNote = initialNotes.find(note => note.title === CLIPBOARD_NOTE_TITLE) || null;

        setNotes(initialRegularNotes);
        setClipboardNote(initialClipboardNote);
        setError(initialError);
        setLoading(false); 
    }, [initialNotes, initialError, setNotes, setClipboardNote, setError, setLoading]);

    var displayHiddenNotes = async (pin:string) => {
        fetchHiddenNotes(pin)
    }

    const handleConfirmMultiDelete = async () => {
        await deleteSelectedNotes();
        setIsMultiDeleteModalOpen(false);
        setIsSelectingMode(false);
    };

    const toggleSelectingMode = () => {
        setIsSelectingMode(prev => !prev);
        clearSelectedNotes();
    };

    return (
        <>
            <ErrorMessage message={error} />
            <div className={styles.noteHeader}>
                <h2 className={styles.notesSectionTitle}></h2>
                <div className={styles.mainActionButtons}>
                    
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
                                className={`${styles.button}`}
                                title="Cancel Selection"
                            >
                                Cancel Selection
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={toggleSelectingMode}
                            className={`${styles.button}`}
                            title="Select Notes for Deletion"
                        >
                            Select Notes
                        </button>
                    )}
                    {hiddenNotes.length>0?(
                        <button className={`${styles.button}`}onClick={()=>hideHiddenNotes()}>
                            Hide Hidden Notes
                        </button>
                    ):(
                        <button className={`${styles.button}`}onClick={()=>setIsPinModalOpen(true)}>
                            Show Hidden Notes
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
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                title="Enter Pin"
            >
                <PinForm 
                    onClose={() => setIsPinModalOpen(false)}
                    onSubmitPin={(pin)=>displayHiddenNotes(pin)}
                    isOpen={isPinModalOpen}
                ></PinForm>
            </Modal>   

            <Modal
                isOpen={isAddNoteModalOpen}
                onClose={() => setIsAddNoteModalOpen(false)}
                title="Add New Note"
            >
                <AddNoteForm
                    onClose={() => setIsAddNoteModalOpen(false)}
                />
            </Modal>



            <Modal
                isOpen={isMultiDeleteModalOpen}
                onClose={() => setIsMultiDeleteModalOpen(false)}
                title="Confirm Bulk Deletion"
            >
                <div className={styles.form}>
                    <p className={styles.modalBodyText}>
                    Are you sure you want to delete {selectedNoteIds.size} selected notes?
                    </p>
                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleConfirmMultiDelete}
                            className={`${styles.button} ${styles.deleteButton}`}
                        >
                            Yes, Delete All
                        </button>
                        <button
                            onClick={() => {
                                setIsMultiDeleteModalOpen(false);
                                clearSelectedNotes(); 
                                setIsSelectingMode(false);
                            }}
                            className={`${styles.button}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                
            </Modal>

            <NotesList
                isSelectingMode={isSelectingMode}
            />
        </>
    );
};

export default NotesContainer;