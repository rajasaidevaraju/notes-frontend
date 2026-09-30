interface SavedStyles {
  overflow: string;
  position: string;
  width: string;
  top: string;
  scrollY: number;
}

let openCount = 0;
let saved: SavedStyles | null = null;

const isSheetLayout = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--sheet-layout').trim() === '1';

export function lockBodyScroll(): () => void {
  let released = false;

  openCount++;
  if (openCount === 1) {
    saved = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
      scrollY: window.scrollY,
    };

    document.body.style.overflow = 'hidden';
    if (isSheetLayout()) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      // No height: 100% — with the top offset it clips the page once scrolled.
      document.body.style.top = `-${saved.scrollY}px`;
    }
  }

  return () => {
    if (released) return;
    released = true;

    openCount--;
    if (openCount > 0 || !saved) return;

    const { scrollY, ...styles } = saved;
    document.body.style.overflow = styles.overflow;
    document.body.style.position = styles.position;
    document.body.style.width = styles.width;
    document.body.style.top = styles.top;
    window.scrollTo(0, scrollY);
    saved = null;
  };
}
