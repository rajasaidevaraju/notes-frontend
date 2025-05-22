import React from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage'; // Assuming ErrorMessage is available

interface ClipboardNoteItemProps {
  content: string | null;
  onPaste: () => Promise<void>;
  itemError: string | null;
}

const ClipboardNoteItem: React.FC<ClipboardNoteItemProps> = ({ content, onPaste, itemError }) => {
  return (
    <div className={`${styles.noteItem} ${styles.clipboardNote}`}>
      {itemError && <ErrorMessage message={itemError} />}
      <div className={styles.noteHeader}>
        <h3 className={styles.noteTitle}>Clipboard Content</h3>
        <div className={styles.buttonGroup}>
          <button
            onClick={onPaste}
            className={`${styles.button} ${styles.primaryButton}`}
            title="Paste from Clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Paste
          </button>
        </div>
      </div>
      <p className={styles.noteContent}>
        {content ? content : 'Click "Paste" to get content from your clipboard.'}
      </p>
    </div>
  );
};

export default ClipboardNoteItem;
