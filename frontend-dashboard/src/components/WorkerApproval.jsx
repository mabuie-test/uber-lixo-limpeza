// src/components/WorkerApproval.jsx
import React from "react";
import api from "../utils/api";

/**
 * Componente para mostrar um worker (pendente) com BI/NUIT e permitir aprovar/rejeitar.
 *
 * Props:
 * - worker: objeto worker do backend
 * - onDecision: função (workerId, action) chamada após aprovar/rejeitar (para atualizar UI)
 */
export default function WorkerApproval({ worker, onDecision }) {
  if (!worker) return null;

  // base para formar URLs absolutas se backend guardar caminhos relativos (ex: /uploads/...)
  const BASE = process.env.REACT_APP_API_URL || (api.defaults.baseURL || "");

  const resolveUrl = (maybePath) => {
    if (!maybePath) return null;
    if (maybePath.startsWith("http://") || maybePath.startsWith("https://")) return maybePath;
    // garantir slash entre base e path
    return `${BASE.replace(/\/+$/, "")}${maybePath.startsWith("/") ? "" : "/"}${maybePath}`;
  };

  const biUrl = resolveUrl(worker.biUrl);
  const nuitUrl = resolveUrl(worker.nuitUrl);

  const approve = async () => {
    try {
      await api.patch(`/api/admin/workers/approve/${worker._id}`);
      if (onDecision) onDecision(worker._id, "approved");
    } catch (err) {
      console.error(err);
      alert("Erro ao aprovar: " + (err.response?.data?.message || err.message));
    }
  };

  const reject = async () => {
    const notes = prompt("Motivo da rejeição (opcional):");
    try {
      await api.patch(`/api/admin/workers/reject/${worker._id}`, { notes });
      if (onDecision) onDecision(worker._id, "rejected");
    } catch (err) {
      console.error(err);
      alert("Erro ao rejeitar: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <div><strong>{worker.userId?.name || "Prestador"}</strong></div>
        <div style={{ color: "#666", fontSize: 13 }}>{worker.userId?.phone || ""}</div>
        <div style={{ marginTop: 8 }}>
          <small>Serviços: {worker.serviceTypes?.join(", ") || "-"}</small>
        </div>
        <div style={{ marginTop: 8 }}>
          <small>Status doc.: {worker.documentsStatus || "—"}</small>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {biUrl ? (
          <img src={biUrl} alt="BI" style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />
        ) : (
          <div style={{ width: 140, height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", color:"#999", borderRadius:6 }}>Sem BI</div>
        )}
        {nuitUrl ? (
          <img src={nuitUrl} alt="NUIT" style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />
        ) : (
          <div style={{ width: 140, height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", color:"#999", borderRadius:6 }}>Sem NUIT</div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={approve}>Aprovar</button>
        <button onClick={reject} style={{ background: "#e11", marginTop: 4 }}>Rejeitar</button>
      </div>
    </div>
  );
}