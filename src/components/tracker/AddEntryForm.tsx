import React, { useState } from 'react';
import styles from '@/Home.module.css';
import trackerStyles from './Tracker.module.css';
import ErrorMessage from '@/components/ErrorMessage';
import { Tracker } from '@/types/Types';
import { LIMITS } from '@/constants';
import { useAddTrackerEntryMutation } from '@/hooks/useContentQuery';

interface AddEntryFormProps {
  tracker: Tracker;
  onClose: () => void;
}

/**
 * Single-input quick add, mounted only while its modal is open so the input
 * focuses on mount. Unlike the edit form this posts immediately and closes —
 * no title/unit/entry-deletion state to save.
 */
const AddEntryForm: React.FC<AddEntryFormProps> = ({ tracker, onClose }) => {
  const [value, setValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const addTrackerEntryMutation = useAddTrackerEntryMutation();

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || addTrackerEntryMutation.isPending) return;

    setFormError(null);
    try {
      await addTrackerEntryMutation.mutateAsync({ trackerId: tracker.id, value: trimmed });
      onClose();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? `Failed to add entry: ${err.message}` : 'Failed to add entry'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {formError && <ErrorMessage message={formError} />}
      <div className={trackerStyles.quickAddRow}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tracker.unit ? `New value (${tracker.unit})...` : 'New value...'}
          className={trackerStyles.quickAddInput}
          maxLength={LIMITS.TRACKER_VALUE}
          aria-label="New entry value"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={`${styles.button} ${styles.successButton}`}
          disabled={!value.trim() || addTrackerEntryMutation.isPending}
        >
          {addTrackerEntryMutation.isPending ? 'Adding...' : 'Add Entry'}
        </button>
        <button type="button" onClick={onClose} className={`${styles.button}`}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddEntryForm;
