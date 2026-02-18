import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const linkClasses = (path) =>
    "block px-3 py-2 rounded-md text-sm font-medium " +
    (location.pathname === path
      ? "bg-white text-blue-700"
      : "text-white hover:bg-blue-500");

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col">
        <div className="text-xl font-bold mb-6">Personal Finance</div>
        <nav className="space-y-2 flex-1">
          <Link to="/" className={linkClasses("/")}>
            Dashboard
          </Link>
          <Link to="/transactions" className={linkClasses("/transactions")}>
            Transactions
          </Link>
          <Link to="/budgets" className={linkClasses("/budgets")}>
            Budgets
          </Link>
          <Link to="/settings" className={linkClasses("/settings")}>
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
}
