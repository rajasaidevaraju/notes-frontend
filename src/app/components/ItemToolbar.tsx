import React from 'react';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';

interface ItemToolbarProps {
    pinned: boolean;
    hidden: boolean;
    minimized: boolean;
    copyFeedback: string | null;
    onTogglePin: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onCopy: (e: React.MouseEvent) => void;
    onToggleHide: (e: React.MouseEvent) => void;
    onToggleMinimize: (e: React.MouseEvent) => void;
}

/**
 * Shared header action bar for notes, checklists and trackers. Every item card
 * renders the same six controls (pin, edit, delete, copy, hide, minimize); this
 * keeps the markup and icons in one place instead of duplicated per item type.
 */
const ItemToolbar: React.FC<ItemToolbarProps> = ({
    pinned,
    hidden,
    minimized,
    copyFeedback,
    onTogglePin,
    onEdit,
    onDelete,
    onCopy,
    onToggleHide,
    onToggleMinimize,
}) => (
    <div className={noteItemStyles.buttonGroup}>
        <button onClick={onTogglePin} className={`${styles.button}`} title={pinned ? 'Unpin' : 'Pin'}>
            {pinned ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 12V4H17V2H7V4H8V12L5 17V19H11V22H13V19H19V17L16 12Z" />
                </svg>
            )}
        </button>
        <button onClick={onEdit} className={`${styles.button}`} title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
            </svg>
        </button>
        <button onClick={onDelete} className={`${styles.button}`} title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        </button>
        <button onClick={onCopy} className={`${styles.button}`} title="Copy Content">
            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copyFeedback && <span style={{ marginLeft: '0.3rem' }}>{copyFeedback}</span>}
        </button>
        <button
            onClick={onToggleHide}
            className={`${styles.button} ${styles.hideButton}`}
            title={hidden ? 'Un-Hide' : 'Hide'}
            aria-label={hidden ? 'Un-Hide' : 'Hide'}
        >
            {hidden ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <circle cx="12" cy="12" r="3"></circle>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <path d="M3 3l18 18"></path> <circle cx="12" cy="12" r="3"></circle>
                </svg>
            )}
        </button>
        <button
            onClick={onToggleMinimize}
            className={`${styles.button}`}
            title={minimized ? 'Expand' : 'Minimize'}
            aria-label={minimized ? 'Expand' : 'Minimize'}
        >
            {minimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <line x1="12" y1="5" x2="12" y2="19" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            )}
        </button>
    </div>
);

export default ItemToolbar;
