import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: React.ReactNode;
  className?: string;
}

const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={popupRef}
        // Focusing an input on open would pop the on-screen keyboard.
        initialFocus={() => (isTouch() ? popupRef.current : true)}
        className={cn('flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-[550px]', className)}
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
