import Layout from "../components/Layout.jsx";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient.js";
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

async function fetchMonthlySummaries() {
  const { data, error } = await supabase
    .from("monthly_summaries")
    .select("*")
    .order("year", { ascending: true })
    .order("month", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default function Dashboard() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["monthly_summaries"],
    queryFn: fetchMonthlySummaries
  });

  const labels = data.map((m) => `${m.month}/${m.year}`);
  const expenses = data.map((m) => Number(m.expenses || 0));
  const chartData = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: expenses,
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
      <p className="text-gray-700 mb-4">
        Tailwind v4 is now working correctly and data is loaded from Supabase.
      </p>
      {isLoading && <p>Loading monthly summaries...</p>}
      {error && <p className="text-red-600">Failed to load data.</p>}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Monthly Expenses</h2>
          <Line data={chartData} options={options} />
        </div>
      )}
    </Layout>
  );
}
