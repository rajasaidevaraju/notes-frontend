'use client'

import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import ContentList from './ContentList';
import AddContentForm from './AddContentForm';
import PinForm from './PinForm';
import Modal from './Modal';
import { useContentStore } from '../store/contentStore';
import { Note, UnifiedContent } from '@/types/Types';

interface NotesContainerProps {
    initialNotes: UnifiedContent[];
    initialError: string | null;
}

const CLIPBOARD_NOTE_TITLE = 'Clipboard';

const ContentContainer: React.FC<NotesContainerProps> = ({ initialNotes, initialError }) => {
    const {
        error,
        setContent,
        setClipboardNote,
        setLoading,
        setError,
        selectedContentKeys,
        hiddenContent,
        hideHiddenContent,
        clearSelectedContent,
        deleteSelectedContentApi,
        CheckAuthStatusApi,
        fetchHiddenContentApi,
        submitPinApi
    } = useContentStore();

    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
    const [isSelectingMode, setIsSelectingMode] = useState(false);

    useEffect(() => {
        const initialRegularNotes = initialNotes.filter(item => !(item.type === 'note' && item.title === CLIPBOARD_NOTE_TITLE));
        const initialClipboardNote = initialNotes.find(item => item.type === 'note' && item.title === CLIPBOARD_NOTE_TITLE) as Note | undefined;

        setContent(initialRegularNotes);
        setClipboardNote(initialClipboardNote || null);
        setError(initialError);
        setLoading(false);
    }, [initialNotes, initialError, setContent, setClipboardNote, setError, setLoading]);

    const handleConfirmMultiDelete = async () => {
        await deleteSelectedContentApi();
        setIsMultiDeleteModalOpen(false);
        setIsSelectingMode(false);
    };

    const toggleSelectingMode = () => {
        setIsSelectingMode(prev => !prev);
        clearSelectedContent();
    };

    const showHiddenNotes = async () => {
        try {
            const isLoggedIn = await CheckAuthStatusApi();
            if (isLoggedIn) {
                await fetchHiddenContentApi();
            } else {
                setIsPinModalOpen(true);
            }
        } catch {
            //do nothing
        }
    }

    return (
        <>
            <ErrorMessage message={error} />
            <div className={styles.noteHeader}>
                <h2 className={styles.notesSectionTitle}></h2>
                <div className={styles.mainActionButtons}>

                    {isSelectingMode ? (
                        <>
                            {selectedContentKeys.size > 0 && (
                                <button
                                    onClick={() => setIsMultiDeleteModalOpen(true)}
                                    className={`${styles.button} ${styles.dangerButton}`}
                                    title={`Delete ${selectedContentKeys.size} selected items`}
                                >
                                    Delete Selected ({selectedContentKeys.size})
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
                            title="Select Items for Deletion"
                        >
                            Select Items
                        </button>
                    )}
                    {hiddenContent.length > 0 ? (
                        <button className={`${styles.button}`} onClick={() => hideHiddenContent()}>
                            Hide Hidden Notes
                        </button>
                    ) : (
                        <button className={`${styles.button}`} onClick={() => showHiddenNotes()}>
                            Show Hidden Notes
                        </button>
                    )}


                    <button
                        onClick={() => setIsAddNoteModalOpen(true)}
                        className={`${styles.button} ${styles.primaryButton}`}
                    >
                        Create New
                    </button>

                </div>
            </div>


            <PinForm
                onClose={() => setIsPinModalOpen(false)}
                onSubmitPin={async (pin) => {
                    try {
                        await submitPinApi(pin);
                        await fetchHiddenContentApi();
                        setIsPinModalOpen(false);
                    } catch {
                        // Do nothing
                    }
                }
                }
                isOpen={isPinModalOpen}
            ></PinForm>

            <Modal
                isOpen={isAddNoteModalOpen}
                onClose={() => setIsAddNoteModalOpen(false)}
                title="Add New"
            >
                <AddContentForm
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
                        Are you sure you want to delete {selectedContentKeys.size} selected items?
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
                                clearSelectedContent();
                                setIsSelectingMode(false);
                            }}
                            className={`${styles.button}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            </Modal>

            <ContentList isSelectingMode={isSelectingMode} />
        </>
    );
};

export default ContentContainer;