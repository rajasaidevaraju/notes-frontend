import { useState } from 'react';

export function useUnsavedChangesGuard(isDirty: boolean, onClose: () => void) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const requestClose = () => {
        if (isDirty) {
            setIsConfirmOpen(true);
        } else {
            onClose();
        }
    };

    const confirmDiscard = () => {
        setIsConfirmOpen(false);
        onClose();
    };

    const cancelDiscard = () => setIsConfirmOpen(false);

    return { requestClose, isConfirmOpen, confirmDiscard, cancelDiscard };
}
