import React from 'react';
import styles from '@/Home.module.css';
import { useNotificationStore } from '@/store/notificationStore';
import {
  useLanStatusQuery,
  useEnableLanMutation,
  useDisableLanMutation,
} from '@/hooks/useContentQuery';

const LanSharingControl: React.FC = () => {
  const { data: status } = useLanStatusQuery();
  const enableMutation = useEnableLanMutation();
  const disableMutation = useDisableLanMutation();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const loading = enableMutation.isPending || disableMutation.isPending;

  const handleEnable = async () => {
    try {
      await enableMutation.mutateAsync();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'A network error occurred.';
      addNotification(msg, 'error');
    }
  };

  const handleDisable = async () => {
    try {
      await disableMutation.mutateAsync();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'A network error occurred.';
      addNotification(msg, 'error');
    }
  };

  if (!status) return null;

  return (
    <div className={styles.lanControlContainer}>
      {status.enabled ? (
        <>
          <span className={styles.serverIpText}>
            LAN Active: <strong> ({Math.ceil(status.remainingMs / 60000)}m) </strong>
          </span>
          {status.canManage && (
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                onClick={handleEnable}
                className={`${styles.button} ${styles.successButton}`}
                disabled={loading}
              >
                Reset
              </button>
              <button
                onClick={handleDisable}
                className={`${styles.button} ${styles.dangerButton}`}
                disabled={loading}
              >
                Disable
              </button>
            </div>
          )}
        </>
      ) : (
        status.canManage && (
          <button
            onClick={handleEnable}
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={loading}
            title="Share on LAN (15m)"
            aria-label="Share on LAN (15 minutes)"
          >
            <svg
              className={`${styles.icon} ${styles.mobileOnlyIcon}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
              <path d="m21 3-9 9" />
              <path d="M15 3h6v6" />
            </svg>
            <span className={styles.desktopOnlyLabel}>Share on LAN (15m)</span>
          </button>
        )
      )}
    </div>
  );
};

export default LanSharingControl;
