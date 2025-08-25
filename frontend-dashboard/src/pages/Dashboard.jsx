import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapView";
import socketClient from "../sockets/socketClient";
import api from "../utils/api";

export default function Dashboard({ user, logout }) {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    socketClient.connect();
    socketClient.register(user.id, user.role);

    socketClient.on("new_request", (service) => setServices(prev => [service, ...prev]));
    socketClient.on("request_accepted", (data) => {
      setServices(prev => prev.map(s => s._id === data.serviceId ? { ...s, status: "assigned", worker: data.worker } : s));
    });
    socketClient.on("status_update", ({ serviceId, status }) => {
      setServices(prev => prev.map(s => s._id === serviceId ? { ...s, status } : s));
    });

    (async () => {
      try {
        const [sRes, rRes] = await Promise.all([api.get("/api/services/history"), api.get("/api/reports/basic")]);
        setServices(sRes.data || []);
        setStats(rRes.data || {});
      } catch (err) {
        console.warn(err);
      }
    })();

    return () => socketClient.disconnect();
  }, [user]);

  return (
    <div>
      <header className="topbar">
        <h1>Uber-Lixo & Limpeza</h1>
        <nav>
          <Link to="/services">Serviços</Link>{" | "}
          <Link to="/workers">Prestadores</Link>{" | "}
          <Link to="/payments">Pagamentos</Link>{" | "}
          <Link to="/ratings">Avaliações</Link>{" | "}
          <Link to="/reports">Relatórios</Link>{" | "}
          <Link to="/profile">Perfil</Link>{" | "}
          <button onClick={logout}>Sair</button>
        </nav>
      </header>

      <main className="layout">
        <aside className="left">
          <div className="card">
            <h3>Resumo</h3>
            <div>Total serviços: {stats.totalServices ?? "-"}</div>
            <div>Concluídos: {stats.completed ?? "-"}</div>
            <div>Receita: {stats.totalRevenue ?? "0"}</div>
            <Link to="/services/create"><button style={{ marginTop: 8 }}>Criar Pedido (teste)</button></Link>
          </div>
        </aside>

        <section className="center">
          <MapView services={services} />
        </section>

        <aside className="right">
          <div className="card">
            <h3>Últimos Pedidos</h3>
            {services.slice(0,10).map(s => (
              <div key={s._id} style={{ borderBottom: "1px solid #efefef", padding: 8 }}>
                <strong>{s.type}</strong> — {s.status}<br/>
                Preço: {s.price ?? "-"}<br/>
                <small>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : "Imediato"}</small><br/>
                <Link to={`/services/${s._id}`}>Detalhes</Link>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

