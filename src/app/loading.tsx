import styles from '@/Home.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}