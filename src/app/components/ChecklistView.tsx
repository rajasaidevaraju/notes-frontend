import React, { useState, useLayoutEffect, useRef } from 'react';
import { Checklist, ChecklistItem } from '@/types/Types';
import { useContentStore } from '@/store/contentStore';
import checklistStyles from './Checklist.module.css';
import noteItemStyles from './NoteItem.module.css';
import ErrorMessage from './ErrorMessage';

interface ChecklistViewProps {
    checklist: Checklist;
    isMinimized: boolean;
    hideReadMore?: boolean;
    onReadMore?: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ checklist, isMinimized, hideReadMore, onReadMore }) => {
    const { updateChecklistItemApi } = useContentStore();
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useLayoutEffect(() => {
        if (contentRef.current && !hideReadMore) {
            setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
        }
    }, [checklist.items, isMinimized, hideReadMore]);

    const handleToggleItem = async (item: ChecklistItem) => {
        try {
            await updateChecklistItemApi(checklist.id, item.id, { checked: !item.checked });
        } catch (err: any) {
            setError(err.message || 'Failed to update item status');
            setTimeout(() => setError(null), 3000);
        }
    };

    if (isMinimized) {
        const total = checklist.items.length;
        const done = checklist.items.filter(i => i.checked).length;
        return (
            <p className={noteItemStyles.noteContent}>
                {done}/{total} items completed
            </p>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <div ref={contentRef} className={noteItemStyles.noteContent}>
                {error && <ErrorMessage message={error} />}
                <div className={checklistStyles.checklistItems}>
                    {checklist.items.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic' }}>No items</p>
                    ) : (
                        checklist.items.map((item) => (
                            <div key={item.id} className={checklistStyles.checklistItem}>
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleToggleItem(item)}
                                    className={checklistStyles.checkboxInput}
                                />
                                <span
                                    className={`${checklistStyles.itemContent} ${item.checked ? checklistStyles.itemChecked : ''}`}
                                    onClick={() => handleToggleItem(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item.content}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {isOverflowing && !isMinimized && (
                <div
                    className={noteItemStyles.fadeOverlay}
                    onClick={(e) => { e.stopPropagation(); onReadMore?.(); }}
                >
                    <span className={noteItemStyles.moreIndicator}>View More</span>
                </div>
            )}
        </div>
    );
};

export default ChecklistView;
