import React, { useState } from 'react';
import styles from '@/Home.module.css';
import trackerStyles from './Tracker.module.css';
import EntryRow from './EntryRow';
import EditableUnit from './EditableUnit';
import ErrorMessage from '@/components/ErrorMessage';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import EditableTitle from '@/components/EditableTitle';
import { Tracker } from '@/types/Types';
import { LIMITS } from '@/constants';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useAddTrackerEntryMutation } from '@/hooks/useContentQuery';

interface EditTrackerFormProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: Tracker;
  onUpdateTracker: (tracker: Tracker, deletedEntryIds?: number[]) => Promise<void>;
}

/**
 * Full tracker editor: title, unit, adding entries and marking existing ones for
 * deletion. Entry deletions are staged locally and only applied on save; added
 * entries post immediately, since the server timestamps them on arrival.
 */
const EditTrackerForm: React.FC<EditTrackerFormProps> = ({ isOpen, onClose, tracker, onUpdateTracker }) => {
  const [title, setTitle] = useState(tracker.title);
  const [unit, setUnit] = useState(tracker.unit || '');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletedEntryIds, setDeletedEntryIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const addTrackerEntryMutation = useAddTrackerEntryMutation();

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

  const handleAddEntry = async () => {
    const value = newValue.trim();
    if (!value || adding) return;

    setAdding(true);
    setFormError(null);
    try {
      await addTrackerEntryMutation.mutateAsync({ trackerId: tracker.id, value });
      setNewValue('');
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? `Failed to add entry: ${err.message}` : 'Failed to add entry'
      );
    } finally {
      setAdding(false);
    }
  };

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
        await addTrackerEntryMutation.mutateAsync({
          trackerId: tracker.id,
          value: newValue.trim(),
        });
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

export default EditTrackerForm;
