import React, { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import PasswordInput from './PasswordInput';
import TagInput, { withTag } from '@/components/tag/TagInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Account, Tag } from '@/types/Types';
import { LIMITS } from '@/constants';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import {
  useAddAccountMutation,
  useCreateTagMutation,
  useTagsQuery,
  useUpdateAccountMutation,
} from '@/hooks/useContentQuery';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
}

const fieldsOf = (account?: Account, tags: Tag[] = []) => ({
  tags: tags.filter((tag) => account?.tagIds.includes(tag.id)).map((tag) => tag.name),
  tagDraft: '',
  identifier: account?.identifier ?? '',
  password: account?.password ?? '',
  notes: account?.notes ?? '',
});

type Fields = ReturnType<typeof fieldsOf>;

const AccountForm: React.FC<AccountFormProps> = ({ isOpen, onClose, account }) => {
  const allTags = useTagsQuery(isOpen).data ?? [];
  const [form, setForm] = useState(() => fieldsOf(account, allTags));
  const [formError, setFormError] = useState<string | null>(null);
  const addAccountMutation = useAddAccountMutation();
  const updateAccountMutation = useUpdateAccountMutation();
  const createTagMutation = useCreateTagMutation();

  const initial = fieldsOf(account, allTags);
  const tagNames = allTags.map((tag) => tag.name);
  const isDirty = (Object.keys(form) as Array<keyof Fields>).some(
    (key) => String(form[key]) !== String(initial[key])
  );
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setForm(fieldsOf(account, allTags));
    setFormError(null);
  });

  const setField = (field: Exclude<keyof Fields, 'tags'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // New tag names are created first so the account itself is saved with IDs only.
  const resolveTagIds = async (names: string[]): Promise<number[]> => {
    const ids: number[] = [];
    for (const name of names) {
      const existing = allTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
      ids.push(existing ? existing.id : (await createTagMutation.mutateAsync(name)).id);
    }
    return ids;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.identifier.trim()) {
      setFormError('Primary identifier cannot be empty.');
      return;
    }

    try {
      const fields = {
        // A typed-but-not-entered tag still counts.
        tagIds: await resolveTagIds(
          withTag(form.tags, form.tagDraft, tagNames).slice(0, LIMITS.TAGS_PER_ITEM)
        ),
        identifier: form.identifier.trim(),
      };

      if (account) {
        // Secrets are only sent when edited, so a stale copy never overwrites them.
        await updateAccountMutation.mutateAsync({
          id: account.id,
          changes: {
            ...fields,
            ...(form.password !== initial.password && { password: form.password || null }),
            ...(form.notes !== initial.notes && { notes: form.notes || null }),
          },
        });
      } else {
        await addAccountMutation.mutateAsync({
          ...fields,
          password: form.password || null,
          notes: form.notes || null,
        });
      }
      onClose();
    } catch (err: unknown) {
      setFormError(toMessage(err, `Failed to ${account ? 'update' : 'add'} account`));
    }
  };

  const isPending =
    addAccountMutation.isPending || updateAccountMutation.isPending || createTagMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={requestClose} title={account ? 'Edit Account' : 'New Account'}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
        <ErrorMessage message={formError} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountIdentifier">Primary Identifier</Label>
          <Input
            id="accountIdentifier"
            value={form.identifier}
            onChange={setField('identifier')}
            maxLength={LIMITS.ACCOUNT_IDENTIFIER}
            placeholder='abc@xyz.com'
            autoComplete="off"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountTags">Tags</Label>
          <TagInput
            id="accountTags"
            value={form.tags}
            onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            draft={form.tagDraft}
            onDraftChange={(tagDraft) => setForm((prev) => ({ ...prev, tagDraft }))}
            suggestions={tagNames}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountPassword">Password</Label>
          <PasswordInput
            id="accountPassword"
            value={form.password}
            onChange={setField('password')}
            maxLength={LIMITS.ACCOUNT_PASSWORD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountNotes">Additional notes</Label>
          <Textarea
            id="accountNotes"
            value={form.notes}
            onChange={setField('notes')}
            ref={(el) => {
              if (el) autoGrow(el);
            }}
            placeholder="Passphrase, recovery codes, PIN…"
            maxLength={LIMITS.NOTE_CONTENT}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {account ? 'Save Changes' : 'Add Account'}
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

export default AccountForm;
