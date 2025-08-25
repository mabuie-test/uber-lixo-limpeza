const User = require("../models/User");
const Worker = require("../models/Worker");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    if (!phone || !phone.startsWith("+258")) return res.status(400).json({ message: "Número deve iniciar com +258" });
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: "Número já cadastrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, email, passwordHash, role: role || "user" });

    if (role === "worker") {
      await Worker.create({ userId: user._id, serviceTypes: [], status: "pending_documents" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no registro" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "Credenciais inválidas" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Credenciais inválidas" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no login" });
  }
};

exports.profile = async (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, phone: user.phone, role: user.role, email: user.email });
};
