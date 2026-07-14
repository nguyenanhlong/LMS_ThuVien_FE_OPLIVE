'use client';

import { useEffect, useRef, useState } from 'react';
import { graphqlQuery } from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function NotificationBell({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await graphqlQuery<any>(`
        query GetNotifications($userId: ID!) {
          notificationsByUser(userId: $userId) {
            id
            title
            message
            is_read
            created_at
          }
        }
      `, { userId: String(userId) });
      setNotifications(data.notificationsByUser || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

  const markRead = async (ids: number[]) => {
    if (!ids.length) return;
    try {
      await graphqlQuery(`
        mutation MarkRead($ids: [ID!]!) {
          markNotificationsAsRead(ids: $ids) {
            message
            ids
          }
        }
      `, { ids: ids.map(String) });
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="notif-bell" ref={wrapperRef}>
      <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Thông báo">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadIds.length > 0 && <span className="notif-bell-badge">{unreadIds.length}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Thông báo</span>
            {unreadIds.length > 0 && (
              <button className="notif-mark-all" onClick={() => markRead(unreadIds)}>Đánh dấu đã đọc tất cả</button>
            )}
          </div>

          {!notifications.length ? (
            <p className="notif-empty">Không có thông báo nào</p>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={`notif-item ${n.is_read ? '' : 'unread'}`}
                  onClick={() => !n.is_read && markRead([n.id])}
                >
                  <span className="notif-item-title">{n.title}</span>
                  <span className="notif-item-message">{n.message}</span>
                  <span className="notif-item-time">{timeAgo(n.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
