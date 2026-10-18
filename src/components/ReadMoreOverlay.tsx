import React from 'react';

interface ReadMoreOverlayProps {
  label: string;
  onClick: () => void;
}

const ReadMoreOverlay: React.FC<ReadMoreOverlayProps> = ({ label, onClick }) => (
  <button
    type="button"
    className="group/more absolute inset-x-0 bottom-0 flex h-20 w-full items-end justify-center bg-linear-to-b from-transparent to-(--card-bg,var(--color-card)) pb-4 outline-none"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <span className="rounded-full border bg-card px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase transition-colors group-hover/more:border-primary/50 group-hover/more:text-primary group-focus-visible/more:ring-3 group-focus-visible/more:ring-ring/50">
      {label}
    </span>
  </button>
);

export default ReadMoreOverlay;
