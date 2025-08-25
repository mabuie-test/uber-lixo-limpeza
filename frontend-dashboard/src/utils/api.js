import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const token = localStorage.getItem("token");
if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export default instance;
