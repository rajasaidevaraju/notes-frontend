import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import checklistStyles from './Checklist.module.css';
import noteItemStyles from './NoteItem.module.css';
import Modal from './Modal';
import ErrorMessage from './ErrorMessage';
import { Checklist, ChecklistItem } from '@/types/Types';

interface EditChecklistFormProps {
    isOpen: boolean;
    onClose: () => void;
    checklist: Checklist;
    onUpdateChecklist: (updatedChecklist: Checklist) => Promise<void>;
}

const EditChecklistForm: React.FC<EditChecklistFormProps> = ({
    isOpen,
    onClose,
    checklist,
    onUpdateChecklist,
}) => {
    const [title, setTitle] = useState(checklist.title);
    const [items, setItems] = useState<ChecklistItem[]>(checklist.items);
    const [newItemContent, setNewItemContent] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(checklist.title);
            setItems(checklist.items);
            setFormError(null);
        }
    }, [isOpen, checklist]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;

        const newItem: ChecklistItem = {
            id: Date.now() * -1, // Temporary negative ID
            checklistId: checklist.id,
            content: newItemContent.trim(),
            checked: false,
            position: items.length
        };

        setItems([...items, newItem]);
        setNewItemContent('');
    };

    const handleUpdateItemContent = (id: number, content: string) => {
        setItems(items.map(item => item.id === id ? { ...item, content } : item));
    };

    const handleToggleItemStatus = (id: number) => {
        setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const handleDeleteItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim()) {
            setFormError('Title cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            await onUpdateChecklist({
                ...checklist,
                title: title.trim(),
                items: items.map(item => ({ ...item, id: item.id < 0 ? 0 : item.id })) as any
            });
            onClose();
        } catch (err: any) {
            setFormError(err.message || 'Failed to update checklist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Checklist">
            <form onSubmit={handleSubmit} className={noteItemStyles.editForm}>
                {formError && <ErrorMessage message={formError} />}

                <div>
                    <label className={styles.formLabel}>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.formTitle}
                        required
                        placeholder="Enter checklist title"
                    />
                </div>

                <div className={checklistStyles.checklistItems}>
                    <label className={styles.formLabel}>Items</label>
                    {items.map((item) => (
                        <div key={item.id} className={checklistStyles.checklistItem}>
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggleItemStatus(item.id)}
                                className={checklistStyles.checkboxInput}
                            />
                            <input
                                type="text"
                                value={item.content}
                                onChange={(e) => handleUpdateItemContent(item.id, e.target.value)}
                                className={`${checklistStyles.itemInput} ${item.checked ? checklistStyles.itemChecked : ''}`}
                            />
                            <button
                                type="button"
                                className={checklistStyles.deleteItemButton}
                                onClick={() => handleDeleteItem(item.id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <div className={checklistStyles.checklistItem} style={{ marginTop: '0.5rem' }}>
                        <input type="checkbox" disabled className={checklistStyles.checkboxInput} />
                        <input
                            type="text"
                            value={newItemContent}
                            onChange={(e) => setNewItemContent(e.target.value)}
                            placeholder="Add new item..."
                            className={checklistStyles.itemInput}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddItem(e);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={`${styles.button} ${styles.successButton}`} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
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

export default EditChecklistForm;
