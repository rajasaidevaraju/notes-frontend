import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/Home.module.css';
import { lockBodyScroll } from '@/utils/bodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
  className?: string;
}

const openModals: object[] = [];

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className }) => {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const token = {};
    openModals.push(token);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
      if (openModals[openModals.length - 1] !== token) return;
      e.preventDefault();
      onCloseRef.current();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, [isOpen]);

  const [rendered, setRendered] = useState(isOpen);
  if (isOpen && !rendered) setRendered(true);
  const closing = rendered && !isOpen;

  useEffect(() => {
    if (!closing) return;
    const overlay = overlayRef.current;
    if (!overlay?.getAnimations) {
      setRendered(false);
      return;
    }

    let cancelled = false;
    // Infinite animations (spinners) never finish.
    const finite = overlay
      .getAnimations({ subtree: true })
      .filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)));

    Promise.all(finite.map((a) => a.finished))
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setRendered(false);
      });
    return () => {
      cancelled = true;
    };
  }, [closing]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) return lockBodyScroll();
  }, [isOpen]);

  // Fixed overlays ignore the on-screen keyboard; track the visual viewport so the sheet stays above it.
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

  if (!rendered || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={className ? `${styles.modalOverlay} ${className}` : styles.modalOverlay}
      data-state={closing ? 'closing' : 'open'}
      onClick={closing ? undefined : onClose}
    >
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
