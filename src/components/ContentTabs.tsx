import React from 'react';
import styles from './ContentTabs.module.css';
import { useContentStore, ContentTab } from '@/store/contentStore';
import { useHiddenContentQuery } from '@/hooks/useContentQuery';

interface ContentTabsProps {
  onUnlockRequest: (targetTab: ContentTab) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ onUnlockRequest }) => {
  const { activeTab, setActiveTab, hiddenUnlocked } = useContentStore();
  const { data: hiddenData = [] } = useHiddenContentQuery(hiddenUnlocked);

  const hiddenCount = hiddenUnlocked ? hiddenData.length : 0;

  const handleTabClick = (tab: ContentTab) => {
    if (tab === 'all') {
      setActiveTab('all');
      return;
    }

    if (!hiddenUnlocked) {
      onUnlockRequest(tab);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className={styles.tabsContainer} role="tablist" aria-label="Notes view switcher">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'all'}
        className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
        onClick={() => handleTabClick('all')}
        title="View regular non-hidden notes"
      >
        <svg
          className={styles.tabIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <span>All Notes</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'hidden'}
        className={`${styles.tabButton} ${activeTab === 'hidden' ? styles.activeTab : ''}`}
        onClick={() => handleTabClick('hidden')}
        title={hiddenUnlocked ? 'View hidden notes' : 'Unlock and view hidden notes'}
      >
        {hiddenUnlocked ? (
          <svg
            className={styles.tabIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            className={styles.tabIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
        <span>Hidden</span>
        {hiddenUnlocked ? (
          <span className={styles.badge}>{hiddenCount}</span>
        ) : (
          <>

          </>
        )}
      </button>
    </div>
  );
};

export default ContentTabs;
