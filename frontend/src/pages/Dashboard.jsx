import React, { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout.jsx";
import TransactionList from "../components/TransactionList.jsx";

/**
 * Local-only preference (NO DB)
 * Default must be INDIVIDUAL
 */
const PREF_KEY = "pfp.scope.v1";
function loadScope() {
  const v = localStorage.getItem(PREF_KEY);
  return v === "FAMILY" ? "FAMILY" : "INDIVIDUAL";
}
function saveScope(scope) {
  localStorage.setItem(PREF_KEY, scope);
}

export default function Dashboard() {
  const printRef = useRef(null);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Default = INDIVIDUAL (from local storage, fallback INDIVIDUAL)
  const [reportMode, setReportMode] = useState(loadScope());
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const { data, error } = await supabase
          .from("all_finance_transactions")
          .select("*");

        if (error) throw error;

        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Supabase fetch error:", err);
        setFetchError(
          err?.message ||
            "Failed to load transactions. Check browser console for details."
        );
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedData = useMemo(() => {
    const groups = {};

    const sortedRaw = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedRaw.forEach((t) => {
      let fullName = (t.name || "UNKNOWN")
        .trim()
        .toUpperCase()
        .replace(/^(MISS|MR|MRS|MS|DR|MS\.)\s+/g, "");

      let key = fullName;

      if (reportMode === "FAMILY") {
        const parts = fullName.split(/\s+/);
        key = parts.length > 1 ? parts[parts.length - 1] : fullName;
      }

      if (!groups[key]) {
        groups[key] = { name: key, total: 0, items: [], members: new Set() };
      }

      const val = Math.abs(parseFloat(t.amount) || 0);
      groups[key].total += val;
      groups[key].items.push(t);
      groups[key].members.add(fullName);
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [transactions, reportMode]);

  const totalPortfolio = useMemo(() => {
    return transactions.reduce(
      (sum, t) => sum + Math.abs(parseFloat(t.amount) || 0),
      0
    );
  }, [transactions]);

  function setMode(mode) {
    setReportMode(mode);
    saveScope(mode); // persist locally
    setSelectedGroup(null);
  }

  function onExportPrint() {
    // Browser print dialog:
    // - choose printer OR "Save as PDF"
    window.print();
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 24, fontWeight: 800 }}>
          Recalculating Portfolio...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Controls row (hide on print via print.css) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>
          Dashboard ({reportMode === "FAMILY" ? "Family" : "Individual"})
        </h1>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setMode("INDIVIDUAL")}
            style={{
              border: "1px solid rgba(0,0,0,0.2)",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              background: reportMode === "INDIVIDUAL" ? "#111" : "#fff",
              color: reportMode === "INDIVIDUAL" ? "#fff" : "#111",
            }}
          >
            INDIVIDUAL
          </button>

          <button
            onClick={() => setMode("FAMILY")}
            style={{
              border: "1px solid rgba(0,0,0,0.2)",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              background: reportMode === "FAMILY" ? "#111" : "#fff",
              color: reportMode === "FAMILY" ? "#fff" : "#111",
            }}
          >
            FAMILY
          </button>

          <button
            onClick={onExportPrint}
            style={{
              border: "1px solid rgba(0,0,0,0.2)",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              background: "#fff",
            }}
            title="Print or Save as PDF"
          >
            Export / Print
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="print-area">
        {fetchError ? (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#fff0f0",
              border: "1px solid #ffd0d0",
              fontWeight: 800,
            }}
          >
            Error loading transactions: {fetchError}
            <div style={{ marginTop: 8, fontWeight: 600, opacity: 0.8 }}>
              Open DevTools → Console to see the exact Supabase error. Common
              causes: missing env vars (VITE_SUPABASE_URL / ANON_KEY), RLS
              blocking reads, or table name mismatch.
            </div>
          </div>
        ) : null}

        {/* Main total */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>
            TOTAL PAID (ALL BANKS)
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>
            {totalPortfolio.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 14 }}>
          {/* List */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #f1f1f1",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              RECIPIENT OUTSTANDING
            </div>

            <div style={{ maxHeight: 520, overflow: "auto" }}>
              {groupedData.map((group) => (
                <div
                  key={group.name}
                  onClick={() => setSelectedGroup(group)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f7f7f7",
                    background:
                      selectedGroup?.name === group.name ? "#f0f7ff" : "transparent",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 12 }}>{group.name}</div>

                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                    {Array.from(group.members).join(" • ")}
                  </div>

                  <div style={{ marginTop: 6, fontSize: 14, fontWeight: 900 }}>
                    {group.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}

              {groupedData.length === 0 && !fetchError ? (
                <div style={{ padding: 14, opacity: 0.7, fontWeight: 700 }}>
                  No transactions found.
                </div>
              ) : null}
            </div>
          </div>

          {/* Details */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              minHeight: 520,
            }}
          >
            {selectedGroup ? (
              <TransactionList
                transactions={selectedGroup.items}
                onBack={() => setSelectedGroup(null)}
              />
            ) : (
              <div style={{ opacity: 0.7, fontWeight: 700 }}>
                Select a recipient group to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}