import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string; // question or answer id
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    type: 'answer',
    title: 'New Answer',
    message: 'john_doe answered your question about React authentication',
    isRead: false,
    createdAt: new Date('2024-01-21'),
    relatedId: '1'
  },
  {
    id: '2',
    userId: '1',
    type: 'mention',
    title: 'You were mentioned',
    message: 'jane_smith mentioned you in a comment',
    isRead: false,
    createdAt: new Date('2024-01-20'),
    relatedId: '2'
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { user } = useAuth();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => 
      n.userId === user?.id ? { ...n, isRead: true } : n
    ));
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const value = {
    notifications: userNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};