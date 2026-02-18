import Layout from "../components/Layout.jsx";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient.js";

async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount, note, date, categories(name, type)")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function Transactions() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      {isLoading && <p>Loading transactions...</p>}
      {error && <p className="text-red-600">Failed to load transactions.</p>}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Note</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2">
                    {t.date}
                  </td>
                  <td className="px-4 py-2">
                    {t.categories?.name || ""}
                  </td>
                  <td className="px-4 py-2">
                    {t.note}
                  </td>
                  <td
                    className={
                      "px-4 py-2 " +
                      (Number(t.amount) < 0 ? "text-red-600" : "text-green-600")
                    }
                  >
                    {t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
