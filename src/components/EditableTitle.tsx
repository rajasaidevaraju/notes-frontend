import React from 'react';
import InlineEdit from './InlineEdit';
import { LIMITS } from '@/constants';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onChange,
  placeholder,
  maxLength = LIMITS.TITLE,
}) => (
  <InlineEdit
    value={value}
    onChange={onChange}
    displayAs="heading"
    displayClassName="-mx-1 cursor-text truncate rounded-md px-1 text-lg leading-snug font-medium transition-colors hover:bg-muted"
    inputClassName="h-8 text-base font-medium md:text-base"
    tooltip="Click to edit title"
    placeholder={placeholder}
    maxLength={maxLength}
    ariaLabel="Title"
  >
    {value.trim() ? value : placeholder || 'Untitled'}
  </InlineEdit>
);

export default EditableTitle;
