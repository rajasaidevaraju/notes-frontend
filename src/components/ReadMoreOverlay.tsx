import React from 'react';
import styles from './ItemCard.module.css';

interface ReadMoreOverlayProps {
  label: string;
  onClick: () => void;
}

/**
 * Fade over the bottom of a truncated card body with a "read more" pill.
 * Place it inside a .bodyAnchor, which it positions against.
 */
const ReadMoreOverlay: React.FC<ReadMoreOverlayProps> = ({ label, onClick }) => (
  <button
    type="button"
    className={styles.fadeOverlay}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <span className={styles.moreIndicator}>{label}</span>
  </button>
);

export default ReadMoreOverlay;
