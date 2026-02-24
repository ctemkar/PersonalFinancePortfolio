export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-4 text-2xl font-bold border-b border-slate-800">
          Personal Finance
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Dashboard
          </a>
          <a href="/transactions" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Transactions
          </a>
          <a href="/budgets" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Budgets
          </a>
          <a href="/categories" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Categories
          </a>
          <a href="/reports" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Reports
          </a>
          <a href="/settings" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            Settings
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="px-8 py-6">
          {children}
        </div>
      </main>

    </div>
  );
}
