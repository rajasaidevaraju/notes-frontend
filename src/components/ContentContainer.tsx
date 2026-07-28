import React, { useState } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import ContentList from './ContentList';
import AddContentForm from './AddContentForm';
import PinForm from './PinForm';
import Modal from './Modal';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { useContentStore } from '@/store/contentStore';
import {
  useContentQuery,
  useHiddenContentQuery,
  useBatchDeleteMutation,
  useAuthStatusQuery,
  useSubmitPinMutation,
  useLogoutMutation,
} from '@/hooks/useContentQuery';

const ContentContainer: React.FC = () => {
  const { selectedContentKeys, clearSelectedContent, hiddenUnlocked, setHiddenUnlocked } =
    useContentStore();

  const [actionError, setActionError] = useState<string | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
  const [isSelectingMode, setIsSelectingMode] = useState(false);

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
    const selectedKeys = Array.from(selectedContentKeys);
    if (selectedKeys.length === 0) return;

    setActionError(null);
    const itemsToDelete = selectedKeys.map((key) => {
      const [type, idStr] = key.split('-');
      return { id: Number(idStr), type };
    });

    try {
      await batchDeleteMutation.mutateAsync(itemsToDelete);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? `Failed to delete items: ${err.message}` : 'Failed to delete items'
      );
    } finally {
      setIsMultiDeleteModalOpen(false);
      setIsSelectingMode(false);
    }
  };

  const toggleSelectingMode = () => {
    setIsSelectingMode((prev) => !prev);
    clearSelectedContent();
  };

  const showHiddenNotes = async () => {
    setActionError(null);
    // Flipping the flag enables the hidden query, which fetches on the next
    // render; refetching here would be a no-op while it is still disabled.
    const auth = await authQuery.refetch();
    if (auth.data?.loggedIn) {
      setHiddenUnlocked(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const hideHiddenNotes = async () => {
    setHiddenUnlocked(false);
    try {
      await logoutMutation.mutateAsync();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? `Failed to log out: ${err.message}` : 'Failed to log out');
    }
  };

  return (
    <>
      <ErrorMessage message={displayError} />
      <div className={styles.controlsContainer}>
        <SearchBar />
        <div className={styles.mainActionButtons}>
          {isSelectingMode ? (
            <>
              {selectedContentKeys.size > 0 && (
                <button
                  onClick={() => setIsMultiDeleteModalOpen(true)}
                  className={`${styles.button} ${styles.dangerButton}`}
                  title={`Delete ${selectedContentKeys.size} selected items`}
                >
                  Delete Selected ({selectedContentKeys.size})
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
          {hiddenUnlocked ? (
            <button className={`${styles.button}`} onClick={hideHiddenNotes}>
              Hide Hidden Notes
            </button>
          ) : (
            <button className={`${styles.button}`} onClick={showHiddenNotes}>
              Show Hidden Notes
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

      <Modal
        isOpen={isMultiDeleteModalOpen}
        onClose={() => setIsMultiDeleteModalOpen(false)}
        title="Confirm Bulk Deletion"
      >
        <div className={styles.form}>
          <p className={styles.modalBodyText}>
            Are you sure you want to delete {selectedContentKeys.size} selected items?
          </p>
          <div className={styles.buttonGroup}>
            <button
              onClick={handleConfirmMultiDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => {
                setIsMultiDeleteModalOpen(false);
                clearSelectedContent();
                setIsSelectingMode(false);
              }}
              className={`${styles.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <ContentList isSelectingMode={isSelectingMode} />
    </>
  );
};

export default ContentContainer;