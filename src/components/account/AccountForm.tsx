import React, { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import PasswordInput from './PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';
import { Account } from '@/types/Types';
import { LIMITS } from '@/constants';
import { autoGrow } from '@/utils/dom';
import { toMessage } from '@/utils/errors';
import {
  useAccountsQuery,
  useAddAccountMutation,
  useCreateGroupMutation,
  useUpdateAccountMutation,
} from '@/hooks/useContentQuery';

const NEW_GROUP = 'new';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
}

const fieldsOf = (account?: Account) => ({
  group: account?.groupId ? String(account.groupId) : '',
  newGroup: '',
  identifier: account?.identifier ?? '',
  password: account?.password ?? '',
  notes: account?.notes ?? '',
});

type Fields = ReturnType<typeof fieldsOf>;

const AccountForm: React.FC<AccountFormProps> = ({ isOpen, onClose, account }) => {
  const [form, setForm] = useState(() => fieldsOf(account));
  const [formError, setFormError] = useState<string | null>(null);
  const groups = useAccountsQuery(isOpen).data?.groups ?? [];
  const addAccountMutation = useAddAccountMutation();
  const updateAccountMutation = useUpdateAccountMutation();
  const createGroupMutation = useCreateGroupMutation();

  const initial = fieldsOf(account);
  const isDirty = (Object.keys(form) as Array<keyof Fields>).some((key) => form[key] !== initial[key]);
  const { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard } =
    useUnsavedChangesGuard(isDirty, onClose);

  useResetOnOpen(isOpen, () => {
    setForm(fieldsOf(account));
    setFormError(null);
  });

  const setField = (field: keyof Fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const resolveGroupId = async (): Promise<number | null> => {
    if (form.group !== NEW_GROUP) return form.group ? Number(form.group) : null;

    const name = form.newGroup.trim();
    const existing = groups.find((group) => group.name.toLowerCase() === name.toLowerCase());
    return existing ? existing.id : (await createGroupMutation.mutateAsync(name)).id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.identifier.trim()) {
      setFormError('Primary identifier cannot be empty.');
      return;
    }
    if (form.group === NEW_GROUP && !form.newGroup.trim()) {
      setFormError('Enter a name for the new group.');
      return;
    }

    try {
      const fields = {
        groupId: await resolveGroupId(),
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
    addAccountMutation.isPending || updateAccountMutation.isPending || createGroupMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={requestClose} title={account ? 'Edit Account' : 'New Account'}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
        <ErrorMessage message={formError} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountGroup">Group</Label>
          <NativeSelect id="accountGroup" value={form.group} onChange={setField('group')} className="w-full">
            <NativeSelectOption value="">No group</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={String(group.id)}>
                {group.name}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value={NEW_GROUP}>+ New group…</NativeSelectOption>
          </NativeSelect>
          {form.group === NEW_GROUP && (
            <Input
              value={form.newGroup}
              onChange={setField('newGroup')}
              placeholder="Group name, e.g. Credit Cards"
              maxLength={LIMITS.ACCOUNT_GROUP}
              aria-label="New group name"
              autoComplete="off"
            />
          )}
        </div>

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
