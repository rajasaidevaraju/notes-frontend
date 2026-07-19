import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import trackerStyles from './Tracker.module.css';
import { Tracker, TrackerEntry } from '@/types/Types';
import ConfirmActionModal from './ConfirmActionModal';
import Modal from './Modal';
import EditableTitle from './EditableTitle';
import ItemToolbar from './ItemToolbar';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from '@/store/noteUiStore';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { LIMITS } from '@/constants';

const VISIBLE_ENTRIES = 5;

const formatEntryTime = (recordedAt: string): string => {
    const date = new Date(recordedAt);
    if (isNaN(date.getTime())) return recordedAt;

    const now = new Date();
    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay(date, now)) return `today ${time}`;
    if (sameDay(date, yesterday)) return `yesterday ${time}`;

    const dateStr = date.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    });
    return `${dateStr}, ${time}`;
};

interface EntryRowProps {
    entry: TrackerEntry;
    unit: string | null;
    onDelete?: (entryId: number) => void;
}

// Read-only unless onDelete is passed (only the edit modal passes it)
const EntryRow: React.FC<EntryRowProps> = ({ entry, unit, onDelete }) => (
    <div className={trackerStyles.entryRow}>
        <span className={trackerStyles.entryValue}>
            {entry.value}{unit ? ` ${unit}` : ''}
        </span>
        <span className={trackerStyles.entryTime}>{formatEntryTime(entry.recordedAt)}</span>
        {onDelete && (
            <button
                type="button"
                className={trackerStyles.entryDelete}
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                title="Delete entry"
                aria-label="Delete entry"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        )}
    </div>
);

interface EditableUnitProps {
    value: string;
    onChange: (value: string) => void;
}

// Subdued click-to-edit unit shown under the title; units rarely change
const EditableUnit: React.FC<EditableUnitProps> = ({ value, onChange }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault();
                        setEditing(false);
                    }
                }}
                className={trackerStyles.unitInput}
                placeholder="kg, steps, hours…"
                maxLength={LIMITS.TRACKER_UNIT}
                autoComplete="off"
                aria-label="Unit"
            />
        );
    }

    return (
        <span
            className={trackerStyles.unitChip}
            onClick={() => setEditing(true)}
            title="Click to edit unit"
        >
            {value.trim() ? `unit: ${value}` : '+ add unit'}
        </span>
    );
};

interface EditTrackerFormProps {
    isOpen: boolean;
    onClose: () => void;
    tracker: Tracker;
    onUpdateTracker: (tracker: Tracker, deletedEntryIds?: number[]) => Promise<void>;
}

const EditTrackerForm: React.FC<EditTrackerFormProps> = ({ isOpen, onClose, tracker, onUpdateTracker }) => {
    const { addTrackerEntryApi } = useContentStore();
    const [title, setTitle] = useState(tracker.title);
    const [unit, setUnit] = useState(tracker.unit || '');
    const [newValue, setNewValue] = useState('');
    const [adding, setAdding] = useState(false);
    const [deletedEntryIds, setDeletedEntryIds] = useState<number[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    const isDirty =
        title !== tracker.title ||
        unit !== (tracker.unit || '') ||
        newValue.trim() !== '' ||
        deletedEntryIds.length > 0;
    const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
        useUnsavedChangesGuard(isDirty, onClose);

    React.useLayoutEffect(() => {
        if (isOpen) {
            setTitle(tracker.title);
            setUnit(tracker.unit || '');
            setNewValue('');
            setDeletedEntryIds([]);
            setFormError(null);
        }
    }, [isOpen, tracker]);

    // Entry changes apply immediately (server stamps the time); only
    // title/unit wait for Save
    const handleAddEntry = async () => {
        const value = newValue.trim();
        if (!value || adding) return;

        setAdding(true);
        setFormError(null);
        try {
            await addTrackerEntryApi(tracker.id, value);
            setNewValue('');
        } catch (err: unknown) {
            let message = 'Failed to add entry';
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setFormError(message);
        } finally {
            setAdding(false);
        }
    };

    // Deletions are local until Save Changes; the update API applies them
    const handleDeleteEntry = (entryId: number) => {
        setDeletedEntryIds((ids) => (ids.includes(entryId) ? ids : [...ids, entryId]));
    };

    const remainingEntries = tracker.entries.filter((entry) => !deletedEntryIds.includes(entry.id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim()) {
            setFormError('Title cannot be empty.');
            return;
        }

        try {
            if (newValue.trim()) {
                await addTrackerEntryApi(tracker.id, newValue.trim());
                setNewValue('');
            }
            await onUpdateTracker(
                { ...tracker, title: title.trim(), unit: unit.trim() || null },
                deletedEntryIds.length > 0 ? deletedEntryIds : undefined
            );
            onClose();
        } catch (err: unknown) {
            let message = 'Failed to update tracker';
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setFormError(message);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={requestClose}
                title={
                    <div className={trackerStyles.titleBlock}>
                        <EditableTitle value={title} onChange={setTitle} placeholder="Tracker title" />
                        <EditableUnit value={unit} onChange={setUnit} />
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    {formError && <ErrorMessage message={formError} />}
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <label htmlFor="trackerNewEntry" className={styles.formLabel}>Entries</label>
                        <div className={trackerStyles.quickAddRow}>
                            <input
                                type="text"
                                id="trackerNewEntry"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddEntry();
                                    }
                                }}
                                placeholder={unit.trim() ? `Add new value (${unit.trim()})...` : 'Add new value...'}
                                className={trackerStyles.quickAddInput}
                                maxLength={LIMITS.TRACKER_VALUE}
                                aria-label="New entry value"
                            />
                        </div>

                        {remainingEntries.length === 0 ? (
                            <p className={trackerStyles.emptyHint}>No entries yet. Add the first value above.</p>
                        ) : (
                            <div className={trackerStyles.entryList}>
                                {remainingEntries.map((entry) => (
                                    <EntryRow
                                        key={entry.id}
                                        entry={entry}
                                        unit={tracker.unit}
                                        onDelete={handleDeleteEntry}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={`${styles.button} ${styles.successButton}`}>
                            Save Changes
                        </button>
                        <button type="button" onClick={requestClose} className={`${styles.button}`}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmActionModal
                isOpen={isConfirmOpen}
                onClose={cancelDiscard}
                onConfirm={confirmDiscard}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to cancel? Your changes will be lost."
                confirmText="Discard"
                cancelText="Keep Editing"
                danger
            />

        </>
    );
};

interface TrackerItemProps {
    tracker: Tracker;
    isSelected: boolean;
    onToggleSelect: () => void;
    isSelectingMode: boolean;
}

const TrackerItem: React.FC<TrackerItemProps> = ({
    tracker,
    isSelected,
    onToggleSelect,
    isSelectingMode
}) => {
    const { updateTrackerApi, deleteTrackerApi, clearSelectedContent } = useContentStore();

    const [itemError, setItemError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isHideModalOpen, setIsHideModalOpen] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const minimized = useNoteUiStore((state) => state.minimizedNotes[tracker.id] ?? false);
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

    const handleUpdate = async (updatedTracker: Tracker, deletedEntryIds?: number[]) => {
        setItemError(null);
        try {
            await updateTrackerApi(updatedTracker, deletedEntryIds);
        } catch (err: unknown) {
            let message = 'Failed to update tracker';
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
            await deleteTrackerApi(tracker.id);
            setIsDeleteModalOpen(false);
        } catch (err: unknown) {
            setIsDeleteModalOpen(false);
            let message = 'Failed to delete tracker';
            if (err instanceof Error) {
                message = `${message}: ${err.message}`;
            }
            setItemError(message);
        }
    };

    const handleTogglePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        handleUpdate({ ...tracker, pinned: !tracker.pinned });
    };

    const handleHideToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHideModalOpen(true);
    };

    const confirmHide = async () => {
        try {
            await handleUpdate({ ...tracker, hidden: !tracker.hidden });
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
                const text = tracker.entries
                    .map(en => `${en.value}${tracker.unit ? ` ${tracker.unit}` : ''}\t${en.recordedAt}`)
                    .join('\n');
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

    const visibleEntries = tracker.entries.slice(0, VISIBLE_ENTRIES);
    const hiddenCount = tracker.entries.length - visibleEntries.length;

    return (
        <div
            className={`${noteItemStyles.noteItem} ${tracker.pinned ? noteItemStyles.pinnedNote : ''} ${tracker.hidden ? noteItemStyles.hiddenNote : ''} ${isSelected ? noteItemStyles.selectedNote : ''}`}
            onClick={handleClick}
        >
            {itemError && <ErrorMessage message={itemError} />}

            <>
                <div className={noteItemStyles.noteHeader}>
                    <h3 className={noteItemStyles.noteTitle}>
                        {truncateText(tracker.title, 50)}
                        {tracker.unit ? ` (${tracker.unit})` : ''}
                    </h3>
                    {isSelectingMode ? (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className={noteItemStyles.multiSelectCheckbox}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <ItemToolbar
                            pinned={tracker.pinned}
                            hidden={tracker.hidden}
                            minimized={minimized}
                            copyFeedback={copyFeedback}
                            onTogglePin={handleTogglePin}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onCopy={handleCopyClick}
                            onToggleHide={handleHideToggle}
                            onToggleMinimize={(e) => { e.stopPropagation(); toggleNoteMinimize(tracker.id); }}
                        />
                    )}
                </div>

                {minimized ? (
                    <p className={noteItemStyles.noteContent}>...</p>
                ) : (
                    <div>
                        {tracker.entries.length === 0 ? (
                            <p className={trackerStyles.emptyHint}>No entries yet. Press Edit to add the first value.</p>
                        ) : (
                            <div className={trackerStyles.entryList}>
                                {visibleEntries.map((entry) => (
                                    <EntryRow
                                        key={entry.id}
                                        entry={entry}
                                        unit={tracker.unit}
                                    />
                                ))}
                            </div>
                        )}

                        {hiddenCount > 0 && (
                            <button
                                className={trackerStyles.viewAllButton}
                                onClick={(e) => { e.stopPropagation(); setIsViewModalOpen(true); }}
                            >
                                View all {tracker.entries.length} entries
                            </button>
                        )}
                    </div>
                )}
            </>

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={tracker.unit ? `${tracker.title} (${tracker.unit})` : tracker.title}
            >
                <div className={noteItemStyles.viewContentContainer}>
                    <div className={trackerStyles.entryList}>
                        {tracker.entries.map((entry) => (
                            <EntryRow
                                key={entry.id}
                                entry={entry}
                                unit={tracker.unit}
                            />
                        ))}
                    </div>
                </div>
            </Modal>

            <ConfirmActionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Tracker Deletion"
                message="Are you sure you want to delete this tracker and all its entries?"
                confirmText="Yes, Delete"
                danger
            />

            <ConfirmActionModal
                isOpen={isHideModalOpen}
                onClose={() => setIsHideModalOpen(false)}
                onConfirm={confirmHide}
                title={tracker.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
                message={`Are you sure you want to ${tracker.hidden ? 'un-hide' : 'hide'} this tracker?${!tracker.hidden ? ' It will be moved to the hidden section and require authentication to view.' : ''}`}
                confirmText={`Yes, ${tracker.hidden ? 'Un-Hide' : 'Hide'}`}
            />

            <EditTrackerForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                tracker={tracker}
                onUpdateTracker={handleUpdate}
            />
        </div>
    );
};

export default TrackerItem;
