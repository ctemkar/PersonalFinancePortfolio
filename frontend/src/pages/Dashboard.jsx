import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [selectedPerson, setSelectedPerson] = useState(null);

  // 1. Fetch Summary from loans_dashboard
  const { data: rawLoans, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['loans-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans_dashboard')
        .select('breakdown_label, breakdown_value, currency, report_name');
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch Raw Details from wise_raw
  const { data: wiseTransactions, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['wise-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wise_raw')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // --- NORMALIZATION LOGIC ---
  // Matches "Mom Pheiyb" and "pheiyb mom" by sorting name parts
  const getNormalizedName = (name) => {
    if (!name) return "";
    return name.toLowerCase().trim().split(/\s+/).sort().join(' ');
  };

  // --- AGGREGATION (Main Dashboard View) ---
  const aggregatedData = (rawLoans || []).reduce((acc, current) => {
    const normName = getNormalizedName(current.breakdown_label);
    const key = `${normName}-${current.currency}`;
    if (!acc[key]) {
      acc[key] = { ...current, breakdown_value: 0, transaction_count: 0 };
    }
    acc[key].breakdown_value += Number(current.breakdown_value || 0);
    acc[key].transaction_count += 1;
    return acc;
  }, {});

  const sortedLoans = Object.values(aggregatedData).sort((a, b) => b.breakdown_value - a.breakdown_value);
  const inrLoans = sortedLoans.filter(l => l.currency === "INR");
  const thbLoans = sortedLoans.filter(l => l.currency === "THB");

  // --- DRILL DOWN FILTER ---
  const drillDownData = selectedPerson 
    ? (wiseTransactions || []).filter(t => 
        getNormalizedName(t["Target name"]) === getNormalizedName(selectedPerson.breakdown_label)
      ).sort((a, b) => new Date(b["Created on"]) - new Date(a["Created on"]))
    : [];

  // --- STYLES ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '40px' };
  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' };
  const modalContentStyle = { backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '95%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };

  if (isSummaryLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;
  if (summaryError) return <div style={{ color: 'red', padding: '40px' }}>Error: {summaryError.message}</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Loans Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Click a row to view the transaction history from Wise raw data.</p>
      </header>

      {/* DASHBOARD SUMMARY TABLES */}
      {[ {t: "Outstanding (INR)", d: inrLoans}, {t: "Outstanding (THB)", d: thbLoans} ].map(sec => (
        sec.d.length > 0 && (
          <section key={sec.t}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{sec.t}</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Total Balance</th>
                </tr>
              </thead>
              <tbody>
                {sec.d.map((loan, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedPerson(loan)} 
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={tdStyle}><span style={{ fontWeight: '600' }}>{loan.breakdown_label}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                      {loan.breakdown_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      ))}

      {/* --- DRILL DOWN MODAL --- */}
      {selectedPerson && (
        <div style={modalOverlayStyle} onClick={() => setSelectedPerson(null)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Wise History</h3>
                <p style={{ margin: '4px 0 0 0', color: '#2563eb', fontWeight: '600' }}>{selectedPerson.breakdown_label}</p>
              </div>
              <button 
                onClick={() => setSelectedPerson(null)} 
                style={{ border: 'none', background: '#f1f5f9', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >Close</button>
            </div>

            <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ ...tdStyle, fontSize: '11px', color: '#94a3b8' }}>DATE</th>
                    <th style={{ ...tdStyle, fontSize: '11px', color: '#94a3b8' }}>REFERENCE</th>
                    <th style={{ ...tdStyle, fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>AMOUNT (AFTER FEES)</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDownData.length > 0 ? drillDownData.map((t, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>
                        {new Date(t["Created on"]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '600', fontSize: '12px' }}>{t.ID}</div>
                        <div style={{ fontSize: '11px', color: t.Status === 'COMPLETED' ? '#059669' : '#64748b' }}>{t.Status}</div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                        {/* Using the exact column: Target amount (after fees) */}
                        {Number(t["Target amount (after fees)"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span style={{ fontSize: '10px', marginLeft: '6px', color: '#94a3b8' }}>{t["Target currency"]}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No transactions found in wise_raw matching this name.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#64748b' }}>TOTAL CALCULATED BALANCE</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>
                {selectedPerson.breakdown_value.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedPerson.currency}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}