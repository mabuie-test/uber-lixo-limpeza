const Request = require("./Request");

class Transaction {
  constructor(api_key, public_key, environment = "development", ssl = true) {
    this.api_key = api_key;
    this.public_key = public_key;
    this.ssl = ssl;
    this.is_production = environment === "production";
    this.base_url = this.is_production ? "api.vm.co.mz" : "api.sandbox.vm.co.mz";
  }

  async c2b(data) {
    const url = `https://${this.base_url}:18352/ipg/v1x/c2bPayment/singleStage/`;
    const params = {
      input_Amount: data.value,
      input_CustomerMSISDN: data.client_number,
      input_ServiceProviderCode: data.agent_id,
      input_TransactionReference: data.transaction_reference,
      input_ThirdPartyReference: data.third_party_reference
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.post(url, params);
    return response;
  }

  async b2c(data) {
    const url = `https://${this.base_url}:18345/ipg/v1x/b2cPayment/`;
    const params = {
      input_Amount: data.value,
      input_CustomerMSISDN: data.client_number,
      input_ServiceProviderCode: data.agent_id,
      input_TransactionReference: data.transaction_reference,
      input_ThirdPartyReference: data.third_party_reference
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.post(url, params);
    return response;
  }

  async b2b(data) {
    const url = `https://${this.base_url}:18349/ipg/v1x/b2bPayment/`;
    const params = {
      input_PrimaryPartyCode: data.agent_id,
      input_ReceiverPartyCode: data.agent_receiver_id,
      input_Amount: data.value,
      input_TransactionReference: data.transaction_reference,
      input_ThirdPartyReference: data.third_party_reference
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.post(url, params);
    return response;
  }

  async reversal(data) {
    const url = `https://${this.base_url}:18354/ipg/v1x/reversal/`;
    const params = {
      input_TransactionID: data.transaction_id,
      input_SecurityCredential: data.security_credential,
      input_InitiatorIdentifier: data.indicator_identifier,
      input_ThirdPartyReference: data.third_party_reference,
      input_ServiceProviderCode: data.agent_id,
      input_ReversalAmount: data.value
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.put(url, params);
    return response;
  }

  async status(data) {
    const url = `https://${this.base_url}:18353/ipg/v1x/queryTransactionStatus/`;
    const params = {
      input_QueryReference: data.transaction_id,
      input_ThirdPartyReference: data.third_party_reference,
      input_ServiceProviderCode: data.agent_id
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.get(url, params);
    return response;
  }

  async customer_name(data) {
    const url = `https://${this.base_url}:19323/ipg/v1x/queryCustomerName/`;
    const params = {
      input_CustomerMSISDN: data.client_number,
      input_ThirdPartyReference: data.third_party_reference,
      input_ServiceProviderCode: data.agent_id
    };
    const request = new Request(this.api_key, this.public_key, this.ssl);
    const response = await request.get(url, params);
    return response;
  }
}

module.exports = Transaction;