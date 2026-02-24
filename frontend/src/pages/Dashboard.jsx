import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [selectedPerson, setSelectedPerson] = useState(null);

  // 1. Fetch Summary from loans_dashboard
  const { data: summaryTable } = useQuery({
    queryKey: ['loans-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('loans_dashboard').select('*');
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch ALL Raw Transactions from wise_raw (Increased Limit to 5000)
  const { data: wiseRaw, isLoading: isRawLoading } = useQuery({
    queryKey: ['wise-raw-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wise_raw')
        .select('*')
        .order('Created on', { ascending: false })
        .range(0, 5000); // Ensure we get all 2025 and 2026 rows
      if (error) throw error;
      return data;
    }
  });

  // --- NORMALIZATION LOGIC ---
  const getNormalizedName = (name) => {
    if (!name) return "";
    return name.toLowerCase().trim().split(/\s+/).sort().join(' ');
  };

  // --- COMPREHENSIVE AGGREGATION ---
  // This merges the static summary table with the LIVE wise_raw data
  const dashboardData = useMemo(() => {
    const agg = {};

    // First, process the raw Wise transactions (The most up-to-date source for 2026)
    (wiseRaw || []).forEach(t => {
      const name = t["Target name"];
      const currency = t["Target currency"] || "THB"; // Default to THB if missing
      const normName = getNormalizedName(name);
      const key = `${normName}-${currency}`;
      const amount = Number(t["Target amount (after fees)"] || 0);

      if (!agg[key]) {
        agg[key] = { 
          breakdown_label: name, 
          breakdown_value: 0, 
          currency: currency, 
          isLive: true,
          count: 0
        };
      }
      agg[key].breakdown_value += amount;
      agg[key].count += 1;
    });

    // Second, merge in any names from loans_dashboard that might not be in Wise (e.g. Bank/Cash)
    // If a name exists in both, we trust the wise_raw total for the Wise portion
    (summaryTable || []).forEach(s => {
      const normName = getNormalizedName(s.breakdown_label);
      const key = `${normName}-${s.currency}`;
      
      // Only add if we don't already have live Wise data for this person
      // Or if the summary name is a different source
      if (!agg[key]) {
        agg[key] = { ...s, breakdown_value: Number(s.breakdown_value), isLive: false, count: 1 };
      }
    });

    return Object.values(agg).sort((a, b) => b.breakdown_value - a.breakdown_value);
  }, [wiseRaw, summaryTable]);

  const inrLoans = dashboardData.filter(l => l.currency === "INR");
  const thbLoans = dashboardData.filter(l => l.currency === "THB");

  // --- DRILL DOWN DATA ---
  const drillDownData = selectedPerson 
    ? (wiseRaw || []).filter(t => 
        getNormalizedName(t["Target name"]) === getNormalizedName(selectedPerson.breakdown_label)
      )
    : [];

  // --- STYLES ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '40px' };
  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' };
  const modalContentStyle = { backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '95%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto' };

  if (isRawLoading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading 2026 Portfolio Data...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Loans Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Showing all transactions including 2026. Data aggregated from wise_raw.</p>
      </header>

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
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '600' }}>{loan.breakdown_label}</span>
                      {loan.isLive && <span style={{fontSize: '9px', marginLeft: '8px', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle'}}>LIVE 2026</span>}
                    </td>
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
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{selectedPerson.breakdown_label}</h3>
              <button onClick={() => setSelectedPerson(null)} style={{ border: 'none', background: '#f1f5f9', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={thStyle}>Created On</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount (After Fees)</th>
                </tr>
              </thead>
              <tbody>
                {drillDownData.length > 0 ? drillDownData.map((t, idx) => (
                  <tr key={idx} style={{ backgroundColor: new Date(t["Created on"]).getFullYear() === 2026 ? '#fffbeb' : 'transparent' }}>
                    <td style={tdStyle}>{new Date(t["Created on"]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={tdStyle}>{t.Status}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                      {Number(t["Target amount (after fees)"]).toLocaleString(undefined, { minimumFractionDigits: 2 })} {t["Target currency"]}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{ ...tdStyle, textAlign: 'center', padding: '40px' }}>No Wise raw records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}