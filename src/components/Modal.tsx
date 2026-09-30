import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/Home.module.css';
import { lockBodyScroll } from '@/utils/bodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
  /** Extra class on the overlay, e.g. to give one kind of modal its own animation. */
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className }) => {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Stays true after isOpen turns false, until the exit animation has played.
  const [rendered, setRendered] = useState(isOpen);
  if (isOpen && !rendered) setRendered(true);
  const closing = rendered && !isOpen;

  // Unmount once every animation the closing styles started (the overlay fade,
  // plus any variant's own, e.g. the sheet slide) has finished, so durations
  // live only in CSS. Reopening mid-exit cancels the unmount.
  useEffect(() => {
    if (!closing) return;
    const overlay = overlayRef.current;
    if (!overlay?.getAnimations) {
      setRendered(false);
      return;
    }

    let cancelled = false;
    // Infinite ones (a spinner in the body) would never finish, so skip them.
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
