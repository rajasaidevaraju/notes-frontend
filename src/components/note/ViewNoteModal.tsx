import React from 'react';
import { Note } from '@/types/Types';
import Modal from '@/components/Modal';

interface ViewNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({ isOpen, onClose, note }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note.title}>
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {note.content || <i className="text-muted-foreground">No content</i>}
            </div>
        </Modal>
    );
};

export default ViewNoteModal;
