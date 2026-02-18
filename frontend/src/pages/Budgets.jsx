import Layout from "../components/Layout.jsx";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient.js";

async function fetchBudgets() {
  const { data, error } = await supabase
    .from("budgets")
    .select("id, limit_amount, categories(name), user_id");
  if (error) throw error;
  return data || [];
}

async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, category_id");
  if (error) throw error;
  return data || [];
}

export default function Budgets() {
  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions_for_budgets"],
    queryFn: fetchTransactions
  });

  const budgetsWithUsage = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.category_id === b.category_id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const used = Math.abs(spent);
    const limit = Number(b.limit_amount || 0);
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { ...b, used, percent };
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Budgets</h1>
      <div className="space-y-4">
        {budgetsWithUsage.map((b) => (
          <div key={b.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                {b.categories?.name || "Category"}
              </span>
              <span className="text-sm text-gray-600">
                {b.used} / {b.limit_amount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: b.percent + "%" }}
              />
            </div>
          </div>
        ))}
        {budgetsWithUsage.length === 0 && (
          <p className="text-gray-600">
            No budgets found. Add some rows in the budgets table in Supabase.
          </p>
        )}
      </div>
    </Layout>
  );
}
