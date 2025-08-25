const ServiceRequest = require("../models/ServiceRequest");
const Payment = require("../models/Payment");

exports.basicStats = async (req, res) => {
  try {
    const totalServices = await ServiceRequest.countDocuments();
    const completed = await ServiceRequest.countDocuments({ status: "completed" });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({
      totalServices, completed, pendingPayments, totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro nos relatórios" });
  }
};

