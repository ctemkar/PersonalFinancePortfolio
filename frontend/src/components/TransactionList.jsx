import React from "react";

export default function TransactionList({ transactions, personName, total, currency, onClose }) {
  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };

  return (
    <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{personName.toUpperCase()} HISTORY</h3>
          <div style={{ marginTop: '12px', padding: '15px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe' }}>
            <span style={{ fontWeight: 'bold', color: '#1e40af' }}>TOTAL OUTSTANDING (TOP): </span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af' }}>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</span>
          </div>
        </div>
        <div className="no-print">
          <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}>Print PDF</button>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Full Name</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{new Date(t.norm_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td style={tdStyle}>
                <span style={{ 
                  padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                  backgroundColor: t.source === 'Wise' ? '#e0f2fe' : '#fef2f2',
                  color: t.source === 'Wise' ? '#0369a1' : '#dc2626'
                }}>{t.source}</span>
              </td>
              <td style={tdStyle}><strong>{t.norm_name}</strong></td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                {Number(t.norm_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f8fafc', fontWeight: '900' }}>
            <td colSpan="3" style={{ ...tdStyle, textAlign: 'right', fontSize: '14px' }}>TOTAL OUTSTANDING (BOTTOM):</td>
            <td style={{ ...tdStyle, textAlign: 'right', color: '#2563eb', fontSize: '16px' }}>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}