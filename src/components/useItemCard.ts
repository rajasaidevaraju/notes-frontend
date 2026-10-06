import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UnifiedContent, contentKey } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import { useItemUiStore } from '@/store/itemUiStore';
import { toMessage } from '@/utils/errors';
import { copyToClipboard } from '@/utils/clipboard';

interface UseItemCardOptions {
  item: UnifiedContent;
  updateItem: (changes: { pinned?: boolean; hidden?: boolean; archived?: boolean }) => Promise<unknown>;
  deleteItem: () => Promise<unknown>;
  copyText: () => string;
}

export function useItemCard({ item, updateItem, deleteItem, copyText }: UseItemCardOptions) {
  const clearSelectedContent = useContentStore((state) => state.clearSelectedContent);
  const key = contentKey(item);
  const minimized = useItemUiStore((state) => state.minimizedItems[key] ?? false);
  const toggleItemMinimize = useItemUiStore((state) => state.toggleItemMinimize);

  const [itemError, setItemError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const clearLater = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    setCopyFeedback(null);
    clearSelectedContent();
    setIsEditModalOpen(true);
  };

  const togglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    try {
      await updateItem({ pinned: !item.pinned });
    } catch (err: unknown) {
      setItemError(toMessage(err, 'Failed to update item'));
    }
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteItem();
    } catch (err: unknown) {
      setItemError(toMessage(err, 'Failed to delete item'));
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const toggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    try {
      await updateItem({ archived: !item.archived });
    } catch (err: unknown) {
      setItemError(toMessage(err, 'Failed to update item'));
    }
  };

  const confirmHide = async () => {
    setItemError(null);
    try {
      await updateItem({ hidden: !item.hidden });
    } catch (err: unknown) {
      setItemError(toMessage(err, 'Failed to update item'));
    } finally {
      setIsHideModalOpen(false);
    }
  };

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    setCopyFeedback(null);

    try {
      const text = copyText();
      if (!text) throw new Error('No content to copy.');
      await copyToClipboard(text);
      setCopyFeedback('Copied!');
      clearLater(() => setCopyFeedback(null), 2000);
    } catch (err: unknown) {
      setItemError(toMessage(err, 'Failed to copy content'));
      clearLater(() => setItemError(null), 3000);
    }
  };

  return {
    itemError,
    setItemError,
    copyFeedback,
    minimized,
    isEditModalOpen,
    closeEdit: () => setIsEditModalOpen(false),
    isViewModalOpen,
    openView: () => setIsViewModalOpen(true),
    closeView: () => setIsViewModalOpen(false),
    isDeleteModalOpen,
    closeDelete: () => setIsDeleteModalOpen(false),
    isHideModalOpen,
    closeHide: () => setIsHideModalOpen(false),
    confirmDelete,
    confirmHide,
    toolbar: {
      onTogglePin: togglePin,
      onToggleArchive: toggleArchive,
      onEdit: openEdit,
      onCopy: copy,
      onDelete: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
      },
      onToggleHide: (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHideModalOpen(true);
      },
      onToggleMinimize: (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleItemMinimize(key);
      },
    },
  };
}

export type ItemCardController = ReturnType<typeof useItemCard>;
