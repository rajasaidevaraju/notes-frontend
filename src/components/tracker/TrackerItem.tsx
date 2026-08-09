import React, { useState } from 'react';
import itemCardStyles from '@/components/ItemCard.module.css';
import trackerStyles from './Tracker.module.css';
import EntryRow from './EntryRow';
import EditTrackerForm from './EditTrackerForm';
import AddEntryForm from './AddEntryForm';
import Modal from '@/components/Modal';
import ItemCard from '@/components/ItemCard';
import { useItemCard } from '@/components/useItemCard';
import { Tracker } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import { useUpdateTrackerMutation, useDeleteTrackerMutation } from '@/hooks/useContentQuery';

const VISIBLE_ENTRIES = 5;

interface TrackerItemProps {
  tracker: Tracker;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const TrackerItem: React.FC<TrackerItemProps> = ({
  tracker,
  isSelected,
  onToggleSelect,
  isSelectingMode,
}) => {
  const clearSelectedContent = useContentStore((state) => state.clearSelectedContent);
  const updateTrackerMutation = useUpdateTrackerMutation();
  const deleteTrackerMutation = useDeleteTrackerMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const card = useItemCard({
    item: tracker,
    updateItem: (changes) =>
      updateTrackerMutation.mutateAsync({ tracker: { ...tracker, ...changes } }),
    deleteItem: () => deleteTrackerMutation.mutateAsync(tracker.id),
    copyText: () =>
      tracker.entries
        .map((en) => `${en.value}${tracker.unit ? ` ${tracker.unit}` : ''}\t${en.recordedAt}`)
        .join('\n'),
  });

  const visibleEntries = tracker.entries.slice(0, VISIBLE_ENTRIES);
  const hiddenCount = tracker.entries.length - visibleEntries.length;
  const titleWithUnit = tracker.unit ? `${tracker.title} (${tracker.unit})` : tracker.title;

  return (
    <ItemCard
      item={tracker}
      card={card}
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
      isSelectingMode={isSelectingMode}
      titleSuffix={tracker.unit ? ` (${tracker.unit})` : undefined}
      onAdd={(e) => {
        e.stopPropagation();
        card.setItemError(null);
        clearSelectedContent();
        setIsAddModalOpen(true);
      }}
      modals={
        <>
          <Modal isOpen={card.isViewModalOpen} onClose={card.closeView} title={titleWithUnit}>
            <div className={itemCardStyles.viewContentContainer}>
              <div className={trackerStyles.entryList}>
                {tracker.entries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} unit={tracker.unit} />
                ))}
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={`Add to ${titleWithUnit}`}
          >
            <AddEntryForm tracker={tracker} onClose={() => setIsAddModalOpen(false)} />
          </Modal>

          <EditTrackerForm
            isOpen={card.isEditModalOpen}
            onClose={card.closeEdit}
            tracker={tracker}
          />
        </>
      }
    >
      {card.minimized ? (
        <p className={itemCardStyles.noteContent}>...</p>
      ) : (
        <div>
          {tracker.entries.length === 0 ? (
            <p className={trackerStyles.emptyHint}>No entries yet. Press + to add the first value.</p>
          ) : (
            <div className={trackerStyles.entryList}>
              {visibleEntries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} unit={tracker.unit} />
              ))}
            </div>
          )}

          {hiddenCount > 0 && (
            <button
              className={trackerStyles.viewAllButton}
              onClick={(e) => {
                e.stopPropagation();
                card.openView();
              }}
            >
              View all {tracker.entries.length} entries
            </button>
          )}
        </div>
      )}
    </ItemCard>
  );
};

export default TrackerItem;
