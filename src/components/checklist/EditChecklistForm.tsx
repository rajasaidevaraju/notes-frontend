import React, { useState } from 'react';
import styles from '@/Home.module.css';
import checklistStyles from './Checklist.module.css';
import noteItemStyles from '@/components/ItemCard.module.css';
import Modal from '@/components/Modal';
import EditableTitle from '@/components/EditableTitle';
import ErrorMessage from '@/components/ErrorMessage';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Checklist, ChecklistItem, NEW_ITEM_ID } from '@/types/Types';
import { LIMITS } from '@/constants';
import { toMessage } from '@/utils/errors';
import { useUpdateChecklistMutation } from '@/hooks/useContentQuery';

/**
 * Rows being edited need a key before the server has assigned an id, so unsaved
 * rows carry a local `rowId` and keep `id: NEW_ITEM_ID` for the API.
 */
type EditableChecklistItem = ChecklistItem & { rowId: string };

let localRowSeq = 0;
const toRow = (item: ChecklistItem): EditableChecklistItem => ({
  ...item,
  rowId: `saved-${item.id}`,
});
const newRow = (checklistId: number, content: string, position: number): EditableChecklistItem => ({
  id: NEW_ITEM_ID,
  rowId: `new-${localRowSeq++}`,
  checklistId,
  content,
  checked: false,
  position,
});

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
  const [title, setTitle] = useState(() => checklist.title);
  const [items, setItems] = useState<EditableChecklistItem[]>(() => checklist.items.map(toRow));
  const [newItemContent, setNewItemContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const updateChecklistMutation = useUpdateChecklistMutation();

  const isDirty =
    title !== checklist.title ||
    newItemContent.trim() !== '' ||
    items.length !== checklist.items.length ||
    items.some((item, i) => {
      const original = checklist.items[i];
      return item.content !== original.content || item.checked !== original.checked;
    });

  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setTitle(checklist.title);
    setItems(checklist.items.map(toRow));
    setNewItemContent('');
    setFormError(null);
  });

  const handleAddItem = () => {
    if (!newItemContent.trim()) return;
    setItems((prev) => [...prev, newRow(checklist.id, newItemContent.trim(), prev.length)]);
    setNewItemContent('');
  };

  const handleUpdateItemContent = (rowId: string, content: string) => {
    setItems(items.map((item) => (item.rowId === rowId ? { ...item, content } : item)));
  };

  const handleToggleItemStatus = (rowId: string) => {
    setItems(items.map((item) => (item.rowId === rowId ? { ...item, checked: !item.checked } : item)));
  };

  const handleDeleteItem = (rowId: string) => {
    setItems(items.filter((item) => item.rowId !== rowId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    // A half-typed row in the "add new" field counts as intended content.
    const finalItems = [...items];
    if (newItemContent.trim()) {
      finalItems.push(newRow(checklist.id, newItemContent.trim(), finalItems.length));
    }

    try {
      await updateChecklistMutation.mutateAsync({
        ...checklist,
        title: title.trim(),
        items: finalItems.map(({ rowId: _rowId, ...item }, position) => ({ ...item, position })),
      });
      setNewItemContent('');
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, 'Failed to update checklist'));
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
          <ErrorMessage message={formError} />

          <div className={checklistStyles.checklistItems}>
            {items.map((item) => (
              <div key={item.rowId} className={checklistStyles.checklistItem}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleItemStatus(item.rowId)}
                  className={checklistStyles.checkboxInput}
                />
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => handleUpdateItemContent(item.rowId, e.target.value)}
                  className={`${checklistStyles.itemInput} ${
                    item.checked ? checklistStyles.itemChecked : ''
                  }`}
                  maxLength={LIMITS.CHECKLIST_ITEM}
                />
                <button
                  type="button"
                  className={checklistStyles.deleteItemButton}
                  onClick={() => handleDeleteItem(item.rowId)}
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

            <div className={`${checklistStyles.checklistItem} ${checklistStyles.newItemRow}`}>
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
                    handleAddItem();
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.formActions}>
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
