import React, { useState } from 'react';
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag } from '@/types/Types';
import { LIMITS } from '@/constants';
import { toMessage } from '@/utils/errors';
import { useCreateTagMutation, useDeleteTagMutation, useRenameTagMutation } from '@/hooks/useContentQuery';

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  counts: Map<number, number>;
  itemNoun: string;
}

const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ isOpen, onClose, tags, counts, itemNoun }) => {
  const plural = (n: number) => `${n} ${itemNoun}${n === 1 ? '' : 's'}`;
  const createTagMutation = useCreateTagMutation();
  const renameTagMutation = useRenameTagMutation();
  const deleteTagMutation = useDeleteTagMutation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Tag | null>(null);
  const [addName, setAddName] = useState('');

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setError(null);
    try {
      await createTagMutation.mutateAsync(addName.trim());
      setAddName('');
    } catch (err: unknown) {
      setError(toMessage(err, 'Failed to add tag'));
    }
  };

  const startRename = (tag: Tag) => {
    setEditingId(tag.id);
    setNewName(tag.name);
    setError(null);
  };

  const submitRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !newName.trim()) return;
    try {
      await renameTagMutation.mutateAsync({ id: editingId, name: newName.trim() });
      setEditingId(null);
    } catch (err: unknown) {
      setError(toMessage(err, 'Failed to rename tag'));
    }
  };

  const close = () => {
    setEditingId(null);
    setAddName('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Manage Tags">
      <div className="flex flex-col gap-3">
        <ErrorMessage message={error} />
        <form onSubmit={submitAdd} className="flex items-center gap-1.5">
          <Input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            maxLength={LIMITS.TAG_NAME}
            placeholder="New tag name"
            aria-label="New tag name"
            autoComplete="off"
          />
          <Button type="submit" disabled={!addName.trim() || createTagMutation.isPending}>
            <PlusIcon />
            Add
          </Button>
        </form>

        {tags.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No tags yet.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border">
            {tags.map((tag) => (
              <li key={tag.id} className="flex min-h-12 items-center gap-2 px-3 py-1.5">
                {editingId === tag.id ? (
                  <form onSubmit={submitRename} className="flex flex-1 items-center gap-1.5">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={LIMITS.TAG_NAME}
                      aria-label={`New name for ${tag.name}`}
                      autoComplete="off"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newName.trim() || renameTagMutation.isPending}
                      aria-label="Save name"
                      title="Save"
                    >
                      <CheckIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel rename"
                      title="Cancel"
                    >
                      <XIcon />
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {plural(counts.get(tag.id) ?? 0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => startRename(tag)}
                      aria-label={`Rename ${tag.name}`}
                      title="Rename"
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleting(tag)}
                      aria-label={`Delete ${tag.name}`}
                      title="Delete"
                    >
                      <Trash2Icon />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmActionModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deleteTagMutation
              .mutateAsync(deleting.id)
              .catch((err: unknown) => setError(toMessage(err, 'Failed to delete tag')));
          }
          setDeleting(null);
        }}
        title="Delete Tag?"
        message={`Remove "${deleting?.name}" from ${plural(counts.get(deleting?.id ?? 0) ?? 0)}? The ${itemNoun}s themselves are kept.`}
        confirmText="Delete Tag"
        danger
      />
    </Modal>
  );
};

export default ManageTagsModal;
