import React from 'react';
import trackerStyles from './Tracker.module.css';
import InlineEdit from '@/components/InlineEdit';
import { LIMITS } from '@/constants';

interface EditableUnitProps {
  value: string;
  onChange: (value: string) => void;
}

/** Click-to-edit unit chip shown under the title in the tracker edit modal. */
const EditableUnit: React.FC<EditableUnitProps> = ({ value, onChange }) => (
  <InlineEdit
    value={value}
    onChange={onChange}
    displayClassName={trackerStyles.unitChip}
    inputClassName={trackerStyles.unitInput}
    tooltip="Click to edit unit"
    placeholder="kg, steps, hours…"
    maxLength={LIMITS.TRACKER_UNIT}
    ariaLabel="Unit"
  >
    {value.trim() ? `unit: ${value}` : '+ add unit'}
  </InlineEdit>
);

export default EditableUnit;
