'use client';

import { useState, useEffect } from 'react';

function formatMoney(n: number | string): string {
  const num = Number(n || 0);
  return num.toLocaleString('vi-VN');
}

export default function MoneyInput({ label, id, value, onChange, placeholder, ...props }: any) {
  const [text, setText] = useState(() => formatMoney(value));

  useEffect(() => {
    setText(formatMoney(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = raw ? Number(raw) : 0;
    setText(formatMoney(num));
    onChange?.(num);
  };

  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          inputMode="numeric"
          className="form-control"
          style={{ paddingRight: 34 }}
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          {...props}
        />
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            pointerEvents: 'none',
          }}
        >
          đ
        </span>
      </div>
    </div>
  );
}
