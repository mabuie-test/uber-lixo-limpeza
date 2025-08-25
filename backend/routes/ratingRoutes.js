const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const auth = require("../middlewares/authMiddleware");

router.post("/rate", auth, ratingController.createRating);
router.get("/worker/:id", auth, ratingController.getWorkerRatings);

module.exports = router;

