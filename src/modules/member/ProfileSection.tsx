'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateMyProfileApi, updateMyAvatarApi, changeMyPasswordApi } from '@/lib/api';
import { resolveImageUrl } from '@/utils/mappers';
import Toast from '@/components/ui/Toast';

export default function ProfileSection() {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (!user) return null;
  const initial = (user.full_name || user.username || '?').trim().charAt(0).toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await updateMyAvatarApi(file);
      await refreshProfile();
      showToast('Đã đổi ảnh đại diện', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải ảnh lên', 'error');
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.full_name.trim() || !profileForm.email.trim()) {
      showToast('Vui lòng nhập đầy đủ họ tên và email', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateMyProfileApi({ full_name: profileForm.full_name, email: profileForm.email });
      await refreshProfile();
      showToast('Đã lưu thông tin hồ sơ', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu hồ sơ', 'error');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }
    setSavingPwd(true);
    try {
      await changeMyPasswordApi(pwdForm.current_password, pwdForm.new_password, pwdForm.confirm_password);
      showToast('Đã đổi mật khẩu thành công', 'success');
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPwdError(err.message || 'Lỗi khi đổi mật khẩu');
    }
    setSavingPwd(false);
  };

  return (
    <div className="profile-section">
      <div className="glass-panel profile-card">
        <h3 className="profile-card-title">Ảnh đại diện</h3>
        <div className="profile-avatar-row">
          <span className="profile-avatar-preview">
            {user.avatar ? <img src={resolveImageUrl(user.avatar)} alt={initial} /> : initial}
          </span>
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel profile-card">
        <h3 className="profile-card-title">Thông tin cá nhân</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input className="form-control" value={user.username} disabled />
          </div>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              className="form-control"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </button>
        </form>
      </div>

      <div className="glass-panel profile-card">
        <h3 className="profile-card-title">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input
              type="password"
              className="form-control"
              value={pwdForm.current_password}
              onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
              value={pwdForm.new_password}
              onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={pwdForm.confirm_password}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
            />
          </div>
          {pwdError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '12px' }}>{pwdError}</p>}
          <button type="submit" className="btn btn-primary" disabled={savingPwd}>
            {savingPwd ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
          </button>
        </form>
      </div>

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
