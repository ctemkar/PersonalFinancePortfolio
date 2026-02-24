import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const { data: rawLoans, isLoading, error } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans_dashboard')
        .select('breakdown_label, breakdown_value, currency, main_value, report_name')
        .order('breakdown_value', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading Dashboard Data...
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
        <strong>Database Error:</strong> {error.message}
      </div>
    );
  }

  /**
   * NORMALIZATION LOGIC
   * 1. Trim and Lowercase
   * 2. Split by spaces, sort words alphabetically, join back
   * 3. This treats "Mom Pheiyb" and "pheiyb mom" as the same key
   */
  const getNormalizedKey = (name, curr) => {
    if (!name) return `unknown-${curr}`;
    const sortedParts = name
      .toLowerCase()
      .trim()
      .split(/\s+/) // split by any whitespace
      .sort()
      .join(' ');
    return `${sortedParts}-${curr}`;
  };

  const aggregatedData = (rawLoans || []).reduce((acc, current) => {
    const key = getNormalizedKey(current.breakdown_label, current.currency);

    if (!acc[key]) {
      // Keep the original label for display from the first record found
      acc[key] = { ...current, breakdown_value: 0 };
    }
    
    acc[key].breakdown_value += Number(current.breakdown_value || 0);
    return acc;
  }, {});

  // Convert to array and sort by value descending
  const loans = Object.values(aggregatedData).sort((a, b) => b.breakdown_value - a.breakdown_value);

  const inrLoans = loans.filter(l => l.currency === "INR");
  const thbLoans = loans.filter(l => l.currency === "THB");

  const totalINR = inrLoans.reduce((acc, curr) => acc + curr.breakdown_value, 0);
  const totalTHB = thbLoans.reduce((acc, curr) => acc + curr.breakdown_value, 0);

  // Table Styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '40px'
  };

  const thStyle = {
    backgroundColor: '#f1f5f9',
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em'
  };

  const tdStyle = {
    padding: '14px 24px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '13px',
    color: '#334155'
  };

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          Loans Dashboard
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Aggregated by Name (Order and Case Insensitive).
        </p>
      </header>

      {/* INR SECTION */}
      {inrLoans.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            Outstanding (INR)
          </h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inrLoans.map((loan, index) => (
                <tr key={`inr-${index}`}>
                  <td style={tdStyle}>{loan.breakdown_label}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                    {loan.breakdown_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '11px' }}>INR</span>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                <td style={tdStyle}>TOTAL OUTSTANDING</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#2563eb', fontFamily: 'monospace' }}>
                  {totalINR.toLocaleString(undefined, { minimumFractionDigits: 2 })} INR
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* THB SECTION */}
      {thbLoans.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            Outstanding (THB)
          </h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {thbLoans.map((loan, index) => (
                <tr key={`thb-${index}`}>
                  <td style={tdStyle}>{loan.breakdown_label}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                    {loan.breakdown_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '11px' }}>THB</span>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                <td style={tdStyle}>TOTAL OUTSTANDING</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#2563eb', fontFamily: 'monospace' }}>
                  {totalTHB.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}