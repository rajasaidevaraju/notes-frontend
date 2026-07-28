import styles from '@/Home.module.css';
import React, { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import ConfirmActionModal from './ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { LIMITS } from '@/constants';
import { useAddNoteMutation, useAddChecklistMutation, useAddTrackerMutation } from '@/hooks/useContentQuery';

interface AddContentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unit, setUnit] = useState('');
  const [itemType, setItemType] = useState<'note' | 'checklist' | 'tracker'>('note');
  const [formError, setFormError] = useState<string | null>(null);

  const addNoteMutation = useAddNoteMutation();
  const addChecklistMutation = useAddChecklistMutation();
  const addTrackerMutation = useAddTrackerMutation();

  const isDirty = title.trim() !== '' || content.trim() !== '' || unit.trim() !== '';
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setUnit('');
      setItemType('note');
      setFormError(null);
    }
  }, [isOpen]);

  const autoGrow = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

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
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }
      setFormError(errorMessage);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} title="Add New">
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <ErrorMessage message={formError} />}

          <div className={styles.buttonGroup} style={{ marginBottom: '1rem', opacity: 1 }}>
            <button
              type="button"
              onClick={() => setItemType('note')}
              className={`${styles.button} ${itemType === 'note' ? styles.primaryButton : ''}`}
              style={{ flex: 1 }}
            >
              Note
            </button>
            <button
              type="button"
              onClick={() => setItemType('checklist')}
              className={`${styles.button} ${itemType === 'checklist' ? styles.primaryButton : ''}`}
              style={{ flex: 1 }}
            >
              Checklist
            </button>
            <button
              type="button"
              onClick={() => setItemType('tracker')}
              className={`${styles.button} ${itemType === 'tracker' ? styles.primaryButton : ''}`}
              style={{ flex: 1 }}
            >
              Tracker
            </button>
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
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            Add {itemType === 'note' ? 'Note' : itemType === 'checklist' ? 'Checklist' : 'Tracker'}
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
