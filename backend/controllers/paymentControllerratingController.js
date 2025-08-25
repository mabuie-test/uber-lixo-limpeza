const Rating = require("../models/Rating");
const Worker = require("../models/Worker");

exports.createRating = async (req, res) => {
  try {
    const { requestId, workerId, rating, comment } = req.body;
    const newRating = await Rating.create({
      requestId,
      userId: req.user._id,
      workerId,
      rating,
      comment
    });

    // update worker average
    const worker = await Worker.findById(workerId);
    if (worker) {
      const all = await Rating.find({ workerId });
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      worker.rating = avg;
      worker.ratingCount = all.length;
      await worker.save();
    }

    res.json({ message: "Avaliação salva", rating: newRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao salvar avaliação" });
  }
};

exports.getWorkerRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const ratings = await Rating.find({ workerId: id }).populate("userId", "name phone");
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar avaliações" });
  }
};
