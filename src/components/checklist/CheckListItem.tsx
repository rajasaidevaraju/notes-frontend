import React, { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import noteItemStyles from '@/components/ItemCard.module.css';
import { Checklist } from '@/types/Types';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import EditChecklistForm from './EditChecklistForm';
import ChecklistView from './ChecklistView';
import { useContentStore } from '@/store/contentStore';
import { useNoteUiStore } from '@/store/noteUiStore';

import ViewChecklistModal from './ViewChecklistModal';
import ItemToolbar from '@/components/ItemToolbar';
import { useUpdateChecklistMutation, useDeleteChecklistMutation } from '@/hooks/useContentQuery';

interface CheckListItemProps {
  checklist: Checklist;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const CheckListItem: React.FC<CheckListItemProps> = ({
  checklist,
  isSelected,
  onToggleSelect,
  isSelectingMode,
}) => {
  const clearSelectedContent = useContentStore((state) => state.clearSelectedContent);
  const updateChecklistMutation = useUpdateChecklistMutation();
  const deleteChecklistMutation = useDeleteChecklistMutation();

  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const minimized = useNoteUiStore((state) => state.minimizedNotes[checklist.id] ?? false);
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteChecklistMutation.mutateAsync(checklist.id);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      let message = 'Failed to delete checklist';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChecklistMutation.mutateAsync({ ...checklist, pinned: !checklist.pinned });
    } catch (err: unknown) {
      if (err instanceof Error) setItemError(err.message);
    }
  };

  const handleHideToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHideModalOpen(true);
  };

  const confirmHide = async () => {
    try {
      await updateChecklistMutation.mutateAsync({ ...checklist, hidden: !checklist.hidden });
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
        const text = checklist.items
          .map((i) => `${i.checked ? '[x]' : '[ ]'} ${i.content}`)
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

  return (
    <div
      className={`${noteItemStyles.noteItem} ${
        checklist.pinned ? noteItemStyles.pinnedNote : ''
      } ${checklist.hidden ? noteItemStyles.hiddenNote : ''} ${
        isSelected ? noteItemStyles.selectedNote : ''
      }`}
      onClick={handleClick}
    >
      {itemError && <ErrorMessage message={itemError} />}

      <>
        <div className={noteItemStyles.noteHeader}>
          <h3 className={noteItemStyles.noteTitle}>{truncateText(checklist.title, 50)}</h3>
          {isSelectingMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className={noteItemStyles.multiSelectCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <ItemToolbar
              pinned={checklist.pinned}
              hidden={checklist.hidden}
              minimized={minimized}
              copyFeedback={copyFeedback}
              onTogglePin={handleTogglePin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onCopy={handleCopyClick}
              onToggleHide={handleHideToggle}
              onToggleMinimize={(e) => {
                e.stopPropagation();
                toggleNoteMinimize(checklist.id);
              }}
            />
          )}
        </div>

        <div>
          <ChecklistView
            checklist={checklist}
            isMinimized={minimized}
            onReadMore={() => setIsViewModalOpen(true)}
          />
        </div>
      </>

      <ViewChecklistModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        checklist={checklist}
      />

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Checklist Deletion"
        message="Are you sure you want to delete this checklist?"
        confirmText="Yes, Delete"
        danger
      />

      <ConfirmActionModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={confirmHide}
        title={checklist.hidden ? 'Confirm Un-Hide' : 'Confirm Hide'}
        message={`Are you sure you want to ${
          checklist.hidden ? 'un-hide' : 'hide'
        } this checklist?${
          !checklist.hidden
            ? ' It will be moved to the hidden section and require authentication to view.'
            : ''
        }`}
        confirmText={`Yes, ${checklist.hidden ? 'Un-Hide' : 'Hide'}`}
      />

      <EditChecklistForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        checklist={checklist}
      />
    </div>
  );
};

export default CheckListItem;
