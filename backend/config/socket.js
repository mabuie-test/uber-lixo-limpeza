const { Server } = require("socket.io");

let io = null;
const userSocketMap = new Map(); // userId -> socket.id

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("register", ({ userId, role }) => {
      if (!userId) return;
      userSocketMap.set(userId.toString(), socket.id);
      socket.join(userId.toString()); // room by userId
      if (role === "worker") socket.join("workers"); // room for all active workers
      console.log(`registered socket ${socket.id} for user ${userId} role=${role}`);
    });

    socket.on("worker_location", (data) => {
      // data: { workerId, coords: {lat, lng} }
      if (data && data.workerId) {
        io.to(data.workerId.toString()).emit("driver_location", data);
      }
    });

    socket.on("disconnect", () => {
      // remove from map
      for (const [userId, sid] of userSocketMap.entries()) {
        if (sid === socket.id) userSocketMap.delete(userId);
      }
      console.log("Socket desconectado:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io não inicializado");
  return io;
};

module.exports = { initSocket, getIO, userSocketMap };

