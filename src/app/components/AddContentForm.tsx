import styles from '@/Home.module.css';
import { useState } from 'react';
import { useContentStore } from '../store/contentStore';
import ErrorMessage from './ErrorMessage';

interface AddContentFormProps {
    onClose: () => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [itemType, setItemType] = useState<'note' | 'checklist'>('note');
    const [formError, setFormError] = useState<string | null>(null);
    const { addNoteApi, addChecklistApi } = useContentStore();

    const autoGrow = (element: HTMLTextAreaElement) => {
        element.style.height = "auto";
        element.style.height = (element.scrollHeight) + "px";
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim()) {
            setFormError('Title cannot be empty.');
            return;
        }

        try {
            if (itemType === 'note') {
                await addNoteApi(title, content);
            } else {
                await addChecklistApi(title);
            }
            setTitle('');
            setContent('');
            onClose();
        } catch (err: unknown) {
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
                    autoComplete="off"
                />
            </div>

            {itemType === 'note' && (
                <div>
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
                    ></textarea>
                </div>
            )}

            <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
                Add {itemType === 'note' ? 'Note' : 'Checklist'}
            </button>
        </form>
    );
};

export default AddContentForm;
