import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function ReportsPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/reports/basic");
        setStats(res.data || {});
      } catch (err) { console.warn(err); }
    })();
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h2>Relatórios</h2>
      <div className="card">
        <div>Total serviços: {stats.totalServices ?? "-"}</div>
        <div>Concluídos: {stats.completed ?? "-"}</div>
        <div>Pagamentos pendentes: {stats.pendingPayments ?? "-"}</div>
        <div>Receita: {stats.totalRevenue ?? "0"}</div>
      </div>
    </div>
  );
}
