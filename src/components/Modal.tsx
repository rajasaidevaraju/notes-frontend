import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/Home.module.css';
import { lockBodyScroll } from '@/utils/bodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) return lockBodyScroll();
  }, [isOpen]);

  // A `position: fixed` overlay is sized to the LAYOUT viewport, which does not
  // shrink when the on-screen keyboard opens — so a bottom-anchored sheet ends up
  // behind the keyboard. Mirror the VISUAL viewport into custom properties the
  // mobile styles consume, keeping the sheet fully above the keyboard.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || !mounted || !viewport) return;

    const sync = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      overlay.style.setProperty('--visual-viewport-height', `${viewport.height}px`);
      overlay.style.setProperty('--visual-viewport-top', `${viewport.offsetTop}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
    };
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div ref={overlayRef} className={styles.modalOverlay} onClick={onClose}>
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
