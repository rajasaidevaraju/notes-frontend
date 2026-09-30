import React, { useState } from 'react';
import styles from '@/Home.module.css';
import noteItemStyles from './ItemCard.module.css';
import Modal from './Modal';

interface ItemToolbarProps {
    pinned: boolean;
    hidden: boolean;
    archived: boolean;
    minimized: boolean;
    copyFeedback: string | null;
    onTogglePin: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onAdd?: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onCopy: (e: React.MouseEvent) => void;
    onToggleHide: (e: React.MouseEvent) => void;
    onToggleArchive: (e: React.MouseEvent) => void;
    onToggleMinimize: (e: React.MouseEvent) => void;
}

interface ItemAction {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    danger?: boolean;
}

const Icon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);


const buildActions = (props: ItemToolbarProps): ItemAction[] => {
    const { pinned, hidden, archived, minimized } = props;

    return [
        {
            key: 'pin',
            label: pinned ? 'Unpin' : 'Pin',
            onClick: props.onTogglePin,
            icon: (
                <Icon>
                    <path d="M12 17v5" />
                    <path
                        d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
                        fill={pinned ? 'currentColor' : 'none'}
                    />
                </Icon>
            ),
        },
        {
            key: 'archive',
            label: archived ? 'Unarchive' : 'Archive',
            onClick: props.onToggleArchive,
            icon: (
                <Icon>
                    <rect width="20" height="5" x="2" y="3" rx="1" fill={archived ? 'currentColor' : 'none'} />
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                    <path d="M10 12h4" />
                </Icon>
            ),
        },
        ...(props.onAdd
            ? [{
                key: 'add',
                label: 'Add Entry',
                onClick: props.onAdd,
                icon: (
                    <Icon>
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M8 12h8" />
                        <path d="M12 8v8" />
                    </Icon>
                ),
            }]
            : []),
        {
            key: 'edit',
            label: 'Edit',
            onClick: props.onEdit,
            icon: (
                <Icon>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
                </Icon>
            ),
        },
        {
            key: 'delete',
            label: 'Delete',
            onClick: props.onDelete,
            danger: true,
            icon: (
                <Icon>
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </Icon>
            ),
        },
        {
            key: 'copy',
            label: 'Copy Content',
            onClick: props.onCopy,
            icon: (
                <Icon>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </Icon>
            ),
        },
        {
            key: 'hide',
            label: hidden ? 'Un-Hide' : 'Hide',
            onClick: props.onToggleHide,
            icon: hidden ? (
                <Icon>
                    <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z" />
                    <circle cx="12" cy="12" r="3" />
                </Icon>
            ) : (
                <Icon>
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                    <path d="m2 2 20 20" />
                </Icon>
            ),
        },
        {
            key: 'minimize',
            label: minimized ? 'Expand' : 'Minimize',
            onClick: props.onToggleMinimize,
            icon: minimized ? (
                <Icon>
                    <path d="M15 3h6v6" />
                    <path d="m21 3-7 7" />
                    <path d="m3 21 7-7" />
                    <path d="M9 21H3v-6" />
                </Icon>
            ) : (
                <Icon>
                    <path d="m14 10 7-7" />
                    <path d="M20 10h-6V4" />
                    <path d="m3 21 7-7" />
                    <path d="M4 14h6v6" />
                </Icon>
            ),
        },
    ];
};

/**
 * Inline header action bar for notes, checklists and trackers. Shown only on
 * devices with a hover-capable pointer; touch devices get ItemActionsMenu.
 */
const ItemToolbar: React.FC<ItemToolbarProps> = (props) => (
    <div className={`${noteItemStyles.toolbarGroup} ${noteItemStyles.inlineToolbar}`}>
        {buildActions(props).map((action) => (
            <button
                key={action.key}
                onClick={action.onClick}
                className={`${styles.button} ${action.danger ? styles.deleteIconButton : ''}`}
                title={action.label}
                aria-label={action.label}
            >
                {action.icon}
                {action.key === 'copy' && props.copyFeedback && (
                    <span className={noteItemStyles.copyFeedback}>{props.copyFeedback}</span>
                )}
            </button>
        ))}
    </div>
);


export const ItemActionsMenu: React.FC<ItemToolbarProps & { title: string }> = ({ title, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Destructive action last, apart from the rest, as menus conventionally do.
    const actions = buildActions(props);
    const ordered = [...actions.filter((a) => !a.danger), ...actions.filter((a) => a.danger)];

    return (
        <>
            {props.copyFeedback && (
                <span className={`${noteItemStyles.copyFeedback} ${noteItemStyles.menuFeedback}`}>
                    {props.copyFeedback}
                </span>
            )}
            <button
                type="button"
                className={`${styles.button} ${noteItemStyles.menuButton}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                title="More options"
                aria-label="More options"
                aria-haspopup="dialog"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                className={noteItemStyles.actionSheet}
            >
                <ul className={noteItemStyles.actionList}>
                    {ordered.map((action) => (
                        <li key={action.key}>
                            <button
                                type="button"
                                className={`${noteItemStyles.actionItem} ${action.danger ? noteItemStyles.dangerAction : ''}`}
                                onClick={(e) => {
                                    setIsOpen(false);
                                    action.onClick(e);
                                }}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </Modal>
        </>
    );
};

export default ItemToolbar;
