'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getDashboardTimelineApi } from '@/lib/api';

const GROUP_OPTIONS = [
  { value: 'DAY', label: 'Ng\u00e0y' },
  { value: 'WEEK', label: 'Tu\u1ea7n' },
  { value: 'MONTH', label: 'Th\u00e1ng' },
  { value: 'QUARTER', label: 'Qu\u00fd' },
  { value: 'YEAR', label: 'N\u0103m' },
];

const METRIC_OPTIONS = [
  { value: 'loan_count', label: 'S\u1ed1 phi\u1ebfu m\u01b0\u1ee3n', color: '#3b82f6' },
  { value: 'total_revenue', label: 'Doanh thu', color: '#10b981' },
  { value: 'new_users', label: 'Th\u00e0nh vi\u00ean m\u1edbi', color: '#8b5cf6' },
  { value: 'rental_revenue', label: 'Ph\u00ed thu\u00ea', color: '#06b6d4' },
  { value: 'fine_revenue', label: 'Ti\u1ec1n ph\u1ea1t', color: '#f59e0b' },
  { value: 'lost_book_revenue', label: 'B\u1ed3i th\u01b0\u1eddng', color: '#ef4444' },
  { value: 'cumulative_users', label: 'T\u1ed5ng th\u00e0nh vi\u00ean', color: '#6366f1' },
];

function getDefaultDates() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function DashboardTimeline() {
  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [groupBy, setGroupBy] = useState('MONTH');
  const [metrics, setMetrics] = useState<string[]>(['loan_count', 'total_revenue']);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const res = await getDashboardTimelineApi({ from_date: fromDate, to_date: toDate, group_by: groupBy });
      setData(res || []);
    } catch (e: any) { if (!(e?.message || '').includes('không có quyền')) console.error('Timeline:', e); setData([]); }
    setLoading(false);
  }, [fromDate, toDate, groupBy]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  const toggleMetric = (m: string) => {
    setMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const isCurrency = (m: string) => ['total_revenue', 'rental_revenue', 'fine_revenue', 'lost_book_revenue'].includes(m);

  return (
    <div className="glass-panel" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
        {'Bi\u1ec3u \u0110\u1ed3 Th\u1ed1ng K\u00ea Theo Th\u1eddi Gian'}
      </h3>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{'T\u1eeb ng\u00e0y'}</label>
          <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: 150 }} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{'T\u1edbi ng\u00e0y'}</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: 150 }} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{'Nh\u00f3m theo'}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {GROUP_OPTIONS.map((g) => (
              <button
                key={g.value}
                className={`category-pill ${groupBy === g.value ? 'active' : ''}`}
                onClick={() => setGroupBy(g.value)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric toggles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {METRIC_OPTIONS.map((m) => (
          <button
            key={m.value}
            onClick={() => toggleMetric(m.value)}
            style={{
              padding: '4px 12px', fontSize: '0.75rem', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: metrics.includes(m.value) ? m.color : 'var(--bg-tertiary)',
              color: metrics.includes(m.value) ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>{'\u0110ang t\u1ea3i...'}</p>
      ) : data.length === 0 ? (
        <div className="empty-state" style={{ padding: 40 }}>{'Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u trong kho\u1ea3ng th\u1eddi gian n\u00e0y'}</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={70}
              tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)}
              />
            <Tooltip
                contentStyle={{ background: '#1b2437', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
                formatter={(value: any, name: any) => {
                const val = Number(value || 0);
                const metricName = String(name || '');
                const m = METRIC_OPTIONS.find(o => o.value === metricName);
    
            return [
            isCurrency(metricName) ? fmtCurrency(val) : val, 
             m?.label || metricName
             ];
        }}
        />
            <Legend
              formatter={(value: string) => METRIC_OPTIONS.find(o => o.value === value)?.label || value}
              wrapperStyle={{ fontSize: '0.75rem' }}
            />
            {METRIC_OPTIONS.filter(m => metrics.includes(m.value)).map((m) => (
              <Line
                key={m.value}
                type="monotone"
                dataKey={m.value}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}