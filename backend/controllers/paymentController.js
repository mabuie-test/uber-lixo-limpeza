const Payment = require("../models/Payment");
const ServiceRequest = require("../models/ServiceRequest");
const mpesa = require("../config/mpesa");
const dotenv = require("dotenv");
dotenv.config();
const { getIO } = require("../config/socket");

const AGENT_ID = process.env.MPESA_AGENT_ID || "000000";

exports.initiateC2B = async (req, res) => {
  try {
    const { requestId } = req.body;
    const service = await ServiceRequest.findById(requestId);
    if (!service) return res.status(404).json({ message: "Pedido não existe" });

    const amount = service.price;
    const client = req.user.phone;
    const transaction_reference = `SRV-${requestId}-${Date.now()}`;
    const third_party_reference = `APP-${requestId}`;

    // create payment record pending
    const payment = await Payment.create({
      requestId,
      userId: req.user._id,
      workerId: service.workerId,
      amount,
      client_number: client,
      agent_id: AGENT_ID,
      transaction_reference,
      third_party_reference,
      status: "pending"
    });

    // call mpesa c2b
    const payload = {
      value: amount,
      client_number: client,
      agent_id: AGENT_ID,
      transaction_reference,
      third_party_reference
    };

    const resp = await mpesa.c2b(payload);
    // response from provider stored for auditing
    // Some providers immediately return, others respond via webhook
    // we save response in payment.updatedAt and return details to client
    payment.updatedAt = new Date();
    await payment.save();

    res.json({ message: "C2B initiated", mpesaResponse: resp, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao iniciar pagamento" });
  }
};

exports.mpesaWebhook = async (req, res) => {
  // M-Pesa will call this URL with a JSON body containing transaction details
  // Implementation depends on M-Pesa provider payload - adapt as needed
  try {
    const body = req.body;
    // Example fields assumed: ThirdPartyReference, TransactionID, Status, Amount, MSISDN
    const thirdPartyReference = body?.input_ThirdPartyReference || body?.ThirdPartyReference || body?.ThirdPartyRef;
    const transactionId = body?.TransactionID || body?.TransactionID || body?.input_TransactionID;
    const status = (body?.Status || body?.status || "UNKNOWN").toLowerCase();
    const amount = body?.Amount || body?.input_Amount || 0;
    const msisdn = body?.MSISDN || body?.input_CustomerMSISDN || body?.msisdn;

    if (!thirdPartyReference) {
      console.warn("Webhook sem ThirdPartyReference:", body);
      return res.status(400).json({ message: "Missing reference" });
    }

    const payment = await Payment.findOne({ third_party_reference: thirdPartyReference });
    if (!payment) {
      console.warn("Pagamento nao encontrado para ref", thirdPartyReference);
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment depending on status
    if (status.includes("success") || status === "success" || body?.responseCode === "0") {
      payment.status = "paid";
      payment.mpesa_transaction_id = transactionId || body.transaction_id;
      payment.updatedAt = new Date();
      await payment.save();

      // update service request if needed
      const service = await ServiceRequest.findById(payment.requestId);
      if (service) {
        // optionally change status to assigned/in_progress; but we keep separate flow
        // notify worker and user
        const io = getIO();
        io.to(service.userId.toString()).emit("payment_confirmed", { requestId: service._id, paymentId: payment._id });
        io.to(payment.workerId?.toString()).emit("payment_confirmed", { requestId: service._id, paymentId: payment._id });
      }
    } else {
      payment.status = "failed";
      payment.updatedAt = new Date();
      await payment.save();
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Erro webhook mpesa:", err);
    res.status(500).json({ message: "Erro ao processar webhook" });
  }
};

exports.payoutToWorker = async (workerId, amount, description = "Pagamento serviço") => {
  // internal: perform B2C payment to worker after completion (optional)
  try {
    const worker = await require("../models/Worker").findById(workerId).populate("userId");
    if (!worker) throw new Error("Worker not found");
    const msisdn = worker.userId.phone;
    const transaction_reference = `PAYOUT-${workerId}-${Date.now()}`;
    const third_party_reference = `PAYOUT_APP-${workerId}-${Date.now()}`;

    const payload = {
      value: amount,
      client_number: msisdn,
      agent_id: AGENT_ID,
      transaction_reference,
      third_party_reference
    };

    const resp = await mpesa.b2c(payload);
    return resp;
  } catch (err) {
    console.error("Erro B2C:", err);
    throw err;
  }
};