
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middlewares/authMiddleware");

// admin-only ideally; role-check should be added
router.get("/basic", auth, reportController.basicStats);

module.exports = router;

