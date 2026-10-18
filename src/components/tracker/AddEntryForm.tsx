import React, { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tracker } from '@/types/Types';
import { LIMITS } from '@/constants';
import { useAddTrackerEntryMutation } from '@/hooks/useContentQuery';

interface AddEntryFormProps {
  tracker: Tracker;
  onClose: () => void;
}

const AddEntryForm: React.FC<AddEntryFormProps> = ({ tracker, onClose }) => {
  const [value, setValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const addTrackerEntryMutation = useAddTrackerEntryMutation();

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError && <ErrorMessage message={formError} />}
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={tracker.unit ? `New value (${tracker.unit})...` : 'New value...'}
        maxLength={LIMITS.TRACKER_VALUE}
        aria-label="New entry value"
        autoFocus
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!value.trim() || addTrackerEntryMutation.isPending}>
          {addTrackerEntryMutation.isPending ? 'Adding...' : 'Add Entry'}
        </Button>
      </div>
    </form>
  );
};

export default AddEntryForm;
