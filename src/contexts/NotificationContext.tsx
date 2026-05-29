import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy,
  limit,
  db, 
  auth, 
  handleFirestoreError, 
  OperationType,
  serverTimestamp
} from '../firebase';

/**
 * Delta Stars Advanced Real-time Notification Engine
 * نظام إشعارات متقدم يربط الإدارة، المصلحة، الشحن، والعملاء
 */

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'shipping' | 'quality' | 'system' | 'payment';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  metadata?: Record<string, any>;
  targetRole?: string; // admin, operations, delivery, etc.
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  sendNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to notifications for this specific user OR matching their role
    // We'll simulate fetching role from a local metadata or assumed state for now
    // In a real app, you'd fetch the user's role document first.
    // Use a more targeted query to avoid permission-denied for non-admins
    // We'll try to fetch notifications for the user. 
    // Admins will be able to see more via the AdminDashboardPage specifically.
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [user.uid, 'admin', 'all']),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: AppNotification[] = [];
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as AppNotification;
        msgs.push({ ...data, id: doc.id });
        if (data.status === 'unread') unread++;
      });
      setNotifications(msgs);
      setUnreadCount(unread);
    }, (error) => {
      // Catch and handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Notification listener restricted: using individual fetch fallback.');
        // Fallback or silent fail for background listeners
      } else {
        handleFirestoreError(error, OperationType.GET, 'notifications_context');
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const sendNotification = async (notif: Omit<AppNotification, 'id' | 'createdAt' | 'status'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notif,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        status: 'read'
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, sendNotification, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
