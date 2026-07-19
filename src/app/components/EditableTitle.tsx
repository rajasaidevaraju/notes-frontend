'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from '@/Home.module.css';
import { LIMITS } from '@/constants';

interface EditableTitleProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ value, onChange, placeholder, maxLength = LIMITS.TITLE }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault();
                        setEditing(false);
                    }
                }}
                className={styles.editableTitleInput}
                placeholder={placeholder}
                autoComplete="off"
            />
        );
    }

    return (
        <h2
            className={`${styles.modalTitle} ${styles.editableTitle}`}
            onClick={() => setEditing(true)}
            title="Click to edit title"
        >
            {value.trim() ? value : (placeholder || 'Untitled')}
        </h2>
    );
};

export default EditableTitle;
