// components/EditNoteFormModal.tsx
import React, { useState, useEffect } from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css'; 
import noteItemStyles from './NoteItem.module.css'; 
import Modal from './Modal'; 

interface EditNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  currentTitle: string;
  currentContent: string;
  currentPinned: boolean;
  onUpdateNote: (id: number, title: string, content: string, pinned: boolean) => Promise<void>;
}

const EditNoteFormModal: React.FC<EditNoteFormModalProps> = ({
  isOpen,
  onClose,
  noteId,
  currentTitle,
  currentContent,
  currentPinned,
  onUpdateNote,
}) => {
  const [editingNoteTitle, setEditingNoteTitle] = useState(currentTitle);
  const [editingNoteContent, setEditingNoteContent] = useState(currentContent);
  const [isPinned, setIsPinned] = useState(currentPinned);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditingNoteTitle(currentTitle);
      setEditingNoteContent(currentContent);
      setIsPinned(currentPinned);
      setFormError(null); 
    }
  }, [isOpen, currentTitle, currentContent, currentPinned]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingNoteTitle.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      await onUpdateNote(noteId, editingNoteTitle, editingNoteContent, isPinned);
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
            value={editingNoteTitle}
            onChange={(e) => setEditingNoteTitle(e.target.value)}
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
            value={editingNoteContent}
            onChange={(e) => setEditingNoteContent(e.target.value)}
            rows={4}
            className={styles.formTextarea}
          ></textarea>
        </div>
        <div className={noteItemStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="pinNote"
            checked={isPinned}
            onChange={() => setIsPinned(!isPinned)}
            className={styles.checkboxInput}
          />
          <label htmlFor="pinNote" className={noteItemStyles.checkboxLabel}>
            Pin Note
          </label>
        </div>
        <div className={styles.buttonGroup}> 
          <button type="submit" className={`${styles.button} ${styles.successButton}`}>
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNoteFormModal;