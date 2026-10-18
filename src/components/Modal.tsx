import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
  className?: string;
}

// Fixed overlays ignore the on-screen keyboard; lift the bottom sheet by the space it covers.
function useKeyboardInset(active: boolean) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;

    const root = document.documentElement;
    const sync = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      root.style.setProperty('--keyboard-inset', `${inset}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      root.style.removeProperty('--keyboard-inset');
    };
  }, [active]);
}

const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useKeyboardInset(isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={popupRef}
        // Focusing an input on open would pop the on-screen keyboard.
        initialFocus={() => (isTouch() ? popupRef.current : true)}
        className={cn(
          'flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-[550px]',
          'max-sm:top-auto max-sm:bottom-(--keyboard-inset,0px) max-sm:left-0 max-sm:max-h-[calc(100dvh-var(--keyboard-inset,0px))] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)] max-sm:duration-200 max-sm:data-open:zoom-in-100 max-sm:data-open:slide-in-from-bottom-full max-sm:data-closed:zoom-out-100 max-sm:data-closed:slide-out-to-bottom-full',
          className
        )}
      >
        <DialogHeader className="min-w-0 border-b px-4 py-3 pr-12">
          {typeof title === 'string' ? (
            <DialogTitle className="truncate text-lg leading-snug">{title}</DialogTitle>
          ) : (
            <DialogTitle render={<div />} className="min-w-0">
              {title}
            </DialogTitle>
          )}
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
