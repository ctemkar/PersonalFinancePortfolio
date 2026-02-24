import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import TransactionList from "../components/TransactionList";

// --- CONFIGURATION ---
const HIDDEN_LAST_NAMES = ["temkar"]; 

export default function Dashboard() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isGroupedByFamily, setIsGroupedByFamily] = useState(true); // Toggle State

  // 1. Fetch Wise Data
  const { data: wiseRaw, isLoading: wiseLoading } = useQuery({
    queryKey: ['wise-raw'],
    queryFn: async () => {
      const { data, error } = await supabase.from('wise_raw').select('*').range(0, 5000);
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch TrueMoney Data
  const { data: trueMoneyRaw, isLoading: tmLoading } = useQuery({
    queryKey: ['truemoney-raw'],
    queryFn: async () => {
      const { data, error } = await supabase.from('truemoney_raw').select('*').range(0, 5000);
      if (error) throw error;
      return data;
    }
  });

  // --- HELPERS ---
  const getLastName = (name) => {
    if (!name) return "unknown";
    const parts = name.trim().split(/\s+/);
    return (parts[parts.length - 1] || "unknown").toLowerCase();
  };

  const getNormalizedIndividualName = (name) => {
    if (!name) return "unknown";
    return name.toLowerCase().trim().split(/\s+/).sort().join(' ');
  };

  // --- MERGE & DEDUPE ---
  const allTransactions = useMemo(() => {
    const dedupedWise = (wiseRaw || []).reduce((acc, current) => {
      if (!acc.find(item => item.ID === current.ID)) {
        acc.push({
          ...current, source: 'Wise',
          norm_date: current["Created on"],
          norm_amount: Number(current["Target amount (after fees)"]),
          norm_name: current["Target name"],
          norm_currency: current["Target currency"] || "THB"
        });
      }
      return acc;
    }, []);

    const dedupedTM = (trueMoneyRaw || []).reduce((acc, current) => {
      const id = current.transaction_id || current.id;
      if (!acc.find(item => (item.transaction_id || item.id) === id)) {
        acc.push({
          ...current, source: 'TrueMoney',
          norm_date: current.date_time || current.created_at,
          norm_amount: Number(current.amount),
          norm_name: current.recipient_name || current.name,
          norm_currency: "THB"
        });
      }
      return acc;
    }, []);

    return [...dedupedWise, ...dedupedTM].sort((a, b) => new Date(b.norm_date) - new Date(a.norm_date));
  }, [wiseRaw, trueMoneyRaw]);

  // --- AGGREGATIONS ---
  const familySummary = useMemo(() => {
    const agg = {};
    allTransactions.forEach(t => {
      const lastName = getLastName(t.norm_name);
      if (HIDDEN_LAST_NAMES.includes(lastName)) return;

      // Grouping Logic Choice
      const label = isGroupedByFamily ? lastName.toUpperCase() : t.norm_name;
      const key = isGroupedByFamily 
        ? `${lastName}-${t.norm_currency}` 
        : `${getNormalizedIndividualName(t.norm_name)}-${t.norm_currency}`;

      if (!agg[key]) {
        agg[key] = { label, total: 0, currency: t.norm_currency, members: new Set(), keyName: label };
      }
      agg[key].total += t.norm_amount;
      agg[key].members.add(t.norm_name);
    });
    return Object.values(agg).sort((a, b) => b.total - a.total);
  }, [allTransactions, isGroupedByFamily]);

  const monthlySummary = useMemo(() => {
    const agg = {};
    allTransactions.forEach(t => {
      const lastName = getLastName(t.norm_name);
      if (HIDDEN_LAST_NAMES.includes(lastName)) return;

      const date = new Date(t.norm_date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const label = isGroupedByFamily ? lastName.toUpperCase() : t.norm_name;
      const key = `${monthYear}-${label}-${t.norm_currency}`;
      
      if (!agg[key]) {
        agg[key] = { monthYear, label, total: 0, currency: t.norm_currency, timestamp: date.getTime() };
      }
      agg[key].total += t.norm_amount;
    });
    return Object.values(agg).sort((a, b) => b.timestamp - a.timestamp);
  }, [allTransactions, isGroupedByFamily]);

  // Drill down filters differently based on the toggle
  const drillDownData = selectedPerson ? allTransactions.filter(t => {
    if (isGroupedByFamily) {
      return getLastName(t.norm_name) === getLastName(selectedPerson.keyName);
    }
    return getNormalizedIndividualName(t.norm_name) === getNormalizedIndividualName(selectedPerson.keyName);
  }) : [];

  // Styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' };
  const thStyle = { backgroundColor: '#f1f5f9', padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' };
  const tdStyle = { padding: '14px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' };

  if (wiseLoading || tmLoading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Data...</div>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Portfolio Dashboard</h1>
          <div className="no-print" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '12px', background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', width: 'fit-content' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: isGroupedByFamily ? '#64748b' : '#0f172a' }}>Individual</span>
            <button 
              onClick={() => setIsGroupedByFamily(!isGroupedByFamily)}
              style={{ width: '40px', height: '20px', borderRadius: '10px', background: isGroupedByFamily ? '#2563eb' : '#94a3b8', border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
            >
              <div style={{ position: 'absolute', top: '2px', left: isGroupedByFamily ? '22px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: '0.3s' }} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: isGroupedByFamily ? '#0f172a' : '#64748b' }}>Family Mode</span>
          </div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Export PDF</button>
      </header>

      <section>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{isGroupedByFamily ? "Family Totals" : "Individual Totals"}</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{isGroupedByFamily ? "Family" : "Recipient"}</th>
              {isGroupedByFamily && <th style={thStyle}>Members</th>}
              <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {familySummary.map((item, idx) => (
              <tr key={idx} onClick={() => setSelectedPerson(item)} style={{ cursor: 'pointer' }}>
                <td style={tdStyle}><strong style={{ color: '#2563eb' }}>{item.label}</strong></td>
                {isGroupedByFamily && <td style={{ ...tdStyle, color: '#64748b', fontSize: '11px' }}>{Array.from(item.members).join(", ")}</td>}
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700' }}>{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})} {item.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Monthly Payments</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Month</th>
              <th style={thStyle}>{isGroupedByFamily ? "Family" : "Recipient"}</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total Paid</th>
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map((item, idx) => (
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