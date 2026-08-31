import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UnifiedContent, contentKey } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import { useItemUiStore } from '@/store/itemUiStore';
import { toMessage } from '@/utils/errors';

interface UseItemCardOptions {
  item: UnifiedContent;
  /** Applies a pin/hide/archive flag change. Rejects on failure. */
  updateItem: (changes: { pinned?: boolean; hidden?: boolean; archived?: boolean }) => Promise<unknown>;
  deleteItem: () => Promise<unknown>;
  /** Plain-text rendering of the item, for the copy button. */
  copyText: () => string;
}

/**
 * Every card behaves identically around its content: pin, edit, delete, copy,
 * hide and minimize, each with the same error and confirmation handling. That
 * behaviour lives here; ItemCard renders it and the per-type components supply
 * only what actually differs.
 */
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

  // Transient banners clear themselves; the timers must not outlive the card.
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
      if (!navigator.clipboard) throw new Error('Clipboard API not supported.');
      const text = copyText();
      if (!text) throw new Error('No content to copy.');
      await navigator.clipboard.writeText(text);
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
