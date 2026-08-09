import React from 'react';
import { Checklist } from '@/types/Types';
import Modal from '@/components/Modal';
import noteItemStyles from '@/components/ItemCard.module.css';
import ChecklistView from './ChecklistView';

interface ViewChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    checklist: Checklist;
}

const ViewChecklistModal: React.FC<ViewChecklistModalProps> = ({ isOpen, onClose, checklist }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={checklist.title}>
            <div className={noteItemStyles.modalContentArea}>
                <ChecklistView checklist={checklist} isMinimized={false} hideReadMore />
            </div>
        </Modal>
    );
};

export default ViewChecklistModal;
