import React, { useState } from 'react';
import trackerStyles from './Tracker.module.css';
import { LIMITS } from '@/constants';

interface EditableUnitProps {
  value: string;
  onChange: (value: string) => void;
}

/** Click-to-edit unit chip shown under the title in the tracker edit modal. */
const EditableUnit: React.FC<EditableUnitProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            setEditing(false);
          }
        }}
        className={trackerStyles.unitInput}
        placeholder="kg, steps, hours…"
        maxLength={LIMITS.TRACKER_UNIT}
        autoComplete="off"
        aria-label="Unit"
      />
    );
  }

  return (
    <span
      className={trackerStyles.unitChip}
      onClick={() => setEditing(true)}
      title="Click to edit unit"
    >
      {value.trim() ? `unit: ${value}` : '+ add unit'}
    </span>
  );
};

export default EditableUnit;
