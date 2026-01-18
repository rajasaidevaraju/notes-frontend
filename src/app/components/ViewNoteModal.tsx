import React from 'react';
import { Note } from '@/types/Types';
import Modal from './Modal';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';

interface ViewNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({ isOpen, onClose, note }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note.title}>
            <div className={noteItemStyles.viewContentContainer}>
                <div
                    className={noteItemStyles.viewContent}
                    style={{ whiteSpace: 'pre-wrap', color: 'var(--color-neutral-700)', lineHeight: '1.6' }}
                >
                    {note.content || <i style={{ opacity: 0.5 }}>No content</i>}
                </div>
            </div>
        </Modal>
    );
};

export default ViewNoteModal;
