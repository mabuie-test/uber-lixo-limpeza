const ServiceRequest = require("../models/ServiceRequest");
const Worker = require("../models/Worker");
const PriceRule = require("../models/PriceRule");
const { getIO } = require("../config/socket");
const { haversineDistanceKm } = require("../utils/geoUtils");

exports.createRequest = async (req, res) => {
  try {
    const { type, details, location, scheduledAt } = req.body;
    // location = { type: "Point", coordinates: [lng, lat] }
    const price = await calculatePrice(type, details, location, scheduledAt);

    const service = await ServiceRequest.create({
      userId: req.user._id,
      type,
      details,
      location,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      price
    });

    const io = getIO();

    // If immediate: notify nearby active workers
    if (!scheduledAt) {
      const nearbyWorkers = await Worker.find({
        status: "active",
        location: {
          $nearSphere: { $geometry: location, $maxDistance: 5000 } // 5km
        }
      });
      nearbyWorkers.forEach(w => {
        io.to(w.userId.toString()).emit("new_request", service);
      });
    } else {
      // scheduled: inform workers (optionally add to calendar)
      io.emit("new_scheduled_request", service);
    }

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar pedido" });
  }
};

async function calculatePrice(type, details, location, scheduledAt) {
  // simple price calculation using PriceRule collection
  const rule = await PriceRule.findOne({ serviceType: type });
  let price = 0;
  if (rule) {
    // apply parameter-based pricing
    if (rule.parameters && rule.parameters.length) {
      for (const p of rule.parameters) {
        if (details && details[p.name] && details[p.name] === p.value) {
          price += p.price;
        }
      }
    }
    // distance price: calculate distance from a "base" point or from nearest worker? We'll compute from city center 0,0 as fallback
    // Here we just don't add distance by default; front-end may supply distance
    // Apply urgency multiplier
    if (details && details.urgency && rule.urgencyMultiplier) price *= rule.urgencyMultiplier;
  } else {
    // fallback
    price = 100; // default base
  }
  return price;
}

exports.getNearbyWorkers = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;
    if (!lng || !lat) return res.status(400).json({ message: "lng/lat necessários" });
    const workers = await Worker.find({
      status: "active",
      location: {
        $nearSphere: { $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(maxDistance) }
      }
    }).limit(50);
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar prestadores próximos" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params; // service id
    const service = await ServiceRequest.findById(id);
    if (!service) return res.status(404).json({ message: "Pedido não encontrado" });
    if (service.status !== "requested") return res.status(400).json({ message: "Pedido não disponível" });

    // set worker
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(403).json({ message: "Prestador não encontrado/ativo" });

    service.workerId = worker._id;
    service.status = "assigned";
    service.assignedAt = new Date();
    await service.save();

    const io = getIO();
    // notify user
    io.to(service.userId.toString()).emit("request_accepted", { serviceId: service._id, worker });
    // notify worker only to its room
    io.to(worker.userId.toString()).emit("assigned_confirmed", service);

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao aceitar pedido" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["in_route","in_progress","completed","cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Status inválido" });

    const service = await ServiceRequest.findById(id);
    if (!service) return res.status(404).json({ message: "Pedido não encontrado" });

    service.status = status;
    if (status === "in_route") service.startedAt = null;
    if (status === "in_progress") service.startedAt = new Date();
    if (status === "completed") {
      service.completedAt = new Date();
    }
    await service.save();

    const io = getIO();
    io.to(service.userId.toString()).emit("status_update", { serviceId: service._id, status });
    io.emit("service_update", service); // admin/dashboard

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar status" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await ServiceRequest.find({ userId }).populate("workerId", "userId serviceTypes rating");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar histórico" });
  }
};