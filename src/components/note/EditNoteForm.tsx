import React, { useState, useLayoutEffect, useRef } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from '@/components/ItemCard.module.css';
import Modal from '@/components/Modal';
import EditableTitle from '@/components/EditableTitle';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Note } from '@/types/Types';
import { LIMITS } from '@/constants';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import { useUpdateNoteMutation } from '@/hooks/useContentQuery';

interface EditNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const EditNoteFormModal: React.FC<EditNoteFormModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [formData, setFormData] = useState(note);
  const [formError, setFormError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const updateNoteMutation = useUpdateNoteMutation();

  const isDirty =
    formData.title !== note.title ||
    formData.content !== note.content ||
    formData.pinned !== note.pinned ||
    formData.hidden !== note.hidden ||
    formData.archived !== note.archived;

  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setFormData(note);
    setFormError(null);
  });

  useLayoutEffect(() => {
    if (isOpen && textareaRef.current) {
      autoGrow(textareaRef.current);
    }
  }, [isOpen, formData.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData((prevData) => ({
      ...prevData,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      await updateNoteMutation.mutateAsync(formData);
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, 'Failed to update note'));
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        title={
          <EditableTitle
            value={formData.title}
            onChange={(title) => setFormData((prev) => ({ ...prev, title }))}
            placeholder="Note title"
          />
        }
      >
        <form onSubmit={handleSubmit} className={noteItemStyles.editForm}>
          {formError && <ErrorMessage message={formError} />}
          <textarea
            id="editContent"
            name="content"
            ref={textareaRef}
            value={formData.content}
            onChange={handleChange}
            onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
            className={styles.formTextarea}
            maxLength={LIMITS.NOTE_CONTENT}
          ></textarea>
          <div className={noteItemStyles.checkboxRow}>
            <div className={noteItemStyles.checkboxField}>
              <input
                type="checkbox"
                id="pinNote"
                name="pinned"
                checked={formData.pinned}
                onChange={handleChange}
                className={noteItemStyles.checkboxInput}
              />
              <label htmlFor="pinNote" className={noteItemStyles.checkboxLabel}>
                Pin Note
              </label>
            </div>
            <div className={noteItemStyles.checkboxField}>
              <input
                type="checkbox"
                id="hideNote"
                name="hidden"
                checked={formData.hidden}
                onChange={handleChange}
                className={noteItemStyles.checkboxInput}
              />
              <label htmlFor="hideNote" className={noteItemStyles.checkboxLabel}>
                Hide Note
              </label>
            </div>
            <div className={noteItemStyles.checkboxField}>
              <input
                type="checkbox"
                id="archiveNote"
                name="archived"
                checked={formData.archived}
                onChange={handleChange}
                className={noteItemStyles.checkboxInput}
              />
              <label htmlFor="archiveNote" className={noteItemStyles.checkboxLabel}>
                Archive Note
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={`${styles.button} ${styles.successButton}`}
              disabled={updateNoteMutation.isPending}
            >
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

export default EditNoteFormModal;