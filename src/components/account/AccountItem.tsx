import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Account } from '@/types/Types';
import AccountForm from './AccountForm';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { useItemCard } from '@/components/useItemCard';
import { itemBodyClass } from '@/components/itemCardStyles';
import { useContentStore } from '@/store/contentStore';
import { copyToClipboard } from '@/utils/clipboard';
import { toMessage } from '@/utils/errors';
import { useUpdateAccountMutation, useDeleteAccountMutation } from '@/hooks/useContentQuery';

const MASK = '••••••••';

interface AccountItemProps {
  account: Account;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const copy = async (text: string, label: string) => {
  try {
    await copyToClipboard(text);
    toast.success(`${label} copied`);
  } catch (err: unknown) {
    toast.error(toMessage(err, `Failed to copy ${label.toLowerCase()}`));
  }
};

const AccountItem: React.FC<AccountItemProps> = ({
  account,
  isSelected,
  onToggleSelect,
  isSelectingMode,
}) => {
  const updateAccountMutation = useUpdateAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const requestPin = useContentStore((state) => state.requestPin);
  const [revealed, setRevealed] = useState(false);

  const card = useItemCard({
    item: account,
    updateItem: (changes) => updateAccountMutation.mutateAsync({ id: account.id, changes }),
    deleteItem: () => deleteAccountMutation.mutateAsync(account.id),
    copyText: () => account.identifier,
  });

  const withSecrets = (action: () => void) => (account.locked ? requestPin(action) : action());
  const showSecrets = revealed && !account.locked;
  const hasSecrets = account.locked || Boolean(account.password || account.notes);

  const toolbar = {
    ...card.toolbar,
    onEdit: (e: React.MouseEvent) => {
      e.stopPropagation();
      withSecrets(() => card.toolbar.onEdit(e));
    },
  };

  return (
    <ItemCard
      item={account}
      card={{ ...card, toolbar }}
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
      isSelectingMode={isSelectingMode}
      modals={<AccountForm isOpen={card.isEditModalOpen} onClose={card.closeEdit} account={account} />}
    >
      {card.minimized ? (
        <p className={itemBodyClass}>...</p>
      ) : (
        <div className="flex flex-col gap-1 text-sm">
          {hasSecrets && (
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-mono text-foreground/75">
                {showSecrets ? account.password || 'No password' : MASK}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => (showSecrets ? setRevealed(false) : withSecrets(() => setRevealed(true)))}
                title={showSecrets ? 'Hide' : 'Show'}
                aria-label={showSecrets ? 'Hide password and notes' : 'Show password and notes'}
              >
                {showSecrets ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
              {(account.locked || account.password) && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() =>
                    account.locked ? requestPin(() => setRevealed(true)) : copy(account.password!, 'Password')
                  }
                  title="Copy password"
                  aria-label="Copy password"
                >
                  <CopyIcon />
                </Button>
              )}
            </div>
          )}

          {showSecrets && account.notes && (
            <p className={`${itemBodyClass} mt-1 border-t pt-2`}>{account.notes}</p>
          )}
        </div>
      )}
    </ItemCard>
  );
};

export default AccountItem;
