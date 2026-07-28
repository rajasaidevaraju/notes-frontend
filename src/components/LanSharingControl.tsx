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
    const isReset = status?.enabled;
    try {
      await enableMutation.mutateAsync();
      addNotification(isReset ? 'LAN Timer Reset to 15m' : 'LAN Sharing Enabled', 'success');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'A network error occurred.';
      addNotification(msg, 'error');
    }
  };

  const handleDisable = async () => {
    try {
      await disableMutation.mutateAsync();
      addNotification('LAN Sharing Disabled', 'info');
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
          >
            Share on LAN (15m)
          </button>
        )
      )}
    </div>
  );
};

export default LanSharingControl;
