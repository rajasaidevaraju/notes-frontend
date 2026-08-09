import React from 'react';
import { Note } from '@/types/Types';
import Modal from '@/components/Modal';
import noteItemStyles from '@/components/ItemCard.module.css';

interface ViewNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({ isOpen, onClose, note }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note.title}>
            <div className={noteItemStyles.viewContentContainer}>
                <div className={noteItemStyles.viewContent}>
                    {note.content || <i className={noteItemStyles.emptyContent}>No content</i>}
                </div>
            </div>
        </Modal>
    );
};

export default ViewNoteModal;
