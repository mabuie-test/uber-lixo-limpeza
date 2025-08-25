const Transaction = require("./core/Transaction");

module.exports = {
  init: (api_key, public_key, environment = "development", ssl = true) => {
    return new Transaction(api_key, public_key, environment, ssl);
  }
};