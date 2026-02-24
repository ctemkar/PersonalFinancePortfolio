import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      {/* SIDEBAR - Fixed width 64 (16rem), Dark background */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-800">
          Personal Finance
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Dashboard
          </Link>
          <Link to="/transactions" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Transactions
          </Link>
          <Link to="/budgets" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Budgets
          </Link>
          <Link to="/categories" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Categories
          </Link>
          <Link to="/reports" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Reports
          </Link>
          <Link to="/settings" className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
            Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}