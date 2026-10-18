import React, { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import Modal from '@/components/Modal';
import EditableTitle from '@/components/EditableTitle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Note } from '@/types/Types';
import { LIMITS } from '@/constants';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import { useUpdateNoteMutation } from '@/hooks/useContentQuery';

interface EditNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const EditNoteFormModal: React.FC<EditNoteFormModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [formData, setFormData] = useState(note);
  const [formError, setFormError] = useState<string | null>(null);
  const updateNoteMutation = useUpdateNoteMutation();

  const isDirty = formData.title !== note.title || formData.content !== note.content;

  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setFormData(note);
    setFormError(null);
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = e.target;
    setFormData((prevData) => ({ ...prevData, content: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title cannot be empty.');
      return;
    }

    try {
      await updateNoteMutation.mutateAsync({ ...note, title: formData.title, content: formData.content });
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, 'Failed to update note'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      title={
        <EditableTitle
          value={formData.title}
          onChange={(title) => setFormData((prev) => ({ ...prev, title }))}
          placeholder="Note title"
        />
      }
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-3">
        {formError && <ErrorMessage message={formError} />}
        <Textarea
          id="editContent"
          name="content"
          ref={(el) => {
            if (el) autoGrow(el);
          }}
          value={formData.content}
          onChange={handleChange}
          className="min-h-40"
          maxLength={LIMITS.NOTE_CONTENT}
          aria-label="Note content"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateNoteMutation.isPending}>
            Save Changes
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

export default EditNoteFormModal;