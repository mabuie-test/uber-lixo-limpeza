import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function RatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [workerId, setWorkerId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    // optionally load recent ratings
  }, []);

  const submit = async () => {
    try {
      const res = await api.post("/api/ratings/rate", { requestId, workerId, rating: score, comment });
      alert("Avaliação salva");
    } catch (err) {
      alert("Erro: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchWorker = async () => {
    if (!workerId) return;
    try {
      const res = await api.get(`/api/ratings/worker/${workerId}`);
      setRatings(res.data || []);
    } catch (err) {
      alert("Erro: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Avaliações</h2>
      <div className="card">
        <label>Worker ID</label>
        <input value={workerId} onChange={e => setWorkerId(e.target.value)} />
        <label>Request ID</label>
        <input value={requestId} onChange={e => setRequestId(e.target.value)} />
        <label>Nota (1-5)</label>
        <input type="number" value={score} min={1} max={5} onChange={e => setScore(Number(e.target.value))} />
        <label>Comentário</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button onClick={submit}>Enviar Avaliação</button>
          <button onClick={fetchWorker} style={{ marginLeft: 8 }}>Carregar Avaliações do Prestador</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Lista</h3>
        {ratings.map(r => (
          <div key={r._id} className="card" style={{ marginBottom: 8 }}>
            <div><strong>{r.rating}★</strong> — {r.comment}</div>
            <div><small>{new Date(r.createdAt).toLocaleString()}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
