import React from "react";

export default function TransactionList({ transactions, personName, total, currency, onClose }) {
  const handlePrint = () => window.print();

  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };

  return (
    <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{personName.toUpperCase()} FAMILY REPORT</h3>
          <div style={{ marginTop: '10px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
            <span style={{ color: '#1e40af', fontWeight: 'bold' }}>TOTAL OUTSTANDING (TOP): </span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e40af' }}>
              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>
        </div>
        
        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print/PDF</button>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Source / Name</th>
            <th style={thStyle}>Reference ID</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{new Date(t["Created on"]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td style={tdStyle}><strong>{t["Target name"] || "Unknown"}</strong></td>
              <td style={{ ...tdStyle, color: '#94a3b8', fontSize: '11px' }}>{t.ID}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                {Number(t["Target amount (after fees)"]).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        {/* FOOTER TOTAL */}
        <tfoot>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td colSpan="3" style={{ ...tdStyle, fontWeight: '800', textAlign: 'right' }}>TOTAL OUTSTANDING (BOTTOM):</td>
            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '800', color: '#2563eb', fontSize: '16px' }}>
              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
      
      <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '20px' }} className="print-only">
        Generated on {new Date().toLocaleString()}
      </p>
    </div>
  );
}