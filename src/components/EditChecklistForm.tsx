import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import checklistStyles from './Checklist.module.css';
import noteItemStyles from './NoteItem.module.css';
import Modal from './Modal';
import EditableTitle from './EditableTitle';
import ErrorMessage from './ErrorMessage';
import ConfirmActionModal from './ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { Checklist, ChecklistItem } from '@/types/Types';
import { LIMITS } from '@/constants';
import { useUpdateChecklistMutation } from '@/hooks/useContentQuery';

type EditableChecklistItem = Omit<ChecklistItem, 'id'> & { id: number | string };

interface EditChecklistFormProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: Checklist;
}

const EditChecklistForm: React.FC<EditChecklistFormProps> = ({
  isOpen,
  onClose,
  checklist,
}) => {
  const [title, setTitle] = useState(checklist.title);
  const [items, setItems] = useState<EditableChecklistItem[]>(checklist.items);
  const [newItemContent, setNewItemContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const updateChecklistMutation = useUpdateChecklistMutation();

  const itemsSnapshot = (list: EditableChecklistItem[]) =>
    JSON.stringify(list.map((item) => ({ content: item.content, checked: item.checked })));

  const isDirty =
    title !== checklist.title ||
    newItemContent.trim() !== '' ||
    itemsSnapshot(items) !== itemsSnapshot(checklist.items);

  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

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

    const newItem: EditableChecklistItem = {
      id: crypto.randomUUID(),
      checklistId: checklist.id,
      content: newItemContent.trim(),
      checked: false,
      position: items.length,
    };

    setItems([...items, newItem]);
    setNewItemContent('');
  };

  const handleUpdateItemContent = (id: number | string, content: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, content } : item)));
  };

  const handleToggleItemStatus = (id: number | string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleDeleteItem = (id: number | string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      const finalItems: EditableChecklistItem[] = [...items];
      if (newItemContent.trim()) {
        finalItems.push({
          id: crypto.randomUUID(),
          checklistId: checklist.id,
          content: newItemContent.trim(),
          checked: false,
          position: finalItems.length,
        });
        setNewItemContent('');
      }

      await updateChecklistMutation.mutateAsync({
        ...checklist,
        title: title.trim(),
        items: finalItems.map((item) => ({
          ...item,
          id: typeof item.id === 'string' ? 0 : item.id,
        })),
      });
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update checklist');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={requestClose}
        title={<EditableTitle value={title} onChange={setTitle} placeholder="Checklist title" />}
      >
        <form onSubmit={handleSubmit} className={noteItemStyles.editForm}>
          {formError && <ErrorMessage message={formError} />}

          <div className={checklistStyles.checklistItems}>
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
                  className={`${checklistStyles.itemInput} ${
                    item.checked ? checklistStyles.itemChecked : ''
                  }`}
                  maxLength={LIMITS.CHECKLIST_ITEM}
                />
                <button
                  type="button"
                  className={checklistStyles.deleteItemButton}
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                maxLength={LIMITS.CHECKLIST_ITEM}
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
            <button
              type="submit"
              className={`${styles.button} ${styles.successButton}`}
              disabled={updateChecklistMutation.isPending}
            >
              {updateChecklistMutation.isPending ? 'Saving...' : 'Save Changes'}
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

export default EditChecklistForm;
