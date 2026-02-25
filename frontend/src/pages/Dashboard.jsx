import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import Layout from '../components/Layout';
import TransactionList from '../components/TransactionList';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportMode, setReportMode] = useState('FAMILY');
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('all_finance_transactions').select('*');
        if (error) throw error;
        setTransactions(data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const groupedData = useMemo(() => {
    const groups = {};
    
    // Pre-sort all transactions by date newest first
    const sortedRaw = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedRaw.forEach(t => {
      let fullName = (t.name || 'UNKNOWN').trim().toUpperCase()
        .replace(/^(MISS|MR|MRS|MS|DR|MS\.)\s+/g, '');
      
      let key = fullName;
      if (reportMode === 'FAMILY') {
        const parts = fullName.split(/\s+/);
        // MERGE LOGIC: Group by Surname (last word)
        key = parts.length > 1 ? parts[parts.length - 1] : fullName;
      }

      if (!groups[key]) {
        groups[key] = { name: key, total: 0, items: [], members: new Set() };
      }
      
      const val = Math.abs(parseFloat(t.amount) || 0);
      groups[key].total += val;
      groups[key].items.push(t);
      groups[key].members.add(fullName);
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [transactions, reportMode]);

  const totalPortfolio = useMemo(() => 
    transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0), [transactions]
  );

  if (loading) return <Layout><div style={{padding: '50px', fontWeight: 'bold'}}>Recalculating Portfolio...</div></Layout>;

  return (
    <Layout>
      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Portfolio Dashboard</h1>
          <div style={{ background: '#eee', padding: '5px', borderRadius: '12px', display: 'flex' }}>
            <button onClick={() => { setReportMode('FAMILY'); setSelectedGroup(null); }} style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', fontWeight: '900', background: reportMode === 'FAMILY' ? 'white' : 'transparent', boxShadow: reportMode === 'FAMILY' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>FAMILY</button>
            <button onClick={() => { setReportMode('INDIVIDUAL'); setSelectedGroup(null); }} style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', fontWeight: '900', background: reportMode === 'INDIVIDUAL' ? 'white' : 'transparent', boxShadow: reportMode === 'INDIVIDUAL' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>INDIVIDUAL</button>
          </div>
        </div>

        {/* MAIN TOTAL */}
        <div style={{ background: '#111', color: 'white', padding: '40px', borderRadius: '32px', textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '2px' }}>TOTAL PAID (ALL BANKS)</div>
          <div style={{ fontSize: '64px', fontWeight: '900', color: '#4ade80', marginTop: '10px' }}>
            {totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* LIST */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '20px', fontSize: '11px', color: '#999' }}>RECIPIENT</th>
                <th style={{ padding: '20px', fontSize: '11px', color: '#999', textAlign: 'right' }}>OUTSTANDING</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((group) => (
                <tr 
                  key={group.name} 
                  onClick={() => setSelectedGroup(group)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #f9f9f9', background: selectedGroup?.name === group.name ? '#f0f7ff' : 'transparent' }}
                >
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>{group.name}</div>
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>{Array.from(group.members).join(' • ')}</div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right', fontWeight: '900', fontSize: '20px', fontFamily: 'monospace' }}>
                    {group.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TransactionList isOpen={!!selectedGroup} group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      </div>
    </Layout>
  );
};

export default Dashboard;