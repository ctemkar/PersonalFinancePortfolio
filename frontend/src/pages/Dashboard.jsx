import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient.js";

export default function Dashboard() {
  // Debug logs to verify environment variables
  console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "SUPABASE KEY:",
    import.meta.env.VITE_SUPABASE_ANON_KEY ? "Loaded" : "Missing"
  );

  const { data: loans = [], isLoading, error } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans_dashboard")
        .select("*")
        .order("breakdown_value", { ascending: false });

      if (error) {
        console.error("SUPABASE ERROR:", error);
        throw error;
      }

      return data || [];
    },
  });

  const formatAmount = (value, currency) =>
    Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ` ${currency}`;

  const loansINR = loans.filter((l) => l.currency === "INR");
  const loansTHB = loans.filter((l) => l.currency === "THB");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Loans Dashboard</h1>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Failed to load loans.</p>}

      {!isLoading && !error && (
        <div className="space-y-10">

          {/* OUTSTANDING INR */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Outstanding (INR)</h2>

            <div className="bg-white shadow rounded-lg p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="py-2">Name</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loansINR.map((loan) => (
                    <tr key={loan.id} className="border-b hover:bg-slate-50">
                      <td className="py-2">{loan.breakdown_label}</td>
                      <td className="py-2 text-right font-semibold">
                        {formatAmount(loan.breakdown_value, loan.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loansINR.length === 0 && (
                <p className="text-slate-500 mt-4">No INR loans found.</p>
              )}
            </div>
          </section>

          {/* OUTSTANDING THB */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Outstanding (THB)</h2>

            <div className="bg-white shadow rounded-lg p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="py-2">Name</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loansTHB.map((loan) => (
                    <tr key={loan.id} className="border-b hover:bg-slate-50">
                      <td className="py-2">{loan.breakdown_label}</td>
                      <td className="py-2 text-right font-semibold">
                        {formatAmount(loan.breakdown_value, loan.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loansTHB.length === 0 && (
                <p className="text-slate-500 mt-4">No THB loans found.</p>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
