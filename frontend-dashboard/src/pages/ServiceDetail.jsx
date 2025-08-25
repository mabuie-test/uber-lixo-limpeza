import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import MapView from "../components/MapView";

export default function ServiceDetail({ user }) {
  const { id } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/services/history`);
        const s = (res.data || []).find(x => x._id === id);
        if (s) setService(s);
        else {
          const full = await api.get(`/api/services/history`);
          setService(full.data.find(x => x._id === id));
        }
      } catch (err) { console.warn(err); }
    })();
  }, [id]);

  if (!service) return <div>Carregando...</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2>Pedido {service._id}</h2>
      <div className="card">
        <div><strong>Tipo:</strong> {service.type}</div>
        <div><strong>Status:</strong> {service.status}</div>
        <div><strong>Preço:</strong> {service.price}</div>
        <div><strong>Detalhes:</strong> <pre>{JSON.stringify(service.details, null, 2)}</pre></div>
        <div style={{ height: 300 }}>
          <MapView services={[service]} />
        </div>
      </div>
    </div>
  );
}

