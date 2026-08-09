/**
 * Body scroll lock shared by all modals. It has to be process-wide rather than
 * per-component state because modals stack (an edit modal plus its discard
 * confirmation): only the first lock saves and applies the styles, only the last
 * release restores them, otherwise a nested modal's cleanup would "restore" the
 * styles it captured from the outer one.
 */

interface SavedStyles {
  overflow: string;
  position: string;
  width: string;
  height: string;
  top: string;
  scrollY: number;
}

let openCount = 0;
let saved: SavedStyles | null = null;

/**
 * The sheet layout needs the stronger `position: fixed` lock, which costs a
 * scroll-position save/restore. Which layout is active is decided by CSS — this
 * reads the flag CSS sets, so the breakpoint is not duplicated in JS.
 */
const isSheetLayout = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--sheet-layout').trim() === '1';

/** Locks the body and returns the matching release function. */
export function lockBodyScroll(): () => void {
  let released = false;

  openCount++;
  if (openCount === 1) {
    saved = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      top: document.body.style.top,
      scrollY: window.scrollY,
    };

    document.body.style.overflow = 'hidden';
    if (isSheetLayout()) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = `-${saved.scrollY}px`;
    }
  }

  return () => {
    // Guard against a double release leaving the counter permanently negative.
    if (released) return;
    released = true;

    openCount--;
    if (openCount > 0 || !saved) return;

    const { scrollY, ...styles } = saved;
    document.body.style.overflow = styles.overflow;
    document.body.style.position = styles.position;
    document.body.style.width = styles.width;
    document.body.style.height = styles.height;
    document.body.style.top = styles.top;
    window.scrollTo(0, scrollY);
    saved = null;
  };
}
