// run: node scripts/test_mpesa.js
const mpesa = require("../config/mpesa");
(async () => {
  try {
    const resp = await mpesa.c2b({
      value: 1, // valor pequeno no sandbox
      client_number: "+258851619970",
      agent_id: process.env.MPESA_AGENT_ID,
      transaction_reference: "TEST-" + Date.now(),
      third_party_reference: "APPTEST"
    });
    console.log("C2B response:", resp);
  } catch (err) {
    console.error("Erro teste mpesa:", err.response?.data || err.message || err);
  }
})();