import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import { Checklist } from '@/types/Types';
import ConfirmActionModal from './ConfirmActionModal';
import EditChecklistForm from './EditChecklistForm';
import ChecklistView from './ChecklistView';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from "@/store/noteUiStore";

import ViewChecklistModal from './ViewChecklistModal';

interface CheckListItemProps {
    checklist: Checklist;
    isSelected: boolean;
    onToggleSelect: () => void;
    isSelectingMode: boolean;
}

const CheckListItem: React.FC<CheckListItemProps> = ({
    checklist,
    isSelected,
    onToggleSelect,
    isSelectingMode
}) => {
    const { updateChecklistApi, deleteChecklistApi, clearSelectedContent } = useContentStore();

    const [itemError, setItemError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isHideModalOpen, setIsHideModalOpen] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const minimized = useNoteUiStore((state) => state.minimizedNotes[checklist.id] ?? false);
    const toggleNoteMinimize = useNoteUiStore((state) => state.toggleNoteMinimize);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSelectingMode) {
            onToggleSelect();
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
        setItemError(null);
        clearSelectedContent();
        setCopyFeedback(null);
    };

    const handleUpdate = async (updatedChecklist: Checklist) => {
        setItemError(null);
        try {
            await updateChecklistApi(updatedChecklist);
        } catch (err: unknown) {
            let message = "Failed to update checklist";
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setItemError(message);
            throw err;
        }
    };


    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setItemError(null);
        try {
            await deleteChecklistApi(checklist.id);
            setIsDeleteModalOpen(false);
        } catch (err: unknown) {
            setIsDeleteModalOpen(false);
            let message = "Failed to delete checklist";
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setItemError(message);
        }
    };

    const handleTogglePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        handleUpdate({ ...checklist, pinned: !checklist.pinned });
    };

    const handleHideToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHideModalOpen(true);
    }

    const confirmHide = async () => {
        try {
            await handleUpdate({ ...checklist, hidden: !checklist.hidden });
            setIsHideModalOpen(false);
        } catch (_err: unknown) {
            setIsHideModalOpen(false);
        }
    };

    const handleCopyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setItemError(null);
        setCopyFeedback(null);

        try {
            if (navigator.clipboard) {
                const text = checklist.items.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.content}`).join('\n');
                await navigator.clipboard.writeText(text);
                setCopyFeedback('Copied!');
                setTimeout(() => setCopyFeedback(null), 2000);
            } else {
                throw new Error('Clipboard API not supported.');
            }
        } catch (err: unknown) {
            let message = 'Failed to copy content';
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setItemError(message);
            setTimeout(() => setItemError(null), 3000);
        }
    };

    return (
        <div
            className={`${noteItemStyles.noteItem} ${checklist.pinned ? noteItemStyles.pinnedNote : ''} ${isSelected ? noteItemStyles.selectedNote : ''}`}
            onClick={handleClick}
        >
            {itemError && <ErrorMessage message={itemError} />}

            <>
                <div className={noteItemStyles.noteHeader}>
                    <h3 className={noteItemStyles.noteTitle}>{truncateText(checklist.title, 50)}</h3>
                    {isSelectingMode ? (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className={noteItemStyles.multiSelectCheckbox}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className={noteItemStyles.buttonGroup}>
                            <button
                                onClick={handleTogglePin}
                                className={`${styles.button}`}
                                title={checklist.pinned ? 'Unpin' : 'Pin'}
                            >
                                {checklist.pinned ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={handleEditClick}
                                className={`${styles.button}`}
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className={`${styles.button}`}
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </button>
                            <button
                                onClick={handleCopyClick}
                                className={`${styles.button}`}
                                title="Copy Content"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>

                                {copyFeedback && <span style={{ marginLeft: '0.3rem' }}>{copyFeedback}</span>}
                            </button>
                            <button
                                onClick={handleHideToggle}
                                className={`${styles.button} ${styles.hideButton}`}
                                title={checklist.hidden ? 'Un-Hide' : 'Hide'}
                                aria-label={checklist.hidden ? 'Un-Hide' : 'Hide'}
                            >
                                {checklist.hidden ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <path d="M3 3l18 18"></path> <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                            <button className={`${styles.button}`} onClick={(e) => { e.stopPropagation(); toggleNoteMinimize(checklist.id); }} title={minimized ? 'Expand' : 'Minimize'} aria-label={minimized ? 'Expand' : 'Minimize'}>
                                {minimized ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                    </svg>

                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <ChecklistView
                        checklist={checklist}
                        isMinimized={minimized}
                        onReadMore={() => setIsViewModalOpen(true)}
                    />
                </div>

            </>

            <ViewChecklistModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                checklist={checklist}
            />


            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Checklist Deletion"
                message="Are you sure you want to delete this checklist?"
                confirmText="Yes, Delete"
                danger
            />

            <ConfirmActionModal
                isOpen={isHideModalOpen}
                onClose={() => setIsHideModalOpen(false)}
                onConfirm={confirmHide}
                title={checklist.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
                message={`Are you sure you want to ${checklist.hidden ? 'un-hide' : 'hide'} this checklist?${!checklist.hidden ? ' It will be moved to the hidden section and require authentication to view.' : ''}`}
                confirmText={`Yes, ${checklist.hidden ? 'Un-Hide' : 'Hide'}`}
            />

            <EditChecklistForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                checklist={checklist}
                onUpdateChecklist={handleUpdate}
            />
        </div>
    );
};

export default CheckListItem;
