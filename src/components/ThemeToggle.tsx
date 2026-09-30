import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';

const syncThemeColorMeta = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const background = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim();
    if (background) meta.setAttribute('content', background);
};

const ThemeToggle: React.FC = () => {
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
