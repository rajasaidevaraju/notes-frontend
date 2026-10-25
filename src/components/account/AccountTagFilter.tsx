import React, { useState } from 'react';
import { CheckIcon, Settings2Icon, XIcon } from 'lucide-react';
import ManageTagsModal from '@/components/tag/ManageTagsModal';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tag } from '@/types/Types';
import { TagMatchMode, useContentStore } from '@/store/contentStore';

const pressedClass =
  'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90';

interface AccountTagFilterProps {
  tags: Tag[];
  counts: Map<number, number>;
  activeIds: number[];
  shown: number;
  total: number;
}

const AccountTagFilter: React.FC<AccountTagFilterProps> = ({ tags, counts, activeIds, shown, total }) => {
  const { setTagFilter, clearTagFilter, tagMatchMode, setTagMatchMode } = useContentStore();
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  const ordered = tags
    .filter((tag) => counts.has(tag.id) || activeIds.includes(tag.id))
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));

  return (
    <div className="col-span-full flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <ToggleGroup
          multiple
          variant="outline"
          size="sm"
          spacing={1.5}
          value={activeIds.map(String)}
          onValueChange={(value) => setTagFilter(value.map(Number))}
          aria-label="Filter accounts by tag"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {ordered.map((tag) => {
            const active = activeIds.includes(tag.id);
            return (
              <ToggleGroupItem
                key={tag.id}
                value={String(tag.id)}
                className={`h-8 rounded-full px-3 md:h-7 ${pressedClass}`}
                title={`${active ? 'Remove' : 'Add'} “${tag.name}” filter`}
              >
                {active && <CheckIcon />}
                {tag.name}
                <span className="text-xs tabular-nums opacity-60">{counts.get(tag.id) ?? 0}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-muted-foreground md:h-7"
          onClick={() => setIsManageOpen(true)}
          title="Rename or delete tags"
          aria-label="Manage tags"
        >
          <Settings2Icon />
          <span className={ordered.length > 0 ? 'max-md:hidden' : undefined}>
            {ordered.length > 0 ? 'Manage' : 'Manage tags'}
          </span>
        </Button>
      </div>

      {activeIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          <span className="tabular-nums">
            Showing {shown} of {total}
          </span>
          {activeIds.length > 1 && (
            <span className="flex items-center gap-1.5">
              Match
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[tagMatchMode]}
                onValueChange={(value) => value[0] && setTagMatchMode(value[0] as TagMatchMode)}
                aria-label="Tag match mode"
              >
                <ToggleGroupItem value="all" className={pressedClass} title="Accounts with every selected tag">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="any" className={pressedClass} title="Accounts with at least one selected tag">
                  Any
                </ToggleGroupItem>
              </ToggleGroup>
            </span>
          )}
          <Button variant="link" size="sm" className="h-7 px-0" onClick={clearTagFilter}>
            <XIcon />
            Clear filters
          </Button>
        </div>
      )}

      <ManageTagsModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        tags={tags}
        counts={counts}
        itemNoun="account"
      />
    </div>
  );
};

export default AccountTagFilter;
