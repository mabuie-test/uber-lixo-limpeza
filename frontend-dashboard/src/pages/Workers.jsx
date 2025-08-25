// src/pages/Workers.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import WorkerApproval from "../components/WorkerApproval";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // buscar prestadores pendentes (endpoint backend: GET /api/workers/pending)
  // Se o teu backend usa outro endpoint, ajusta aqui.
  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/workers/pending");
      setWorkers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar prestadores: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();

    // opcional: podes subscrever socket para atualizações em tempo real
    // import socketClient e socketClient.on("worker_documents_submitted", ...) se quiseres
  }, []);

  const handleDecision = (workerId, action) => {
    // remove da lista ou atualizar
    setWorkers(prev => prev.filter(w => w._id !== workerId));
    // opcional: mostra mensagem
    if (action === "approved") alert("Prestador aprovado");
    if (action === "rejected") alert("Prestador rejeitado");
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Prestadores — Aprovação de Documentos</h2>

      {loading && <div>Carregando prestadores pendentes...</div>}
      {!loading && workers.length === 0 && <div>Sem prestadores pendentes.</div>}

      <div style={{ marginTop: 12 }}>
        {workers.map(worker => (
          <WorkerApproval key={worker._id} worker={worker} onDecision={handleDecision} />
        ))}
      </div>
    </div>
  );
}