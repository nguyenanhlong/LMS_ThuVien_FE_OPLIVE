'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyNotificationsApi, markNotificationsReadApi, getRolePermissionsByRoleApi, getCachedPermSignature, setCachedPermSignature, clearCachedPermSignature } from '@/lib/api';

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

export default function NotificationBell({ userRole }: { userRole?: string }) {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const permSignatureRef = useRef('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getMyNotificationsApi();
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  }, []);

  const checkPermissionChange = useCallback(async (role: string) => {
    try {
      const data = await getRolePermissionsByRoleApi(role);
      const perms = (Array.isArray(data) ? data : []).map((p: any) => p.permission).sort();
      const signature = JSON.stringify(perms);
      if (permSignatureRef.current && signature !== permSignatureRef.current) {
        setPermissionsChanged(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!userRole) return;

    const cached = getCachedPermSignature(userRole);
    if (cached) {
      permSignatureRef.current = cached;
    }

    getRolePermissionsByRoleApi(userRole).then(data => {
      const perms = (Array.isArray(data) ? data : []).map((p: any) => p.permission).sort();
      const serverSig = JSON.stringify(perms);

      if (!cached) {
        permSignatureRef.current = serverSig;
        setCachedPermSignature(userRole, serverSig);
      } else if (serverSig !== cached) {
        setPermissionsChanged(true);
      }
    }).catch(() => {});
  }, [userRole]);

  useEffect(() => {
    if (!userRole) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
      checkPermissionChange(userRole);
    }, 30000);
    const onFocus = () => {
      fetchNotifications();
      checkPermissionChange(userRole);
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchNotifications, checkPermissionChange, userRole]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = useCallback(() => {
    if (userRole) clearCachedPermSignature(userRole);
    logout();
  }, [userRole, logout]);

  useEffect(() => {
    if (!permissionsChanged) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(120);
      return;
    }
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [permissionsChanged, handleLogout]);

  useEffect(() => {
    if (permissionsChanged && countdown <= 0) {
      handleLogout();
    }
  }, [countdown, permissionsChanged, handleLogout]);

  const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

  const markRead = async (ids: number[]) => {
    if (!ids.length) return;
    try {
      await markNotificationsReadApi(ids);
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="notif-bell" ref={wrapperRef}>
      <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Thông báo">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {permissionsChanged ? (
          <span className="notif-bell-badge" style={{ background: 'var(--warning)' }}>!</span>
        ) : unreadIds.length > 0 && (
          <span className="notif-bell-badge">{unreadIds.length}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Thông báo</span>
            {unreadIds.length > 0 && (
              <button className="notif-mark-all" onClick={() => markRead(unreadIds)}>Đánh dấu đã đọc tất cả</button>
            )}
          </div>

          {permissionsChanged && (
            <div className="notif-item" style={{ padding: '12px 16px', background: '#fef3c7', borderLeft: '3px solid var(--warning)' }}>
              <span className="notif-item-title" style={{ color: 'var(--warning)' }}>
                Quyền đã được cập nhật
              </span>
              <span className="notif-item-message">
                Quyền của bạn đã thay đổi. Vui lòng đăng xuất và đăng nhập lại để áp dụng.
              </span>
              <span className="notif-item-time" style={{ color: 'var(--warning)' }}>
                Tự động đăng xuất sau {formatCountdown(countdown)}
              </span>
              <button
                className="btn btn-primary"
                style={{ marginTop: 8, padding: '4px 12px', fontSize: '0.8125rem', width: '100%' }}
                onClick={handleLogout}
              >
                Đăng xuất ngay
              </button>
            </div>
          )}

          {!notifications.length && !permissionsChanged ? (
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
