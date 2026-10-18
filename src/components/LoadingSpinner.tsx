import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}
