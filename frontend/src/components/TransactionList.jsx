import React from 'react';

const TransactionList = ({ isOpen, group, onClose }) => {
  if (!isOpen || !group) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* HEADER: Total at Top */}
        <div style={{ padding: '30px', backgroundColor: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>{group.name}</h2>
            <div style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7 }}>CONSOLIDATED HISTORY</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.7 }}>TOTAL OUTSTANDING</div>
            <div style={{ fontSize: '28px', fontWeight: '900' }}>{group.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* LIST */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#999' }}>
                <th style={{ padding: '10px 0' }}>DATE</th>
                <th style={{ padding: '10px 0' }}>SOURCE</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '12px 0', color: '#666' }}>{item.date}</td>
                  <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{item.bank_source}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '900', fontFamily: 'monospace' }}>
                    {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER: Total at Bottom */}
        <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{ backgroundColor: '#111', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CLOSE</button>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', marginRight: '10px' }}>SUMMARY TOTAL:</span>
            <span style={{ fontWeight: '900', fontSize: '22px' }}>{group.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionList;