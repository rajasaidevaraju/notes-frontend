import styles from '@/Home.module.css';

interface AddNoteFormProps {
    newNoteTitle: string;
    setNewNoteTitle: (title: string) => void;
    newNoteContent: string;
    setNewNoteContent: (content: string) => void;
    handleAddNote: (e: React.FormEvent) => void;
    onSuccess: () => void; // Callback to close modal on success
  }
  
  const AddNoteForm: React.FC<AddNoteFormProps> = ({
    newNoteTitle,
    setNewNoteTitle,
    newNoteContent,
    setNewNoteContent,
    handleAddNote,
    onSuccess,
  }) => {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleAddNote(e);
      onSuccess();
    };
  
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
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