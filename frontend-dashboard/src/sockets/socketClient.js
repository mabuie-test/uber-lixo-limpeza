import { io } from "socket.io-client";
import api from "./../utils/api";

const SERVER = process.env.REACT_APP_API_URL || "http://localhost:4000";
let socket = null;

const connect = () => {
  if (socket && socket.connected) return socket;
  socket = io(SERVER, { transports: ["websocket"] });
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) socket.emit("register", { userId: user.id, role: user.role });
  });
  socket.on("disconnect", () => console.log("Socket disconnected"));
  socket.on("connect_error", (err) => console.warn("Socket error", err.message));
  return socket;
};

const register = (userId, role) => {
  if (!socket) connect();
  socket.emit("register", { userId, role });
};

const on = (event, cb) => {
  if (!socket) connect();
  socket.on(event, cb);
};

const emit = (event, data) => {
  if (!socket) connect();
  socket.emit(event, data);
};

const disconnect = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

export default { connect, register, on, emit, disconnect };

