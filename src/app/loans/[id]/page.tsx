'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getLoanByIdApi } from '@/lib/api';
import { resolveImageUrl } from '@/utils/mappers';
import { ArrowLeftIcon } from '@/components/ui/icons';
import Badge from '@/components/ui/Badge';

const LOAN_STATUS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'info' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  COMPLETED: { label: 'Đã hoàn tất', variant: 'muted' },
  OVERDUE: { label: 'QUÁ HẠN', variant: 'danger' },
  CANCELLED: { label: 'Đã huỷ', variant: 'muted' },
};

const DETAIL_STATUS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xử lý', variant: 'info' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  OVERDUE: { label: 'Quá hạn', variant: 'danger' },
  RETURNED: { label: 'Đã trả', variant: 'muted' },
  CANCELLED: { label: 'Đã huỷ', variant: 'muted' },
};

const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n: number) => n > 0 ? n.toLocaleString('vi-VN') + 'đ' : '0đ';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getLoanByIdApi(id);
        setLoan(data);
      } catch (e: any) {
        setError(e.message || 'Không tải được phiếu mượn');
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--error)' }}>{error || 'Không tìm thấy phiếu mượn'}</p>
        <button onClick={() => router.back()} className="btn btn-secondary">Quay lại</button>
      </div>
    );
  }

  const books = loan.books || [];
  const totalQty = books.reduce((s: number, b: any) => s + (b.quantity || 0), 0);
  const returnedQty = books.reduce((s: number, b: any) => s + (b.returned_quantity || 0), 0);
  const lostQty = books.reduce((s: number, b: any) => s + (b.lost_quantity || 0), 0);
  const remainingQty = books.reduce((s: number, b: any) => s + (b.remaining_quantity || 0), 0);
  const progressPct = totalQty > 0 ? Math.round(((returnedQty + lostQty) / totalQty) * 100) : 0;

  const status = LOAN_STATUS[loan.status] || { label: loan.status, variant: 'muted' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: 20 }}
        >
          <ArrowLeftIcon /> Quay lại danh sách
        </button>

        <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Phiếu Mượn #{loan.id}</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Độc giả: <strong style={{ color: 'var(--text-primary)' }}>{loan.borrower?.full_name}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{loan.borrower?.email}</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Thông tin thời gian */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Ngày mượn</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fmtDate(loan.loan_date)}</div>
            </div>
            {loan.cancelled_reason && (
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.06)', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--error)', textTransform: 'uppercase', marginBottom: 4 }}>Lý do huỷ</div>
                <div style={{ fontSize: '0.875rem' }}>{loan.cancelled_reason}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tiến độ trả sách */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, margin: 0 }}>Tiến Độ Trả Sách</h2>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
            {[
              { label: 'Tổng mượn', value: totalQty, color: 'var(--primary)' },
              { label: 'Đã trả', value: returnedQty, color: 'var(--success)' },
              { label: 'Mất', value: lostQty, color: 'var(--error)' },
              { label: 'Còn lại', value: remainingQty, color: 'var(--warning)' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Thanh tiến độ */}
          <div style={{ marginTop: 16, height: 10, borderRadius: 5, background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
            {returnedQty > 0 && (
              <div style={{ width: `${(returnedQty / totalQty) * 100}%`, background: 'var(--success)', transition: 'width 0.5s ease' }} />
            )}
            {lostQty > 0 && (
              <div style={{ width: `${(lostQty / totalQty) * 100}%`, background: 'var(--error)', transition: 'width 0.5s ease' }} />
            )}
          </div>
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{progressPct}% hoàn tất</p>
        </div>

        {/* Chi tiết từng đầu sách */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>Chi Tiết Từng Đầu Sách ({books.length})</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {books.map((bk: any) => {
              const ds = DETAIL_STATUS[bk.status] || { label: bk.status, variant: 'muted' };
              const returned = bk.returned_quantity || 0;
              const lost = bk.lost_quantity || 0;
              const remaining = bk.remaining_quantity || (bk.quantity - returned - lost);
              const imgUrl = resolveImageUrl(bk.image_url);

              return (
                <div key={bk.loan_detail_id} style={{
                  display: 'flex', gap: 16, padding: 16, borderRadius: 12,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                }}>
                  {/* Ảnh bìa */}
                  <div style={{
                    width: 80, height: 110, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={bk.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Thông tin sách */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{bk.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{bk.author}</div>
                      </div>
                      <Badge variant={ds.variant}>{ds.label}</Badge>
                    </div>

                    {/* Số lượng chi tiết */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Mượn: </span>
                        <span style={{ fontWeight: 700 }}>{bk.quantity}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Đã trả: </span>
                        <span style={{ fontWeight: 700, color: returned > 0 ? 'var(--success)' : 'var(--text-muted)' }}>{returned}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Mất: </span>
                        <span style={{ fontWeight: 700, color: lost > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{lost}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Còn: </span>
                        <span style={{ fontWeight: 700, color: remaining > 0 ? 'var(--warning)' : 'var(--success)' }}>{remaining}</span>
                      </div>
                    </div>

                    {/* Hạn trả + tiền */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Hạn trả: </span>
                        <span style={{ fontWeight: 600 }}>{fmtDate(bk.due_date)}</span>
                      </div>
                      {bk.completed_at && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Ngày hoàn tất: </span>
                          <span style={{ fontWeight: 600 }}>{fmtDate(bk.completed_at)}</span>
                        </div>
                      )}
                    </div>

                    {/* Thanh tiến độ riêng cho đầu sách này */}
                    {bk.quantity > 0 && (
                      <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
                        {returned > 0 && <div style={{ width: `${(returned / bk.quantity) * 100}%`, background: 'var(--success)' }} />}
                        {lost > 0 && <div style={{ width: `${(lost / bk.quantity) * 100}%`, background: 'var(--error)' }} />}
                      </div>
                    )}

                    {/* Lịch sử trả (nếu có) */}
                    {bk.returned_histories && bk.returned_histories.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>LỊCH SỬ TRẢ</div>
                        {bk.returned_histories.map((h: any, i: number) => (
                          <div key={h.id || i} style={{
                            display: 'flex', gap: 12, padding: '6px 0',
                            borderBottom: i < bk.returned_histories.length - 1 ? '1px solid var(--border)' : 'none',
                            fontSize: '0.8rem',
                          }}>
                            <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>{fmtDate(h.return_date)}</span>
                            <span style={{ color: 'var(--success)' }}>Trả {h.return_quantity}</span>
                            {h.lost_quantity > 0 && <span style={{ color: 'var(--error)' }}>Mất {h.lost_quantity}</span>}
                            {h.late_days > 0 && <span style={{ color: 'var(--warning)' }}>Trễ {h.late_days} ngày</span>}
                            {h.fine_amount > 0 && <span style={{ color: 'var(--error)' }}>Phạt {fmtMoney(h.fine_amount)}</span>}
                            {h.note && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{h.note}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chi phí */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: '0.75rem', flexWrap: 'wrap', color: 'var(--text-muted)' }}>
                      {bk.deposit_amount > 0 && <span>Cọc: {fmtMoney(bk.deposit_amount)}</span>}
                      {bk.rental_fee > 0 && <span>Thuê: {fmtMoney(bk.rental_fee)}</span>}
                      {bk.fine_amount > 0 && <span style={{ color: 'var(--error)' }}>Phạt: {fmtMoney(bk.fine_amount)}</span>}
                      {bk.lost_fee > 0 && <span style={{ color: 'var(--error)' }}>Đền sách: {fmtMoney(bk.lost_fee)}</span>}
                      {bk.deposit_refund_amount > 0 && <span style={{ color: 'var(--success)' }}>Hoàn cọc: {fmtMoney(bk.deposit_refund_amount)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng thanh toán */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>Thanh Toán</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 24px', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tổng tiền cọc</span>
            <span style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(loan.total_deposit || 0)}</span>

            <span style={{ color: 'var(--text-muted)' }}>Tổng phí thuê</span>
            <span style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(loan.total_rental_fee || 0)}</span>

            <span style={{ color: 'var(--text-muted)' }}>Thanh toán ban đầu</span>
            <span style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{fmtMoney(loan.total_initial_payment || 0)}</span>

            {(loan.total_fine || 0) > 0 && (
              <>
                <span style={{ color: 'var(--error)' }}>Tiền phạt trễ</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--error)' }}>{fmtMoney(loan.total_fine)}</span>
              </>
            )}
            {(loan.total_lost_fee || 0) > 0 && (
              <>
                <span style={{ color: 'var(--error)' }}>Phí đền sách mất</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--error)' }}>{fmtMoney(loan.total_lost_fee)}</span>
              </>
            )}
            {(loan.total_deposit_refund || 0) > 0 && (
              <>
                <span style={{ color: 'var(--success)' }}>Hoàn cọc</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>{fmtMoney(loan.total_deposit_refund)}</span>
              </>
            )}
            {(loan.total_extra_payment || 0) > 0 && (
              <>
                <span style={{ color: 'var(--warning)' }}>Thu thêm</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--warning)' }}>{fmtMoney(loan.total_extra_payment)}</span>
              </>
            )}

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <span style={{ fontWeight: 700 }}>Tổng cộng</span>
            <span style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              {fmtMoney(loan.total_amount || 0)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}