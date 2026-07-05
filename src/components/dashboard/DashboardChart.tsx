'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardChart({ availableBooks, borrowedBooks, totalMembers, pendingLoans }: {
  availableBooks: number;
  borrowedBooks: number;
  totalMembers: number;
  pendingLoans: number;
}) {
  const data = [
    { name: 'Sách có sẵn', value: availableBooks, fill: '#10b981' },
    { name: 'Đang mượn', value: borrowedBooks, fill: '#ef4444' },
    { name: 'Độc giả', value: totalMembers, fill: '#6366f1' },
    { name: 'Chờ xác nhận', value: pendingLoans, fill: '#f59e0b' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Biểu Đồ Thống Kê</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
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
