import { useState } from 'react';

/**
 * Guards a modal's close action when the form has unsaved changes.
 * Use `requestClose` in place of `onClose` for Cancel buttons, the modal's
 * X button and overlay clicks; it closes immediately when clean, otherwise
 * opens a confirmation dialog driven by the returned state.
 */
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
