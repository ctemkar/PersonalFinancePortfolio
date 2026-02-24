import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import TransactionList from "../components/TransactionList";

// --- CONFIGURATION ---
const HIDDEN_LAST_NAMES = ["temkar"]; 

export default function Dashboard() {
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Persistence Logic: Initialize state from localStorage or default to true (Family)
  const [isGroupedByFamily, setIsGroupedByFamily] = useState(() => {
    const saved = localStorage.getItem("isGroupedByFamily");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever the setting changes
  useEffect(() => {
    localStorage.setItem("isGroupedByFamily", JSON.stringify(isGroupedByFamily));
  }, [isGroupedByFamily]);

  // 1. Fetch Wise Data
  const { data: wise, isLoading: l1 } = useQuery({ 
    queryKey: ['wise-clean'], 
    queryFn: async () => {
      const { data } = await supabase.from('wise_clean').select('*');
      return data?.map(t => ({ ...t, source: 'Wise' })) || [];
    }
  });

  // 2. Fetch TrueMoney Data
  const { data: tm, isLoading: l2 } = useQuery({ 
    queryKey: ['tm-clean'], 
    queryFn: async () => {
      const { data } = await supabase.from('truemoney_clean').select('*');
      return data?.map(t => ({ ...t, source: 'TrueMoney' })) || [];
    }
  });

  // 3. Fetch Bangkok Bank Data
  const { data: bank, isLoading: l3 } = useQuery({ 
    queryKey: ['bank-clean'], 
    queryFn: async () => {
      const { data } = await supabase.from('bangkokbank_clean').select('*');
      return data?.map(t => ({ ...t, source: 'Bank' })) || [];
    }
  });

  // --- HELPERS ---
  const getLastName = (name) => {
    if (!name) return "unknown";
    // Remove titles like MISS or MR for accurate grouping
    const cleanName = name.replace(/^(MISS|MR|MRS|MS|DR)\.?\s+/i, "").trim();
    const parts = cleanName.split(/\s+/);
    return (parts[parts.length - 1] || "unknown").toLowerCase();
  };

  const getNormalizedIndividualName = (name) => {
    if (!name) return "unknown";
    const cleanName = name.replace(/^(MISS|MR|MRS|MS|DR)\.?\s+/i, "").trim();
    // Sort words alphabetically to handle name reversals (Mom Pheiyb vs Pheiyb Mom)
    return cleanName.toLowerCase().split(/\s+/).sort().join(' ');
  };

  // --- MERGE ---
  const allTransactions = useMemo(() => {
    return [...(wise || []), ...(tm || []), ...(bank || [])]
      .sort((a, b) => new Date(b.norm_date) - new Date(a.norm_date));
  }, [wise, tm, bank]);

  // --- AGGREGATE TOTALS ---
  const summaryReport = useMemo(() => {
    const agg = {};
    allTransactions.forEach(t => {
      const lastName = getLastName(t.norm_name);
      if (HIDDEN_LAST_NAMES.includes(lastName)) return;

      const label = isGroupedByFamily ? lastName.toUpperCase() : t.norm_name;
      const key = isGroupedByFamily 
        ? `${lastName}-${t.norm_currency}` 
        : `${getNormalizedIndividualName(t.norm_name)}-${t.norm_currency}`;

      if (!agg[key]) {
        agg[key] = { label, total: 0, currency: t.norm_currency, members: new Set() };
      }
      agg[key].total += Number(t.norm_amount || 0);
      agg[key].members.add(t.norm_name);
    });
    // Sort by Maximum Amount First
    return Object.values(agg).sort((a, b) => b.total - a.total);
  }, [allTransactions, isGroupedByFamily]);

  // --- AGGREGATE MONTHLY ---
  const monthlyReport = useMemo(() => {
    const agg = {};
    allTransactions.forEach(t => {
      const lastName = getLastName(t.norm_name);
      if (HIDDEN_LAST_NAMES.includes(lastName)) return;

      const date = new Date(t.norm_date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const label = isGroupedByFamily ? lastName.toUpperCase() : t.norm_name;
      const key = `${monthYear}-${label}-${t.norm_currency}`;
      
      if (!agg[key]) {
        agg[key] = { 
          monthYear, label, total: 0, currency: t.norm_currency, 
          ts: new Date(date.getFullYear(), date.getMonth(), 1).getTime() 
        };
      }
      agg[key].total += Number(t.norm_amount || 0);
    });

    // Sort: 1. Newest Month, 2. Max Amount in month
    return Object.values(agg).sort((a, b) => (b.ts !== a.ts) ? b.ts - a.ts : b.total - a.total);
  }, [allTransactions, isGroupedByFamily]);

  const drillDownData = selectedPerson ? allTransactions.filter(t => {
    if (isGroupedByFamily) return getLastName(t.norm_name) === getLastName(selectedPerson.label);
    return getNormalizedIndividualName(t.norm_name) === getNormalizedIndividualName(selectedPerson.label);
  }) : [];

  if (l1 || l2 || l3) return <div style={{ padding: '60px', textAlign: 'center' }}>Synchronizing All Accounts...</div>;

  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' };
  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>Portfolio Dashboard</h1>
          <div className="no-print" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Report Mode:</span>
             <button 
                onClick={() => setIsGroupedByFamily(!isGroupedByFamily)} 
                style={{ 
                  background: isGroupedByFamily ? '#2563eb' : '#0f172a', 
                  color: 'white', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
             >
                {isGroupedByFamily ? "Family Grouping" : "Individual Recipients"}
             </button>
          </div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Save PDF</button>
      </header>

      {/* TOTALS SUMMARY */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
          {isGroupedByFamily ? "Consolidated Family Balances" : "Recipient Balances"} (Max First)
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{isGroupedByFamily ? "Surname Group" : "Name"}</th>
              {isGroupedByFamily && <th style={thStyle}>Included Members</th>}
              <th style={{ ...thStyle, textAlign: 'right' }}>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {summaryReport.map((item, idx) => (
              <tr key={idx} onClick={() => setSelectedPerson(item)} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                <td style={tdStyle}><strong style={{ color: '#2563eb' }}>{item.label}</strong></td>
                {isGroupedByFamily && <td style={{ ...tdStyle, color: '#64748b', fontSize: '11px' }}>{Array.from(item.members).join(", ")}</td>}
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700' }}>{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})} {item.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MONTHLY HISTORY */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Monthly Payment Velocity</h2>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Month</th><th style={thStyle}>Recipient</th><th style={{ ...thStyle, textAlign: 'right' }}>Paid</th></tr>
          </thead>
          <tbody>
            {monthlyReport.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...tdStyle, fontWeight: '600' }}>{item.monthYear}</td>
                <td style={tdStyle}>{item.label}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                  {item.total.toLocaleString(undefined, {minimumFractionDigits: 2})} {item.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* DRILL DOWN MODAL */}
      {selectedPerson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={() => setSelectedPerson(null)}>
          <div style={{ width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <TransactionList 
              transactions={drillDownData} 
              personName={selectedPerson.label} 
              total={selectedPerson.total} 
              currency={selectedPerson.currency}
              onClose={() => setSelectedPerson(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}