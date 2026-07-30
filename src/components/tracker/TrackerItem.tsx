import React, { useState } from 'react';
import itemCardStyles from '@/components/ItemCard.module.css';
import trackerStyles from './Tracker.module.css';
import EntryRow from './EntryRow';
import EditTrackerForm from './EditTrackerForm';
import AddEntryForm from './AddEntryForm';
import ErrorMessage from '@/components/ErrorMessage';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import Modal from '@/components/Modal';
import ItemToolbar from '@/components/ItemToolbar';
import { Tracker } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from '@/store/noteUiStore';
import {
  useUpdateTrackerMutation,
  useDeleteTrackerMutation,
} from '@/hooks/useContentQuery';

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

  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const minimized = useNoteUiStore((state) => state.minimizedNotes[tracker.id] ?? false);
  const toggleNoteMinimize = useNoteUiStore((state) => state.toggleNoteMinimize);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectingMode) {
      onToggleSelect();
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    setItemError(null);
    clearSelectedContent();
    setCopyFeedback(null);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddModalOpen(true);
    setItemError(null);
    clearSelectedContent();
    setCopyFeedback(null);
  };

  const handleUpdate = async (updatedTracker: Tracker, deletedEntryIds?: number[]) => {
    setItemError(null);
    try {
      await updateTrackerMutation.mutateAsync({ tracker: updatedTracker, deletedEntryIds });
    } catch (err: unknown) {
      let message = 'Failed to update tracker';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      throw err;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteTrackerMutation.mutateAsync(tracker.id);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      let message = 'Failed to delete tracker';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdate({ ...tracker, pinned: !tracker.pinned });
  };

  const handleHideToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHideModalOpen(true);
  };

  const confirmHide = async () => {
    try {
      await handleUpdate({ ...tracker, hidden: !tracker.hidden });
      setIsHideModalOpen(false);
    } catch {
      setIsHideModalOpen(false);
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    setCopyFeedback(null);

    try {
      if (navigator.clipboard) {
        const text = tracker.entries
          .map((en) => `${en.value}${tracker.unit ? ` ${tracker.unit}` : ''}\t${en.recordedAt}`)
          .join('\n');
        await navigator.clipboard.writeText(text);
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(null), 2000);
      } else {
        throw new Error('Clipboard API not supported.');
      }
    } catch (err: unknown) {
      let message = 'Failed to copy content';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      setTimeout(() => setItemError(null), 3000);
    }
  };

  const visibleEntries = tracker.entries.slice(0, VISIBLE_ENTRIES);
  const hiddenCount = tracker.entries.length - visibleEntries.length;

  return (
    <div
      className={`${itemCardStyles.noteItem} ${tracker.pinned ? itemCardStyles.pinnedNote : ''} ${
        tracker.hidden ? itemCardStyles.hiddenNote : ''
      } ${isSelected ? itemCardStyles.selectedNote : ''}`}
      onClick={handleClick}
    >
      {itemError && <ErrorMessage message={itemError} />}

      <>
        <div className={itemCardStyles.noteHeader}>
          <h3 className={itemCardStyles.noteTitle}>
            {truncateText(tracker.title, 50)}
            {tracker.unit ? ` (${tracker.unit})` : ''}
          </h3>
          {isSelectingMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className={itemCardStyles.multiSelectCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <ItemToolbar
              pinned={tracker.pinned}
              hidden={tracker.hidden}
              minimized={minimized}
              copyFeedback={copyFeedback}
              onTogglePin={handleTogglePin}
              onEdit={handleEditClick}
              onAdd={handleAddClick}
              onDelete={handleDeleteClick}
              onCopy={handleCopyClick}
              onToggleHide={handleHideToggle}
              onToggleMinimize={(e) => {
                e.stopPropagation();
                toggleNoteMinimize(tracker.id);
              }}
            />
          )}
        </div>

        {minimized ? (
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
                  setIsViewModalOpen(true);
                }}
              >
                View all {tracker.entries.length} entries
              </button>
            )}
          </div>
        )}
      </>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={tracker.unit ? `${tracker.title} (${tracker.unit})` : tracker.title}
      >
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
        title={tracker.unit ? `Add to ${tracker.title} (${tracker.unit})` : `Add to ${tracker.title}`}
      >
        <AddEntryForm tracker={tracker} onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Tracker Deletion"
        message="Are you sure you want to delete this tracker and all its entries?"
        confirmText="Yes, Delete"
        danger
      />

      <ConfirmActionModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={confirmHide}
        title={tracker.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
        message={`Are you sure you want to ${tracker.hidden ? 'un-hide' : 'hide'} this tracker?${
          !tracker.hidden
            ? ' It will be moved to the hidden section and require authentication to view.'
            : ''
        }`}
        confirmText={`Yes, ${tracker.hidden ? 'Un-Hide' : 'Hide'}`}
      />

      <EditTrackerForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tracker={tracker}
        onUpdateTracker={handleUpdate}
      />
    </div>
  );
};

export default TrackerItem;
