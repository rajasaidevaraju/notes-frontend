import React, { useEffect, useState } from 'react';
import styles from '@/Home.module.css';

const setThemeColorMeta = (isDark: boolean) => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', isDark ? '#171717' : '#f8fafc');
};

const ThemeToggle: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage or system preference
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const isDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
        setThemeColorMeta(isDark);
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDarkMode;
        document.documentElement.classList.toggle('dark', nextIsDark);
        localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
        setThemeColorMeta(nextIsDark);
        setIsDarkMode(nextIsDark);
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
