import React from 'react';
import Modal from './Modal';
import styles from '@/Home.module.css';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    danger?: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText = 'Cancel',
    danger = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className={styles.form}>
                <p className={styles.modalBodyText}>{message}</p>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={onConfirm}
                        className={`${styles.button} ${danger ? styles.deleteButton : ''}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className={styles.button}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmActionModal;
