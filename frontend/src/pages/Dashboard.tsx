import React, { useMemo } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { data: transactions, isLoading, error } = useFinanceData();

  const metrics = useMemo(() => {
    if (!transactions) return { total: 0, byRecipient: {} };
    
    return transactions.reduce((acc, curr) => {
      // Calculate Total Amount (Fixes the 0.00 issue)
      acc.total += curr.amount;
      
      // Group by Recipient Name
      const key = curr.name || 'Unknown';
      acc.byRecipient[key] = (acc.byRecipient[key] || 0) + curr.amount;
      
      return acc;
    }, { total: 0, byRecipient: {} as Record<string, number> });
  }, [transactions]);

  if (isLoading) return <Layout><div className="p-8 text-gray-400">Loading Portfolio...</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-500">Database Connection Error</div></Layout>;

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Portfolio Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Individual Recipients */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Recipient Balances</h3>
            <div className="space-y-4">
              {Object.entries(metrics.byRecipient)
                .sort(([, a], [, b]) => b - a)
                .map(([name, amount]) => (
                  <div key={name} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-blue-600 font-bold text-sm uppercase">{name}</span>
                    <span className="font-mono font-bold text-gray-700">
                      {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Monthly Velocity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Monthly Payment Velocity</h3>
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
              <div>
                <p className="text-gray-700 font-bold">August 2025</p>
                <p className="text-xs text-gray-400 uppercase">Consolidated Total</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-green-600">
                  {metrics.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;