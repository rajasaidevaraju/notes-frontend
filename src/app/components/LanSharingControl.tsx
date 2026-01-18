'use client';
import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import { useNotificationStore } from '../store/notificationStore';

interface LanStatus {
    enabled: boolean;
    remainingMs: number;
}

const LanSharingControl: React.FC = () => {
    const [status, setStatus] = useState<LanStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const addNotification = useNotificationStore((state) => state.addNotification);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/system/lan/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (error) {
            console.error("Failed to fetch LAN status", error);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);



    const handleEnable = async () => {
        const isReset = status?.enabled;
        setLoading(true);
        try {
            const res = await fetch('/api/system/lan/enable', { method: 'POST' });
            if (res.ok) {
                await fetchStatus();
                addNotification(isReset ? 'LAN Timer Reset to 15m' : 'LAN Sharing Enabled', 'success');
            } else {
                const errorData = await res.json().catch(() => ({}));
                addNotification(errorData.error || 'Failed to enable: Access denied or server error', 'error');
            }
        } catch (error) {
            console.error("Enable failed", error);
            addNotification('A network error occurred while trying to enable LAN sharing.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/lan/disable', { method: 'POST' });
            if (res.ok) {
                await fetchStatus();
                addNotification('LAN Sharing Disabled', 'info');
            } else {
                const errorData = await res.json().catch(() => ({}));
                addNotification(errorData.error || 'Failed to disable: Access denied or server error', 'error');
            }
        } catch (error) {
            console.error("Disable failed", error);
            addNotification('A network error occurred while trying to disable LAN sharing.', 'error');
        } finally {
            setLoading(false);
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
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                            onClick={handleEnable}
                            className={`${styles.button} ${styles.successButton}`}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            disabled={loading}
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleDisable}
                            className={`${styles.button} ${styles.dangerButton}`}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            disabled={loading}
                        >
                            Disable
                        </button>
                    </div>
                </>
            ) : (
                <button
                    onClick={handleEnable}
                    className={`${styles.button} ${styles.primaryButton}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                    disabled={loading}
                >
                    Share on LAN (15m)
                </button>
            )}
        </div>
    );
};

export default LanSharingControl;
