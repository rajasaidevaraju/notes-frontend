import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (message: string, type: NotificationType) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (message, type) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }],
        }));

        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 3000);
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}));
