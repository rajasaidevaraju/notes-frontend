import styles from '@/Home.module.css';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

interface AddNoteFormProps {
    onAddNote: (title: string, content: string) => Promise<void>; // Callback to add note
    onClose: () => void; // Callback to close modal
  }
  
  const AddNoteForm: React.FC<AddNoteFormProps> = ({ onAddNote, onClose }) => {
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null); // Clear local form error
  
      if (!newNoteTitle.trim()) {
        setFormError('Title cannot be empty.');
        return;
      }
  
      try {
        await onAddNote(newNoteTitle, newNoteContent);
        setNewNoteTitle('');
        setNewNoteContent('');
        onClose(); // Close modal on successful add
      } catch (err: any) {
        // The error is handled by the parent (NotesContainer) which sets its global error state.
        // No need to set a local error here for API failures.
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        {formError && <ErrorMessage message={formError} />}
        <div>
          <label htmlFor="newNoteTitle" className={styles.formLabel}>
            Title
          </label>
          <input
            type="text"
            id="newNoteTitle"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Enter note title"
            className={styles.formInput}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="newNoteContent" className={styles.formLabel}>
            Content (Optional)
          </label>
          <textarea
            id="newNoteContent"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Enter note content"
            rows={4}
            className={styles.formTextarea}
          ></textarea>
        </div>
        <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
          Add Note
        </button>
      </form>
    );
  };

  export default AddNoteForm;