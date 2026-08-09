import React, { useRef, useState } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import ContentList from './ContentList';
import AddContentForm from './AddContentForm';
import PinForm from './PinForm';
import ConfirmActionModal from './ConfirmActionModal';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import ContentTabs from './ContentTabs';
import { useContentStore, ContentTab } from '@/store/contentStore';
import { toMessage } from '@/utils/errors';
import {
  useContentQuery,
  useHiddenContentQuery,
  useBatchDeleteMutation,
  useAuthStatusQuery,
  useSubmitPinMutation,
  useLogoutMutation,
} from '@/hooks/useContentQuery';

const ContentContainer: React.FC = () => {
  const {
    selectedContent,
    clearSelectedContent,
    hiddenUnlocked,
    setHiddenUnlocked,
    setActiveTab,
  } = useContentStore();

  const [actionError, setActionError] = useState<string | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  const pendingTab = useRef<ContentTab>('hidden');

  // TanStack Query automatically manages caching & fetching
  const contentQuery = useContentQuery();
  const hiddenQuery = useHiddenContentQuery(hiddenUnlocked);
  const authQuery = useAuthStatusQuery();

  const batchDeleteMutation = useBatchDeleteMutation();
  const submitPinMutation = useSubmitPinMutation();
  const logoutMutation = useLogoutMutation();

  // A failed load must not look like an empty list, so surface fetch errors
  // alongside errors from the actions this component owns.
  const loadError = contentQuery.error ?? (hiddenUnlocked ? hiddenQuery.error : null);
  const displayError =
    actionError ?? (loadError instanceof Error ? `Failed to load content: ${loadError.message}` : null);

  const handleConfirmMultiDelete = async () => {
    const itemsToDelete = Array.from(selectedContent.values());
    if (itemsToDelete.length === 0) return;

    setActionError(null);
    try {
      await batchDeleteMutation.mutateAsync(itemsToDelete);
    } catch (err: unknown) {
      setActionError(toMessage(err, 'Failed to delete items'));
    } finally {
      setIsMultiDeleteModalOpen(false);
      setIsSelectingMode(false);
    }
  };

  const toggleSelectingMode = () => {
    setIsSelectingMode((prev) => !prev);
    clearSelectedContent();
  };

  const handleUnlockRequest = async (targetTab: ContentTab = 'hidden') => {
    setActionError(null);
    pendingTab.current = targetTab;

    const auth = await authQuery.refetch();
    if (auth.data?.loggedIn) {
      setHiddenUnlocked(true);
      setActiveTab(targetTab);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const hideHiddenNotes = async () => {
    setHiddenUnlocked(false);
    try {
      await logoutMutation.mutateAsync();
    } catch (err: unknown) {
      setActionError(toMessage(err, 'Failed to log out'));
    }
  };

  return (
    <>
      <ErrorMessage message={displayError} />
      <div className={styles.controlsContainer}>
        <div className={styles.topNavigationRow}>
          <ContentTabs onUnlockRequest={handleUnlockRequest} />
          <SearchBar />
        </div>
        <div className={styles.mainActionButtons}>
          {isSelectingMode ? (
            <>
              {selectedContent.size > 0 && (
                <button
                  onClick={() => setIsMultiDeleteModalOpen(true)}
                  className={`${styles.button} ${styles.dangerButton}`}
                  title={`Delete ${selectedContent.size} selected items`}
                >
                  Delete Selected ({selectedContent.size})
                </button>
              )}
              <button
                onClick={toggleSelectingMode}
                className={`${styles.button}`}
                title="Cancel Selection"
              >
                Cancel Selection
              </button>
            </>
          ) : (
            <button
              onClick={toggleSelectingMode}
              className={`${styles.button}`}
              title="Select Items for Deletion"
            >
              Select Items
            </button>
          )}

          {hiddenUnlocked && (
            <button
              className={`${styles.button} ${styles.pinButton}`}
              onClick={hideHiddenNotes}
              title="Lock hidden notes section"
            >
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Lock Hidden
            </button>
          )}

          <ThemeToggle />

          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Create New
          </button>
        </div>
      </div>

      <PinForm
        onClose={() => setIsPinModalOpen(false)}
        onSubmitPin={async (pin) => {
          try {
            await submitPinMutation.mutateAsync(pin);
            setHiddenUnlocked(true);
            setActiveTab(pendingTab.current || 'hidden');
            setIsPinModalOpen(false);
          } catch {
            // PinForm surfaces the failure itself.
          }
        }}
        isOpen={isPinModalOpen}
      />

      <AddContentForm
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
      />

      <ConfirmActionModal
        isOpen={isMultiDeleteModalOpen}
        onClose={() => {
          setIsMultiDeleteModalOpen(false);
          clearSelectedContent();
          setIsSelectingMode(false);
        }}
        onConfirm={handleConfirmMultiDelete}
        title="Confirm Bulk Deletion"
        message={`Are you sure you want to delete ${selectedContent.size} selected items?`}
        confirmText="Yes, Delete All"
        danger
      />

      <ContentList isSelectingMode={isSelectingMode} />
    </>
  );
};

export default ContentContainer;