import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: "🏠" },
    { name: "Transactions", path: "/transactions", icon: "💸" },
    { name: "Budgets", path: "/budgets", icon: "📊" },
    { name: "Categories", path: "/categories", icon: "📁" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc' }}>
      {/* SIDEBAR */}
      <aside style={{ 
        width: '260px', backgroundColor: '#0f172a', color: 'white', 
        display: 'flex', flexDirection: 'column', position: 'fixed',
        height: '100vh', left: 0, top: 0, zIndex: 100
      }}>
        <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #1e293b' }}>
          Finance App
        </div>
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', textDecoration: 'none', fontSize: '14px',
                color: location.pathname === item.path ? 'white' : '#94a3b8',
                backgroundColor: location.pathname === item.path ? '#2563eb' : 'transparent',
              }}
            >
              <span>{item.icon}</span> {item.name}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>CT</div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold' }}>Chetan Temkar</div>
            <div style={{ color: '#64748b' }}>Administrator</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '40px', width: 'calc(100% - 260px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}