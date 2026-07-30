'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ch\u1edd x\u00e1c nh\u1eadn',
  PENDING_PAYMENT: 'Ch\u1edd thanh to\u00e1n',
  BORROWING: '\u0110ang m\u01b0\u1ee3n',
  COMPLETED: '\u0110\u00e3 ho\u00e0n t\u1ea5t',
  CANCELLED: '\u0110\u00e3 h\u1ee7y',
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
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>{'Th\u1ed1ng K\u00ea Tr\u1ea1ng Th\u00e1i Phi\u1ebfu M\u01b0\u1ee3n'}</h3>
        <div className="empty-state">{'Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u'}</div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>{'Th\u1ed1ng K\u00ea Tr\u1ea1ng Th\u00e1i Phi\u1ebfu M\u01b0\u1ee3n'}</h3>
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