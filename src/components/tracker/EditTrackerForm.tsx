import React, { useState } from 'react';
import EntryRow from './EntryRow';
import EditableUnit from './EditableUnit';
import ErrorMessage from '@/components/ErrorMessage';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import EditableTitle from '@/components/EditableTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tracker } from '@/types/Types';
import { LIMITS } from '@/constants';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { toMessage } from '@/utils/errors';
import { useAddTrackerEntryMutation, useUpdateTrackerMutation } from '@/hooks/useContentQuery';

interface EditTrackerFormProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: Tracker;
}

const EditTrackerForm: React.FC<EditTrackerFormProps> = ({ isOpen, onClose, tracker }) => {
  const [title, setTitle] = useState(tracker.title);
  const [unit, setUnit] = useState(tracker.unit || '');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletedEntryIds, setDeletedEntryIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const addTrackerEntryMutation = useAddTrackerEntryMutation();
  const updateTrackerMutation = useUpdateTrackerMutation();

  const isDirty =
    title !== tracker.title ||
    unit !== (tracker.unit || '') ||
    newValue.trim() !== '' ||
    deletedEntryIds.length > 0;
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setTitle(tracker.title);
    setUnit(tracker.unit || '');
    setNewValue('');
    setDeletedEntryIds([]);
    setFormError(null);
  });

  const handleAddEntry = async () => {
    const value = newValue.trim();
    if (!value || adding) return;

    setAdding(true);
    setFormError(null);
    try {
      await addTrackerEntryMutation.mutateAsync({ trackerId: tracker.id, value });
      setNewValue('');
    } catch (err: unknown) {
      setFormError(toMessage(err, 'Failed to add entry'));
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
      await updateTrackerMutation.mutateAsync({
        tracker: { ...tracker, title: title.trim(), unit: unit.trim() || null },
        deletedEntryIds: deletedEntryIds.length > 0 ? deletedEntryIds : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, 'Failed to update tracker'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      title={
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <EditableTitle value={title} onChange={setTitle} placeholder="Tracker title" />
          <EditableUnit value={unit} onChange={setUnit} />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
        <ErrorMessage message={formError} />
        <div className="flex min-h-0 flex-col gap-2">
          <Label htmlFor="trackerNewEntry">Entries</Label>
          <Input
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
            maxLength={LIMITS.TRACKER_VALUE}
            aria-label="New entry value"
          />

          {remainingEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Add the first value above.</p>
          ) : (
            <div className="flex min-h-0 flex-col overflow-y-auto pr-2">
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>

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
    </Modal>
  );
};

export default EditTrackerForm;
