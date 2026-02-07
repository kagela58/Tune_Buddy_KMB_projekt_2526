import { useState, useEffect, useRef, useCallback } from 'react';

export interface UnreadMessage {
  matchId: number;
  matchName: string;
  matchImage: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export function useNotifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const loadUnreadMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadMessages(data);
      }
    } catch (err) {
      console.error('Error loading unread messages', err);
    }
  }, []);

  const totalUnread = unreadMessages.reduce((sum, m) => sum + m.unreadCount, 0);

  // Poll for new messages
  useEffect(() => {
    loadUnreadMessages();
    const interval = setInterval(loadUnreadMessages, 5000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUnreadMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUnreadMessages]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    showNotifications,
    setShowNotifications,
    unreadMessages,
    totalUnread,
    notificationRef,
    loadUnreadMessages
  };
}
