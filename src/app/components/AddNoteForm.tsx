import styles from '@/Home.module.css';
import { useState } from 'react';
import { useNotesStore } from '../store/notesStore';
import ErrorMessage from './ErrorMessage';

interface AddNoteFormProps {
    onClose: () => void; 
}
  
  const AddNoteForm: React.FC<AddNoteFormProps> = ({onClose }) => {
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const { addNoteApi } = useNotesStore();
    
    const autoGrow=(element: HTMLTextAreaElement) => {
      element.style.height = "5px";
      element.style.height = (element.scrollHeight) + "px";
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
  
      if (!newNoteTitle.trim()) {
        setFormError('Title cannot be empty.');
        return;
      }
  
      try {
        await addNoteApi(newNoteTitle, newNoteContent);
        setNewNoteTitle('');
        setNewNoteContent('');
        onClose(); 
      }catch (err: unknown) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
          errorMessage = `Error: ${err.message}`;
        }
        setFormError(errorMessage)
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
            className={styles.formTitle}
            required
            autoComplete="off"
            autoFocus
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
            onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
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