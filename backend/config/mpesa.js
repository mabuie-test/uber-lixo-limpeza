// backend/config/mpesa.js
const path = require("path");
const MpesaLib = require(path.join(__dirname, "..", "lib", "mpesa")); // ../lib/mpesa
const dotenv = require("dotenv");
dotenv.config();

const env = process.env.MPESA_ENVIRONMENT || "development";
const api_key = process.env.MPESA_API_KEY;
const public_key = process.env.MPESA_PUBLIC_KEY;

const mpesa = MpesaLib.init(api_key, public_key, env, true);

module.exports = mpesa;