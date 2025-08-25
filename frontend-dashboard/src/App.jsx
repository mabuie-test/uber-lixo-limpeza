import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServicesPage from "./pages/Services";
import CreateService from "./pages/CreateService";
import ServiceDetail from "./pages/ServiceDetail";
import WorkersPage from "./pages/Workers";
import PaymentsPage from "./pages/Payments";
import RatingsPage from "./pages/Ratings";
import ReportsPage from "./pages/Reports";
import Profile from "./pages/Profile";
import api from "./utils/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
  }, [token]);

  const onLogin = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/" element={token && user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} />
        <Route path="/services" element={token && user ? <ServicesPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/services/create" element={token && user ? <CreateService user={user} /> : <Navigate to="/login" />} />
        <Route path="/services/:id" element={token && user ? <ServiceDetail user={user} /> : <Navigate to="/login" />} />
        <Route path="/workers" element={token && user ? <WorkersPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/payments" element={token && user ? <PaymentsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/ratings" element={token && user ? <RatingsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/reports" element={token && user ? <ReportsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token && user ? <Profile user={user} logout={logout} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
