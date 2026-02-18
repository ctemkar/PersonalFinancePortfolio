set -e

ROOT="/Users/chetantemkar/personal-finance-app"
FRONTEND_DIR="$ROOT/frontend"
BACKEND_DIR="$ROOT/backend"

cd "$FRONTEND_DIR"

mkdir -p src/pages src/components src/lib

cat > package.json << 'EOT'
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "react-chartjs-2": "^5.2.0",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "vite": "^5.0.0"
  }
}
EOT

cat > vite.config.js << 'EOT'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
EOT

cat > postcss.config.js << 'EOT'
export default {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};
EOT

cat > src/tailwind.css << 'EOT'
@import "tailwindcss";
EOT

cat > index.html << 'EOT'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Finance App</title>
  </head>
  <body class="bg-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOT

cat > src/main.jsx << 'EOT'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./tailwind.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
EOT

cat > src/lib/supabaseClient.js << 'EOT'
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
EOT

cat > src/components/Layout.jsx << 'EOT'
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
EOT

cat > src/pages/Dashboard.jsx << 'EOT'
import Layout from "../components/Layout.jsx";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Expenses",
        data: [500, 650, 700, 550, 600],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Personal Finance Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Tailwind v4 is now working correctly.
      </p>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Monthly Expenses</h2>
        <Line data={data} options={options} />
      </div>
    </Layout>
  );
}
EOT

cat > src/pages/Transactions.jsx << 'EOT'
import Layout from "../components/Layout.jsx";

export default function Transactions() {
  const transactions = [
    { id: 1, name: "Groceries", amount: -50, date: "2025-02-01" },
    { id: 2, name: "Salary", amount: 2000, date: "2025-02-03" },
    { id: 3, name: "Rent", amount: -800, date: "2025-02-05" }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.date}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td
                  className={
                    "px-4 py-2 " +
                    (t.amount < 0 ? "text-red-600" : "text-green-600")
                  }
                >
                  {t.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
EOT

cat > src/pages/Budgets.jsx << 'EOT'
import Layout from "../components/Layout.jsx";

export default function Budgets() {
  const budgets = [
    { id: 1, category: "Groceries", used: 150, limit: 300 },
    { id: 2, category: "Entertainment", used: 80, limit: 150 }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Budgets</h1>
      <div className="space-y-4">
        {budgets.map((b) => {
          const percent = Math.min(100, Math.round((b.used / b.limit) * 100));
          return (
            <div key={b.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{b.category}</span>
                <span className="text-sm text-gray-600">
                  {b.used} / {b.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: percent + "%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
EOT

cat > src/pages/Settings.jsx << 'EOT'
import Layout from "../components/Layout.jsx";

export default function Settings() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-700">Settings page placeholder.</p>
    </Layout>
  );
}
EOT

cat > src/App.jsx << 'EOT'
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
EOT

rm -rf node_modules package-lock.json
npm install

cd "$BACKEND_DIR"
rm -rf node_modules package-lock.json
npm install

osascript -e "tell application \"Terminal\" to do script \"cd $BACKEND_DIR && npm run dev\""
osascript -e "tell application \"Terminal\" to do script \"cd $FRONTEND_DIR && npm run dev\""
open http://localhost:5173
