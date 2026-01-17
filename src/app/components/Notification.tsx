'use client';

import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import styles from './Notification.module.css';

const Notification: React.FC = () => {
    const { notifications, removeNotification } = useNotificationStore();

    if (notifications.length === 0) return null;

    return (
        <div className={styles.notificationContainer}>
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`${styles.notification} ${styles[n.type]}`}
                    role="alert"
                >
                    <span className={styles.message}>{n.message}</span>
                    <button
                        onClick={() => removeNotification(n.id)}
                        className={styles.closeBtn}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notification;
