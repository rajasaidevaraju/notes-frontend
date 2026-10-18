import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import ConfirmActionModal from './ConfirmActionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { LIMITS } from '@/constants';
import { ContentType } from '@/types/Types';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import { useAddNoteMutation, useAddChecklistMutation, useAddTrackerMutation } from '@/hooks/useContentQuery';

const TYPE_OPTIONS: Array<{ type: ContentType; label: string }> = [
  { type: 'note', label: 'Note' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'tracker', label: 'Tracker' },
];

interface AddContentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unit, setUnit] = useState('');
  const [itemType, setItemType] = useState<ContentType>('note');
  const [formError, setFormError] = useState<string | null>(null);

  const addNoteMutation = useAddNoteMutation();
  const addChecklistMutation = useAddChecklistMutation();
  const addTrackerMutation = useAddTrackerMutation();

  const isDirty = title.trim() !== '' || content.trim() !== '' || unit.trim() !== '';
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setTitle('');
    setContent('');
    setUnit('');
    setItemType('note');
    setFormError(null);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      if (itemType === 'note') {
        await addNoteMutation.mutateAsync({ title, content });
      } else if (itemType === 'checklist') {
        await addChecklistMutation.mutateAsync(title);
      } else {
        await addTrackerMutation.mutateAsync({ title, unit: unit.trim() || null });
      }
      setTitle('');
      setContent('');
      setUnit('');
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, `Failed to add ${itemType}`));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={requestClose} title="Add New">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorMessage message={formError} />

        <ToggleGroup
          variant="outline"
          value={[itemType]}
          onValueChange={(value) => value[0] && setItemType(value[0] as ContentType)}
          aria-label="Item type"
          className="w-full"
        >
          {TYPE_OPTIONS.map(({ type, label }) => (
            <ToggleGroupItem
              key={type}
              value={type}
              className="flex-1 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-col gap-2">
          <Label htmlFor="itemTitle">Title</Label>
          <Input
            type="text"
            id="itemTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Enter ${itemType} title`}
            required
            maxLength={LIMITS.TITLE}
            autoComplete="off"
          />
        </div>

        {itemType === 'tracker' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="itemUnit">Unit (Optional)</Label>
            <Input
              type="text"
              id="itemUnit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="kg, steps, hours…"
              maxLength={LIMITS.TRACKER_UNIT}
              autoComplete="off"
            />
          </div>
        )}

        {itemType === 'note' && (
          <div className="flex min-h-0 flex-col gap-2">
            <Label htmlFor="itemContent">Content (Optional)</Label>
            <Textarea
              id="itemContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              ref={(el) => {
                if (el) autoGrow(el);
              }}
              className="min-h-32"
              maxLength={LIMITS.NOTE_CONTENT}
            />
          </div>
        )}

        <Button type="submit">
          Add {TYPE_OPTIONS.find((option) => option.type === itemType)?.label}
        </Button>
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

export default AddContentForm;
