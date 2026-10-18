import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import Modal from '@/components/Modal';
import EditableTitle from '@/components/EditableTitle';
import ErrorMessage from '@/components/ErrorMessage';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Checklist, ChecklistItem, NEW_ITEM_ID } from '@/types/Types';
import { LIMITS } from '@/constants';
import { toMessage } from '@/utils/errors';
import { useUpdateChecklistMutation } from '@/hooks/useContentQuery';

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
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      title={<EditableTitle value={title} onChange={setTitle} placeholder="Checklist title" />}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-3">
        <ErrorMessage message={formError} />

        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div key={item.rowId} className="flex items-center gap-2">
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => handleToggleItemStatus(item.rowId)}
                className="max-sm:size-5"
                aria-label="Done"
              />
              <Input
                type="text"
                value={item.content}
                onChange={(e) => handleUpdateItemContent(item.rowId, e.target.value)}
                className={cn(item.checked && 'text-muted-foreground line-through')}
                maxLength={LIMITS.CHECKLIST_ITEM}
                aria-label="Item"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteItem(item.rowId)}
                title="Remove item"
                aria-label="Remove item"
              >
                <XIcon />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2 pr-9">
            <Checkbox disabled className="max-sm:size-5" aria-label="Done" />
            <Input
              type="text"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              placeholder="Add new item..."
              className="border-dashed"
              maxLength={LIMITS.CHECKLIST_ITEM}
              aria-label="New item"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateChecklistMutation.isPending}>
            {updateChecklistMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

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
    </Modal>
  );
};

export default EditChecklistForm;
