import React from 'react';
import styles from './SearchBar.module.css';
import { useContentStore } from '../store/contentStore';

const SearchBar: React.FC = () => {
    const { searchQuery, setSearchQuery } = useContentStore();

    return (
        <div className={styles.searchContainer}>
            <svg
                className={styles.searchIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
            />
        </div>
    );
};

export default SearchBar;
