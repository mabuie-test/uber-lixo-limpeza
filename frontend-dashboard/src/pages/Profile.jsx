import React from "react";
import { Link } from "react-router-dom";

export default function Profile({ user, logout }) {
  return (
    <div style={{ padding: 12 }}>
      <h2>Perfil</h2>
      <div className="card">
        <div><strong>Nome:</strong> {user.name}</div>
        <div><strong>Telefone:</strong> {user.phone}</div>
        <div><strong>Role:</strong> {user.role}</div>
        <div style={{ marginTop: 8 }}>
          <Link to="/services/create"><button>Testar Criar Pedido</button></Link>
          <button onClick={logout} style={{ marginLeft: 8 }}>Sair</button>
        </div>
      </div>
    </div>
  );
}