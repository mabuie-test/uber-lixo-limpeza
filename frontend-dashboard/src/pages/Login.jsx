import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("+258");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { phone, password });
      onLogin(res.data.user, res.data.token);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao logar");
    }
  };

  return (
    <div className="login-root">
      <form className="login-box" onSubmit={submit}>
        <h2>Entrar</h2>
        <label>Telefone (prefixo +258)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Entrar</button>
        </div>
      </form>
    </div>
  );
}
