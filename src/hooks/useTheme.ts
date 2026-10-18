import { useSyncExternalStore } from 'react';

const root = () => document.documentElement;

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

const getIsDark = () => root().classList.contains('dark');

export const syncThemeColorMeta = () => {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const background = getComputedStyle(document.body).backgroundColor;
  if (background) meta.setAttribute('content', background);
};

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getIsDark, () => false);

  const toggleTheme = () => {
    const nextIsDark = !getIsDark();
    root().classList.toggle('dark', nextIsDark);
    try {
      localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private mode); the toggle still applies for this visit.
    }
    syncThemeColorMeta();
  };

  return { isDark, toggleTheme };
}
