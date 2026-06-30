'use client';

export default function Input({ label, id, ...props }: any) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className="form-control" {...props} />
    </div>
  );
}
