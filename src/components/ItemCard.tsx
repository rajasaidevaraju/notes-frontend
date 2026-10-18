import React from 'react';
import ErrorMessage from './ErrorMessage';
import ItemToolbar, { ItemActionsMenu } from './ItemToolbar';
import ConfirmActionModal from './ConfirmActionModal';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CardItem, ContentType, itemTitle } from '@/types/Types';
import { ItemCardController } from './useItemCard';
import { itemCardClass, itemTitleClass } from './itemCardStyles';

const LABELS: Record<ContentType, { noun: string; deleteTitle: string; deleteMessage: string }> = {
  note: {
    noun: 'note',
    deleteTitle: 'Confirm Note Deletion',
    deleteMessage: 'Are you sure you want to delete this Note?',
  },
  checklist: {
    noun: 'checklist',
    deleteTitle: 'Confirm Checklist Deletion',
    deleteMessage: 'Are you sure you want to delete this checklist?',
  },
  tracker: {
    noun: 'tracker',
    deleteTitle: 'Confirm Tracker Deletion',
    deleteMessage: 'Are you sure you want to delete this tracker and all its entries?',
  },
  account: {
    noun: 'account',
    deleteTitle: 'Confirm Account Deletion',
    deleteMessage: 'Are you sure you want to delete this account and its saved password?',
  },
};

interface ItemCardProps {
  item: CardItem;
  card: ItemCardController;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
  titleSuffix?: string;
  onAdd?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  modals?: React.ReactNode;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  card,
  isSelected,
  onToggleSelect,
  isSelectingMode,
  titleSuffix,
  onAdd,
  children,
  modals,
}) => {
  const labels = LABELS[item.type];
  const hidden = 'hidden' in item && item.hidden;
  const archived = 'archived' in item && item.archived;

  return (
    <div
      className={cn(
        itemCardClass,
        item.pinned && 'border-primary/60 hover:border-primary',
        hidden && '[--card-bg:var(--color-muted)]',
        archived &&
          'border-dashed [--card-bg:color-mix(in_oklch,var(--color-muted)_60%,var(--color-card))]',
        isSelected &&
          'border-primary ring-3 ring-primary/25 [--card-bg:color-mix(in_oklch,var(--color-primary)_6%,var(--color-card))] hover:border-primary',
        isSelectingMode && 'cursor-pointer'
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelectingMode) onToggleSelect();
      }}
    >
      <ErrorMessage message={card.itemError} />

      <div className="flex flex-col items-start gap-2.5">
        <div className="flex w-full items-center gap-2">
          {isSelectingMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="size-5 md:size-4.5"
              aria-label={`Select ${labels.noun}`}
            />
          )}
          <h3 className={itemTitleClass}>
            {itemTitle(item)}
            {titleSuffix}
          </h3>
          {!isSelectingMode && (
            <ItemActionsMenu
              title={`${itemTitle(item)}${titleSuffix ?? ''}`}
              pinned={item.pinned}
              hidden={hidden}
              archived={archived}
              minimized={card.minimized}
              copyFeedback={card.copyFeedback}
              onAdd={onAdd}
              {...card.toolbar}
            />
          )}
        </div>
        {!isSelectingMode && (
          <ItemToolbar
            pinned={item.pinned}
            hidden={hidden}
            archived={archived}
            minimized={card.minimized}
            copyFeedback={card.copyFeedback}
            onAdd={onAdd}
            {...card.toolbar}
          />
        )}
      </div>

      {children}

      {modals}

      <ConfirmActionModal
        isOpen={card.isDeleteModalOpen}
        onClose={card.closeDelete}
        onConfirm={card.confirmDelete}
        title={labels.deleteTitle}
        message={labels.deleteMessage}
        confirmText="Yes, Delete"
        danger
      />

      <ConfirmActionModal
        isOpen={card.isHideModalOpen}
        onClose={card.closeHide}
        onConfirm={card.confirmHide}
        title={hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
        message={`Are you sure you want to ${hidden ? 'un-hide' : 'hide'} this ${labels.noun}?${
          hidden
            ? ''
            : ' It will be moved to the hidden section and require authentication to view.'
        }`}
        confirmText={`Yes, ${hidden ? 'Un-Hide' : 'Hide'}`}
      />
    </div>
  );
};

export default ItemCard;
