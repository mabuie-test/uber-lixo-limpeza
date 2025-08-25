const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middlewares/authMiddleware");

// user initiates payment (C2B)
router.post("/initiate", auth, paymentController.initiateC2B);

// M-Pesa webhook endpoint - public
router.post("/webhook", express.json(), paymentController.mpesaWebhook);

module.exports = router;

