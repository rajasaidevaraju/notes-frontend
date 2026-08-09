import styles from '@/Home.module.css';
import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import ConfirmActionModal from './ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { LIMITS } from '@/constants';
import { ContentType } from '@/types/Types';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import { useAddNoteMutation, useAddChecklistMutation, useAddTrackerMutation } from '@/hooks/useContentQuery';

const TYPE_OPTIONS: Array<{ type: ContentType; label: string }> = [
  { type: 'note', label: 'Note' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'tracker', label: 'Tracker' },
];

interface AddContentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unit, setUnit] = useState('');
  const [itemType, setItemType] = useState<ContentType>('note');
  const [formError, setFormError] = useState<string | null>(null);

  const addNoteMutation = useAddNoteMutation();
  const addChecklistMutation = useAddChecklistMutation();
  const addTrackerMutation = useAddTrackerMutation();

  const isDirty = title.trim() !== '' || content.trim() !== '' || unit.trim() !== '';
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setTitle('');
    setContent('');
    setUnit('');
    setItemType('note');
    setFormError(null);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      if (itemType === 'note') {
        await addNoteMutation.mutateAsync({ title, content });
      } else if (itemType === 'checklist') {
        await addChecklistMutation.mutateAsync(title);
      } else {
        await addTrackerMutation.mutateAsync({ title, unit: unit.trim() || null });
      }
      setTitle('');
      setContent('');
      setUnit('');
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, `Failed to add ${itemType}`));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} title="Add New">
        <form onSubmit={handleSubmit} className={styles.form}>
          <ErrorMessage message={formError} />

          <div className={styles.typePicker} role="group" aria-label="Item type">
            {TYPE_OPTIONS.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setItemType(type)}
                className={`${styles.button} ${itemType === type ? styles.primaryButton : ''}`}
                aria-pressed={itemType === type}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="itemTitle" className={styles.formLabel}>
              Title
            </label>
            <input
              type="text"
              id="itemTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${itemType} title`}
              className={styles.formTitle}
              required
              maxLength={LIMITS.TITLE}
              autoComplete="off"
            />
          </div>

          {itemType === 'tracker' && (
            <div>
              <label htmlFor="itemUnit" className={styles.formLabel}>
                Unit (Optional)
              </label>
              <input
                type="text"
                id="itemUnit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, steps, hours…"
                className={styles.formTitle}
                maxLength={LIMITS.TRACKER_UNIT}
                autoComplete="off"
              />
            </div>
          )}

          {itemType === 'note' && (
            <div className={styles.formFieldGrow}>
              <label htmlFor="itemContent" className={styles.formLabel}>
                Content (Optional)
              </label>
              <textarea
                id="itemContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content"
                onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
                className={styles.formTextarea}
                maxLength={LIMITS.NOTE_CONTENT}
              ></textarea>
            </div>
          )}

          <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
            Add {TYPE_OPTIONS.find((option) => option.type === itemType)?.label}
          </button>
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

export default AddContentForm;
