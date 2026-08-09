import React from 'react';
import styles from './ItemCard.module.css';
import ErrorMessage from './ErrorMessage';
import ItemToolbar from './ItemToolbar';
import ConfirmActionModal from './ConfirmActionModal';
import { ContentType, UnifiedContent } from '@/types/Types';
import { ItemCardController } from './useItemCard';

/** Per-type wording for the two confirmations every card shares. */
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
};

interface ItemCardProps {
  item: UnifiedContent;
  card: ItemCardController;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
  /** Rendered after the truncated title, e.g. a tracker's unit. */
  titleSuffix?: string;
  /** Extra toolbar button, for types that support adding to the item in place. */
  onAdd?: (e: React.MouseEvent) => void;
  /** The item's body — the only part that genuinely differs per type. */
  children: React.ReactNode;
  /** Edit/view modals owned by the per-type component. */
  modals?: React.ReactNode;
}

/**
 * The shared shell for notes, checklists and trackers: selection, header,
 * toolbar, error banner and the delete/hide confirmations. Pair it with
 * useItemCard, which owns the matching behaviour.
 */
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

  const className = [
    styles.noteItem,
    item.pinned && styles.pinnedNote,
    item.hidden && styles.hiddenNote,
    isSelected && styles.selectedNote,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelectingMode) onToggleSelect();
      }}
    >
      <ErrorMessage message={card.itemError} />

      <div className={styles.noteHeader}>
        {/* Truncation is CSS (.noteTitle clamps), so the full title stays in the DOM. */}
        <h3 className={styles.noteTitle}>
          {item.title}
          {titleSuffix}
        </h3>
        {isSelectingMode ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className={styles.multiSelectCheckbox}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${labels.noun}`}
          />
        ) : (
          <ItemToolbar
            pinned={item.pinned}
            hidden={item.hidden}
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
        title={item.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
        message={`Are you sure you want to ${item.hidden ? 'un-hide' : 'hide'} this ${labels.noun}?${
          item.hidden
            ? ''
            : ' It will be moved to the hidden section and require authentication to view.'
        }`}
        confirmText={`Yes, ${item.hidden ? 'Un-Hide' : 'Hide'}`}
      />
    </div>
  );
};

export default ItemCard;
