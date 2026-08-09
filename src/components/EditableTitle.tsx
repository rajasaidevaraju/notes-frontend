import React from 'react';
import styles from '@/Home.module.css';
import InlineEdit from './InlineEdit';
import { LIMITS } from '@/constants';

interface EditableTitleProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
}

/** The click-to-edit heading used as a modal title. */
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
        displayClassName={`${styles.modalTitle} ${styles.editableTitle}`}
        inputClassName={styles.editableTitleInput}
        tooltip="Click to edit title"
        placeholder={placeholder}
        maxLength={maxLength}
        ariaLabel="Title"
    >
        {value.trim() ? value : (placeholder || 'Untitled')}
    </InlineEdit>
);

export default EditableTitle;
