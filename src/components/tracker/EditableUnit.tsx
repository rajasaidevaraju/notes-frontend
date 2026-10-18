import React from 'react';
import InlineEdit from '@/components/InlineEdit';
import { LIMITS } from '@/constants';

interface EditableUnitProps {
  value: string;
  onChange: (value: string) => void;
}

const EditableUnit: React.FC<EditableUnitProps> = ({ value, onChange }) => (
  <InlineEdit
    value={value}
    onChange={onChange}
    displayClassName="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-primary"
    inputClassName="h-7 w-40 max-w-full text-xs md:text-xs max-sm:text-base"
    tooltip="Click to edit unit"
    placeholder="kg, steps, hours…"
    maxLength={LIMITS.TRACKER_UNIT}
    ariaLabel="Unit"
  >
    {value.trim() ? `unit: ${value}` : '+ add unit'}
  </InlineEdit>
);

export default EditableUnit;
