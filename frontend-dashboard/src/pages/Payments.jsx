import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [serviceId, setServiceId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/reports/basic");
        // For demo we do not have payments list endpoint; adapt backend if needed.
      } catch (err) { /* ignore */ }
    })();
  }, []);

  const initiate = async () => {
    try {
      const res = await api.post("/api/payments/initiate", { requestId: serviceId });
      alert("Pagamento iniciado. Resposta: " + JSON.stringify(res.data.mpesaResponse));
    } catch (err) {
      alert("Erro: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Pagamentos</h2>
      <div className="card">
        <label>Service Request ID</label>
        <input value={serviceId} onChange={e => setServiceId(e.target.value)} placeholder="ID do pedido" />
        <button onClick={initiate}>Iniciar Pagamento (C2B)</button>
        <hr/>
        <p>Observação: confirme webhook do M-Pesa apontando para /api/payments/webhook no backend (use ngrok em dev)</p>
      </div>
    </div>
  );
}