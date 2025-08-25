import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function CreateService({ user }) {
  const [type, setType] = useState("waste");
  const [details, setDetails] = useState({});
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const nav = useNavigate();

  const create = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type,
        details,
        location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        scheduledAt: scheduledAt || null
      };
      const res = await api.post("/api/services/request", payload);
      alert("Pedido criado");
      nav("/services");
    } catch (err) {
      alert("Erro: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Criar Pedido</h2>
      <form onSubmit={create} className="card" style={{ padding: 12 }}>
        <label>Tipo</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="waste">Coleta de Lixo</option>
          <option value="cleaning">Limpeza</option>
          <option value="garden">Jardinagem</option>
        </select>

        <label>Detalhes (JSON rápido)</label>
        <textarea rows={4} value={JSON.stringify(details)} onChange={e => {
          try { setDetails(JSON.parse(e.target.value)); } catch { /* ignore parse errors while typing */ }
        }} />

        <label>Lat</label>
        <input value={lat} onChange={e => setLat(e.target.value)} placeholder="-25.9692" />
        <label>Lng</label>
        <input value={lng} onChange={e => setLng(e.target.value)} placeholder="32.5732" />

        <label>Agendar (opcional)</label>
        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />

        <div style={{ marginTop: 8 }}>
          <button type="submit">Criar</button>
        </div>
      </form>
    </div>
  );
}
