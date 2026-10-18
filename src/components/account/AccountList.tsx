import React, { useState } from 'react';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import AccountItem from './AccountItem';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { itemGridClass, sectionHeadingClass } from '@/components/itemCardStyles';
import { cn } from '@/lib/utils';
import { Account, AccountGroup, contentKey } from '@/types/Types';
import { LIMITS } from '@/constants';
import { toMessage } from '@/utils/errors';
import { useContentStore } from '@/store/contentStore';
import { useAccountsQuery, useDeleteGroupMutation, useRenameGroupMutation } from '@/hooks/useContentQuery';

const matches = (account: Account, query: string) => account.identifier.toLowerCase().includes(query);

const AccountList: React.FC<{ isSelectingMode: boolean }> = ({ isSelectingMode }) => {
  const { selectedContent, toggleSelectContent, searchQuery } = useContentStore();
  const { data, isLoading } = useAccountsQuery(true);
  const renameGroupMutation = useRenameGroupMutation();
  const deleteGroupMutation = useDeleteGroupMutation();

  const [renaming, setRenaming] = useState<AccountGroup | null>(null);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AccountGroup | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const groups = data?.groups ?? [];
  const accounts = (data?.accounts ?? []).filter((account) => !query || matches(account, query));

  const sections = [
    ...groups.map((group) => ({ group, items: accounts.filter((a) => a.groupId === group.id) })),
    { group: null, items: accounts.filter((a) => !groups.some((g) => g.id === a.groupId)) },
  ].filter(({ group, items }) => items.length > 0 || (group && !query));

  const openRename = (group: AccountGroup) => {
    setRenaming(group);
    setNewName(group.name);
    setRenameError(null);
  };

  const submitRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming || !newName.trim()) return;
    try {
      await renameGroupMutation.mutateAsync({ id: renaming.id, name: newName.trim() });
      setRenaming(null);
    } catch (err: unknown) {
      setRenameError(toMessage(err, 'Failed to rename group'));
    }
  };

  const renderAccount = (account: Account) => {
    const key = contentKey(account);
    return (
      <AccountItem
        key={key}
        account={account}
        isSelected={selectedContent.has(key)}
        onToggleSelect={() => toggleSelectContent({ id: account.id, type: 'account' })}
        isSelectingMode={isSelectingMode}
      />
    );
  };

  return (
    <div className={itemGridClass}>
      {sections.length === 0 ? (
        <p className="col-span-full mt-4 rounded-lg border-2 border-dashed bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
          {query ? 'No matching accounts found.' : 'No accounts yet. Add one with Create New.'}
        </p>
      ) : (
        sections.map(({ group, items }) => (
          <React.Fragment key={group?.id ?? 'ungrouped'}>
            {(group || groups.length > 0) && (
              <div className={cn(sectionHeadingClass, 'flex items-center justify-between gap-2')}>
                <h3 className="truncate">
                  {group?.name ?? 'Ungrouped'} <span className="font-normal">({items.length})</span>
                </h3>
                {group && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Group options"
                          aria-label={`Options for ${group.name}`}
                        />
                      }
                    >
                      <EllipsisVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openRename(group)} className="py-2">
                        <PencilIcon />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleting(group)} className="py-2">
                        <Trash2Icon />
                        Delete group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
            {items.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">No accounts in this group.</p>
            ) : (
              items.map(renderAccount)
            )}
          </React.Fragment>
        ))
      )}
      {isLoading && <Loading />}

      <Modal isOpen={renaming !== null} onClose={() => setRenaming(null)} title="Rename Group">
        <form onSubmit={submitRename} className="flex flex-col gap-4">
          <ErrorMessage message={renameError} />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={LIMITS.ACCOUNT_GROUP}
            aria-label="Group name"
            autoComplete="off"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim() || renameGroupMutation.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await deleteGroupMutation.mutateAsync(deleting.id).catch(() => undefined);
          setDeleting(null);
        }}
        title="Delete Group?"
        message={`Delete "${deleting?.name}"? Its accounts are kept and moved to Ungrouped.`}
        confirmText="Delete Group"
        danger
      />
    </div>
  );
};

export default AccountList;
