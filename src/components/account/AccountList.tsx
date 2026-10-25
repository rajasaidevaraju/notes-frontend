import React, { useMemo } from 'react';
import AccountItem from './AccountItem';
import AccountTagFilter from './AccountTagFilter';
import Loading from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { itemGridClass, sectionHeadingClass } from '@/components/itemCardStyles';
import { Account, Tag, contentKey } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import { useAccountsQuery, useTagsQuery } from '@/hooks/useContentQuery';

const EMPTY_TAGS: Tag[] = [];
const EMPTY_ACCOUNTS: Account[] = [];

const AccountList: React.FC<{ isSelectingMode: boolean }> = ({ isSelectingMode }) => {
  const { selectedContent, toggleSelectContent, searchQuery, tagFilter, tagMatchMode, clearTagFilter } =
    useContentStore();
  const { data: accountData, isLoading } = useAccountsQuery(true);
  const { data: tagData } = useTagsQuery(true);
  const tags = tagData ?? EMPTY_TAGS;
  const accounts = accountData ?? EMPTY_ACCOUNTS;

  const tagById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
  const counts = useMemo(() => {
    const result = new Map<number, number>();
    for (const account of accounts) {
      for (const id of account.tagIds) result.set(id, (result.get(id) ?? 0) + 1);
    }
    return result;
  }, [accounts]);

  const activeIds = tagFilter.filter((id) => tagById.has(id));
  const query = searchQuery.trim().toLowerCase();

  const tagsOf = (account: Account) =>
    account.tagIds.flatMap((id) => tagById.get(id) ?? []).sort((a, b) => a.name.localeCompare(b.name));

  const matchesQuery = (account: Account) =>
    account.identifier.toLowerCase().includes(query) ||
    tagsOf(account).some((tag) => tag.name.toLowerCase().includes(query));

  const matchesTags = (account: Account) =>
    tagMatchMode === 'all'
      ? activeIds.every((id) => account.tagIds.includes(id))
      : activeIds.some((id) => account.tagIds.includes(id));

  const visible = accounts.filter(
    (account) => (!query || matchesQuery(account)) && (activeIds.length === 0 || matchesTags(account))
  );
  const pinned = visible.filter((account) => account.pinned);
  const others = visible.filter((account) => !account.pinned);

  const renderAccount = (account: Account) => {
    const key = contentKey(account);
    return (
      <AccountItem
        key={key}
        account={account}
        tags={tagsOf(account)}
        activeTagIds={activeIds}
        isSelected={selectedContent.has(key)}
        onToggleSelect={() => toggleSelectContent({ id: account.id, type: 'account' })}
        isSelectingMode={isSelectingMode}
      />
    );
  };

  return (
    <div className={itemGridClass}>
      <AccountTagFilter
        tags={tags}
        counts={counts}
        activeIds={activeIds}
        shown={visible.length}
        total={accounts.length}
      />

      {visible.length === 0 ? (
        <div className="col-span-full mt-4 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
          {accounts.length === 0
            ? 'No accounts yet. Add one with Create.'
            : activeIds.length > 0
              ? 'No accounts match the selected tags.'
              : 'No matching accounts found.'}
          {accounts.length > 0 && activeIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearTagFilter}>
              Clear tag filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {pinned.length > 0 && <h3 className={sectionHeadingClass}>Pinned</h3>}
          {pinned.map(renderAccount)}
          {pinned.length > 0 && others.length > 0 && <h3 className={sectionHeadingClass}>Others</h3>}
          {others.map(renderAccount)}
        </>
      )}
      {isLoading && <Loading />}
    </div>
  );
};

export default AccountList;
