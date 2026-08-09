import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';

/**
 * Keeps the browser UI colour in step with the theme, reading the value from
 * the `--background` token so the palette is only defined in globals.css.
 */
const syncThemeColorMeta = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const background = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim();
    if (background) meta.setAttribute('content', background);
};

const ThemeToggle: React.FC = () => {
    // index.html already resolved stored-preference-else-system before paint, so
    // the class on <html> is the source of truth; re-deriving it here would be a
    // second copy of that rule, free to drift.
    const [isDarkMode, setIsDarkMode] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(syncThemeColorMeta, []);

    const toggleTheme = () => {
        const nextIsDark = !isDarkMode;
        document.documentElement.classList.toggle('dark', nextIsDark);
        localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
        setIsDarkMode(nextIsDark);
        syncThemeColorMeta();
    };

    return (
        <button
            onClick={toggleTheme}
            className={styles.button}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default ThemeToggle;
