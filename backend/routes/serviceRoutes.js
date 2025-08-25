const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const auth = require("../middlewares/authMiddleware");
const validateService = require("../middlewares/validateService");

router.post("/request", auth, validateService, serviceController.createRequest);
router.get("/nearby", auth, serviceController.getNearbyWorkers);
router.patch("/accept/:id", auth, serviceController.acceptRequest);
router.patch("/status/:id", auth, serviceController.updateStatus);
router.get("/history", auth, serviceController.getHistory);

module.exports = router;

