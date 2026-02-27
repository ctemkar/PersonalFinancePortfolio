import React from "react";
import Layout from "../components/Layout.jsx";

export default function Transactions() {
  function onExportPrint() {
    window.print();
  }

  return (
    <Layout>
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 className="text-2xl font-bold mb-0">Transactions</h1>

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
        >
          Export / Print
        </button>
      </div>

      <div className="print-area">
        <p className="text-gray-700">
          Transactions list and filters will appear here.
        </p>
        <p className="text-gray-700">
          Use <b>Export / Print</b> to print or <b>Save as PDF</b>.
        </p>
      </div>
    </Layout>
  );
}