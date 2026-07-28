import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/Home.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
}

// Matches the bottom-sheet breakpoint in Home.module.css — keep in sync
const MOBILE_MODAL_BREAKPOINT = 600;

// Body scroll lock is shared across stacked modals (e.g. an edit modal plus a
// confirm dialog). Only the first modal to open saves the original styles and
// locks; only the last one to close restores — otherwise a nested modal's
// cleanup would "restore" the lock styles it captured from the outer modal.
let openModalCount = 0;
let savedBodyStyles: {
  overflow: string;
  position: string;
  width: string;
  height: string;
  top: string;
  scrollY: number;
} | null = null;

const lockBodyScroll = () => {
  openModalCount++;
  if (openModalCount > 1) return;

  savedBodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    width: document.body.style.width,
    height: document.body.style.height,
    top: document.body.style.top,
    scrollY: window.scrollY,
  };

  document.body.style.overflow = 'hidden';
  if (window.innerWidth <= MOBILE_MODAL_BREAKPOINT) {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = `-${savedBodyStyles.scrollY}px`;
  }
};

const unlockBodyScroll = () => {
  openModalCount--;
  if (openModalCount > 0 || !savedBodyStyles) return;

  document.body.style.overflow = savedBodyStyles.overflow;
  document.body.style.position = savedBodyStyles.position;
  document.body.style.width = savedBodyStyles.width;
  document.body.style.height = savedBodyStyles.height;
  document.body.style.top = savedBodyStyles.top;
  if (window.innerWidth <= MOBILE_MODAL_BREAKPOINT) {
    window.scrollTo(0, savedBodyStyles.scrollY);
  }
  savedBodyStyles = null;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      lockBodyScroll();
      return unlockBodyScroll;
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {typeof title === 'string' ? (
            <h2 className={styles.modalTitle}>{title}</h2>
          ) : (
            title
          )}
          <button className={styles.modalCloseButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
