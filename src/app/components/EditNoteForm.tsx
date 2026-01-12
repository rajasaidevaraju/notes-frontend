// components/EditNoteFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import Modal from './Modal';
import { Note } from '@/types/Types';

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

  useEffect(() => {
    if (isOpen) {
      setFormData(note);
      setFormError(null);
    }
    if (textareaRef.current) {
      autoGrow(textareaRef.current);
    }
  }, [isOpen, note]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prevData => ({
      ...prevData,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const autoGrow = (element: HTMLTextAreaElement) => {
    element.style.height = "5px";
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Note">
      <form onSubmit={handleSubmit} className={noteItemStyles.editForm}>
        {formError && <ErrorMessage message={formError} />}
        <div>
          <input
            type="text"
            id="editTitle"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.formTitle}
            required
            placeholder="Enter note title"
            autoComplete="off"
          />
        </div>
        <div>
          <textarea
            id="editContent"
            name="content"
            ref={textareaRef}
            value={formData.content}
            onChange={handleChange}
            onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}

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
              className={noteItemStyles.checkboxInput}
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
              onChange={handleChange}
              className={noteItemStyles.checkboxInput}
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