import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function ServicesPage({ user }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/services/history");
        setServices(res.data || []);
      } catch (err) { console.warn(err); }
    })();
  }, []);

  const accept = async (id) => {
    try {
      await api.patch(`/api/services/accept/${id}`);
      alert("Pedido aceito");
      setServices(prev => prev.map(s => s._id === id ? { ...s, status: "assigned" } : s));
    } catch (err) {
      alert("Erro: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Serviços</h2>
      <Link to="/services/create"><button>Criar Pedido</button></Link>
      <div style={{ marginTop: 12 }}>
        {services.map(s => (
          <div key={s._id} className="card" style={{ marginBottom: 8 }}>
            <strong>{s.type}</strong> — {s.status}<br/>
            Preço: {s.price || "-"} — Agendado: {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : "Imediato"}
            <div style={{ marginTop: 8 }}>
              <Link to={`/services/${s._id}`}>Detalhes</Link>{" "}
              {s.status === "requested" && <button onClick={() => accept(s._id)}>Aceitar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

