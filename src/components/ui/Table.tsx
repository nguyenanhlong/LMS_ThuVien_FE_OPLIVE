'use client';

export default function Table({ columns, data, loading, emptyText = 'Không có dữ liệu' }: any) {
  if (loading) {
    return <div className="empty-state">Đang tải...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={row.id ?? i}>
              {columns.map((col: any) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
