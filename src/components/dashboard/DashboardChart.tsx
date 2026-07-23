'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PENDING_PAYMENT: 'Chờ thanh toán',
  BORROWING: 'Đang mượn',
  COMPLETED: 'Đã hoàn tất',
  CANCELLED: 'Đã hủy',
};

const STATUS_FILLS: Record<string, string> = {
  PENDING: '#f59e0b',
  PENDING_PAYMENT: '#f97316',
  BORROWING: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#6b7280',
};

export default function DashboardChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
    fill: STATUS_FILLS[d.status] || '#6366f1',
  }));

  if (chartData.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Thống Kê Trạng Thái Phiếu Mượn</h3>
        <div className="empty-state">Chưa có dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Thống Kê Trạng Thái Phiếu Mượn</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1b2437', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.875rem' }}
            labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}