// components/EditNoteFormModal.tsx
import React, { useState, useEffect } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import Modal from './Modal';
import { Note } from '@/types/Notes';

interface EditNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onUpdateNote: (note:Note) => Promise<void>;
}

const EditNoteFormModal: React.FC<EditNoteFormModalProps> = ({
  isOpen,
  onClose,
  note,
  onUpdateNote,
}) => {
  const [formData, setFormData] = useState(note);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(note);
      setFormError(null);
    }
  }, [isOpen, note]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prevData => ({
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Note">
      <form onSubmit={handleSubmit} className={styles.form}>
        {formError && <ErrorMessage message={formError} />}
        <div>
          <label htmlFor="editTitle" className={styles.formLabel}>
            Title
          </label>
          <input
            type="text"
            id="editTitle"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.formInput}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="editContent" className={styles.formLabel}>
            Content
          </label>
          <textarea
            id="editContent"
            name="content" 
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className={styles.formTextarea}
          ></textarea>
        </div>
        <div>
          <div>
            <input
              type="checkbox"
              id="pinNote"
              name="pinned"
              checked={formData.pinned}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="pinNote" className={noteItemStyles.checkboxLabel}>
              Pin Note
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id="hideNote"
              name="hidden"
              checked={formData.hidden ?? false}
              onChange={handleChange}
              className={styles.checkboxInput}
              disabled={formData.hidden}
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
            onClick={onClose}
            className={`${styles.button}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNoteFormModal;