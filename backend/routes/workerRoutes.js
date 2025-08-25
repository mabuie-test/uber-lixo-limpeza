const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const auth = require("../middlewares/authMiddleware");

// worker endpoints
router.post("/submit-documents", auth, workerController.submitDocuments); // worker sends BI/NUIT
router.patch("/update-location", auth, workerController.updateLocation);
router.get("/pending", auth, workerController.getPendingWorkers); // admin should handle auth role in controller or middleware
router.patch("/approve/:workerId", auth, workerController.approveWorker); // admin approves

module.exports = router;
