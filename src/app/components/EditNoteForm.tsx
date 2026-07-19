// components/EditNoteFormModal.tsx
import React, { useState, useLayoutEffect, useRef } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import Modal from './Modal';
import EditableTitle from './EditableTitle';
import ConfirmActionModal from './ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { Note } from '@/types/Types';
import { LIMITS } from '@/constants';

interface EditNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onUpdateNote: (note: Note) => Promise<void>;
}

const EditNoteFormModal: React.FC<EditNoteFormModalProps> = ({
  isOpen,
  onClose,
  note,
  onUpdateNote,
}) => {
  const [formData, setFormData] = useState(note);
  const [formError, setFormError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isDirty =
    formData.title !== note.title ||
    formData.content !== note.content ||
    formData.pinned !== note.pinned ||
    formData.hidden !== note.hidden;

  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useLayoutEffect(() => {
    if (isOpen) {
      setFormData(note);
      setFormError(null);
    }
  }, [isOpen, note]);

  // Runs after the content above is rendered, so the measured height is current
  useLayoutEffect(() => {
    if (isOpen && textareaRef.current) {
      autoGrow(textareaRef.current);
    }
  }, [isOpen, formData.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prevData => ({
      ...prevData,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const autoGrow = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      await onUpdateNote(formData);
      onClose();
    } catch (err: unknown) {
      let message = "Failed to update note";
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
        <EditableTitle
          value={formData.title}
          onChange={(title) => setFormData(prev => ({ ...prev, title }))}
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
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={`${styles.button} ${styles.successButton}`}>
            Save Changes
          </button>
          <button
            type="button"
            onClick={requestClose}
            className={`${styles.button}`}
          >
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