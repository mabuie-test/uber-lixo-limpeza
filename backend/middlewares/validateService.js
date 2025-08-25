const Worker = require("../models/Worker");

module.exports = async (req, res, next) => {
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) return res.status(403).json({ message: "Não és um prestador" });
  if (worker.status !== "active") return res.status(403).json({ message: "Prestador não ativo" });
  req.worker = worker;
  next();
};
