// --card-bg lets ReadMoreOverlay fade into whatever background the card state picks.
export const itemCardClass =
  'group/card relative flex h-fit max-h-[400px] flex-col gap-1.5 overflow-hidden rounded-lg border-[1.5px] bg-(--card-bg) p-3 shadow-xs transition-colors [--card-bg:var(--color-card)] hover:border-foreground/20 md:gap-2';

export const itemTitleClass = 'min-w-0 flex-1 truncate text-base font-semibold tracking-tight md:text-lg';

export const itemBodyClass =
  'max-h-[280px] overflow-hidden text-[0.85rem] leading-relaxed whitespace-pre-wrap text-muted-foreground md:text-sm';

export const hoverRevealClass =
  'transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within/card:opacity-100 pointer-fine:group-hover/card:opacity-100';

export const sectionHeadingClass =
  'col-span-full mt-2 border-b pb-1.5 text-[0.8125rem] font-bold tracking-wider text-muted-foreground uppercase';

export const itemGridClass =
  'grid w-full grid-cols-1 gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5';
