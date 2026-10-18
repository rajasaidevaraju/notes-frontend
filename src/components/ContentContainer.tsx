import React, { useRef, useState } from 'react';
import { LockIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const contentQuery = useContentQuery();
  const hiddenQuery = useHiddenContentQuery(hiddenUnlocked);
  const authQuery = useAuthStatusQuery();

  const batchDeleteMutation = useBatchDeleteMutation();
  const submitPinMutation = useSubmitPinMutation();
  const logoutMutation = useLogoutMutation();

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
      <div className="my-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 md:my-4">
        <div className="flex w-full min-w-0 flex-auto flex-col gap-2 md:w-auto md:flex-row md:flex-wrap md:items-center md:gap-3">
          <ContentTabs onUnlockRequest={handleUnlockRequest} />
          <SearchBar />
        </div>
        <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto md:justify-end md:gap-2">
          {isSelectingMode ? (
            <>
              {selectedContent.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsMultiDeleteModalOpen(true)}
                  className="max-md:flex-1"
                  title={`Delete ${selectedContent.size} selected items`}
                >
                  <Trash2Icon />
                  Delete Selected ({selectedContent.size})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={toggleSelectingMode}
                className="max-md:flex-1"
                title="Cancel Selection"
              >
                Cancel Selection
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={toggleSelectingMode}
              className="max-md:flex-1"
              title="Select Items for Deletion"
            >
              Select Items
            </Button>
          )}

          {hiddenUnlocked && (
            <Button
              variant="outline"
              onClick={hideHiddenNotes}
              className="max-md:flex-1"
              title="Lock hidden notes section"
            >
              <LockIcon />
              Lock Hidden
            </Button>
          )}

          <ThemeToggle />

          <Button onClick={() => setIsAddNoteModalOpen(true)} className="max-md:flex-1">
            <PlusIcon />
            Create New
          </Button>
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