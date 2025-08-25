// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const dbConnect = require("./config/db");
const { initSocket } = require("./config/socket");
const errorHandler = require("./middlewares/errorHandler");

// rotas existentes
const authRoutes = require("./routes/authRoutes");
const workerRoutes = require("./routes/workerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const reportRoutes = require("./routes/reportRoutes");

// novas rotas (upload multipart e admin)
const workersDocsRouter = require("./routes/workers-docs");      // <<-- cria com o código que te passei
const adminWorkersRouter = require("./routes/admin-workers");    // <<-- cria com o código que te passei

const app = express();

// middlewares
app.use(cors()); // em produção ajusta origin/credentials conforme necessário
app.use(express.json({ limit: "10mb" })); // aumentei ligeiramente o limite para segurança com payloads maiores
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// servir uploads (imagens) como estático
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes (pré-montagem; o app terá o `io` definido depois que o server for criado)
// mantemos as rotas principais aqui
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);    // rotas já existentes (ex.: worker profile, location)
app.use("/api/services", serviceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);

// monta as novas rotas
// -> rota pública de workers para submit multipart (usa ensureAuth interno)
app.use("/api/workers", workersDocsRouter);
// -> rotas admin para aprovar/rejeitar documentos
app.use("/api/admin/workers", adminWorkersRouter);

// basic route
app.get("/", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

// global error handler (deve vir depois das rotas)
app.use(errorHandler);

// connect db and start server + socket
const start = async () => {
  await dbConnect();

  const server = http.createServer(app);

  // initSocket é sua função que configura Socket.IO e devolve o `io` (assumimos que faz io = new Server(server, opts)).
  const io = initSocket(server);

  // disponibiliza o objeto io para as rotas usando req.app.get('io')
  app.set("io", io);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // opcional: log quando socket conecta (se não tiveres já no initSocket)
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("register", (payload) => {
      // podes registar sockets por userId aqui se necessário
      console.log("socket register:", payload);
    });
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});