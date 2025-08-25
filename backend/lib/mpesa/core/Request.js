const axios = require("axios");
const Cryptor = require("./Cryptor");

class Request {
  constructor(api_key, public_key, ssl = true) {
    this.ssl = ssl;
    this.public_key = public_key;
    this.api_key = api_key;
  }

  async get(url, params) {
    const headers = {
      "Content-Type": "application/json",
      "Origin": "*",
      "Authorization": "Bearer " + Cryptor.token(this.public_key, this.api_key)
    };
    try {
      const request = await axios.get(url, { params, headers });
      return request.data;
    } catch (ex) {
      if (ex.response && ex.response.data) return ex.response.data;
      throw ex;
    }
  }

  async post(url, params) {
    const length = JSON.stringify(params).length || 0;
    const headers = {
      "Content-Length": length,
      "Content-Type": "application/json",
      "Origin": "*",
      "Authorization": "Bearer " + Cryptor.token(this.public_key, this.api_key)
    };
    try {
      const request = await axios.post(url, params, { headers });
      return request.data;
    } catch (ex) {
      if (ex.response && ex.response.data) return ex.response.data;
      throw ex;
    }
  }

  async put(url, params) {
    const length = JSON.stringify(params).length || 0;
    const headers = {
      "Content-Length": length,
      "Content-Type": "application/json",
      "Origin": "*",
      "Authorization": "Bearer " + Cryptor.token(this.public_key, this.api_key)
    };
    try {
      const request = await axios.put(url, params, { headers });
      return request.data;
    } catch (ex) {
      if (ex.response && ex.response.data) return ex.response.data;
      throw ex;
    }
  }
}

module.exports = Request;