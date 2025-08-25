const Worker = require("../models/Worker");
const User = require("../models/User");
const { getIO } = require("../config/socket");

exports.submitDocuments = async (req, res) => {
  // expects files or document fields in body (BI, NUIT)
  try {
    const { BI, NUIT } = req.body;
    let worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: "Prestador não encontrado" });

    worker.documents = { BI, NUIT };
    worker.status = "under_review";
    await worker.save();
    // notify admin via socket
    const io = getIO();
    io.emit("worker_submitted", { workerId: worker._id, userId: req.user._id });
    res.json({ message: "Documentos enviados para revisão", worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no upload de documentos" });
  }
};

exports.approveWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Prestador não encontrado" });
    worker.status = "active";
    await worker.save();
    const io = getIO();
    io.to(worker.userId.toString()).emit("worker_approved", { workerId: worker._id });
    res.json({ message: "Prestador aprovado", worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao aprovar prestador" });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lng, lat } = req.body;
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: "Prestador não encontrado" });
    worker.location = { type: "Point", coordinates: [lng, lat] };
    worker.lastSeen = new Date();
    await worker.save();

    // emit location to user rooms interested (optional)
    const io = getIO();
    io.emit("worker_location_update", { workerId: worker._id, coords: { lng, lat } });

    res.json({ message: "Localização atualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar localização" });
  }
};

exports.getPendingWorkers = async (req, res) => {
  try {
    const pending = await Worker.find({ status: { $in: ["under_review", "pending_documents"] } }).populate("userId", "name phone email");
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar prestadores pendentes" });
  }
};

