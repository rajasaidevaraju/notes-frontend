import React, { useState, useLayoutEffect, useRef } from 'react';
import { Checklist, ChecklistItem } from '@/types/Types';
import ErrorMessage from '@/components/ErrorMessage';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { itemBodyClass } from '@/components/itemCardStyles';
import ReadMoreOverlay from '@/components/ReadMoreOverlay';
import { useUpdateChecklistItemMutation } from '@/hooks/useContentQuery';
import { toMessage } from '@/utils/errors';

interface ChecklistViewProps {
  checklist: Checklist;
  isMinimized: boolean;
  hideReadMore?: boolean;
  onReadMore?: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  isMinimized,
  hideReadMore,
  onReadMore,
}) => {
  const updateChecklistItemMutation = useUpdateChecklistItemMutation();
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (contentRef.current && !hideReadMore) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [checklist.items, isMinimized, hideReadMore]);

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      await updateChecklistItemMutation.mutateAsync({
        itemId: item.id,
        updates: { checked: !item.checked },
      });
    } catch (err: unknown) {
      setError(toMessage(err, 'Failed to update item status'));
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isMinimized) {
    const total = checklist.items.length;
    const done = checklist.items.filter((i) => i.checked).length;
    return (
      <p className={itemBodyClass}>
        {done}/{total} items completed
      </p>
    );
  }

  return (
    <div className="relative">
      <div ref={contentRef} className={cn(itemBodyClass, hideReadMore && 'max-h-none')}>
        <ErrorMessage message={error} />
        <div className="flex flex-col gap-0.5">
          {checklist.items.length === 0 ? (
            <p className="text-xs opacity-60">No items</p>
          ) : (
            checklist.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-muted/60"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => handleToggleItem(item)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 max-sm:size-5"
                  aria-label={item.content}
                />
                <span
                  className={cn(
                    'min-w-0 flex-1 cursor-pointer break-words text-foreground/75',
                    item.checked && 'text-muted-foreground/70 line-through'
                  )}
                  onClick={() => handleToggleItem(item)}
                >
                  {item.content}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      {isOverflowing && !isMinimized && onReadMore && (
        <ReadMoreOverlay label="View More" onClick={onReadMore} />
      )}
    </div>
  );
};

export default ChecklistView;
