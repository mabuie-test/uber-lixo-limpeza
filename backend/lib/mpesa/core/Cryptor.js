const crypto = require("crypto");

class Cryptor {
  static token(public_key, api_key) {
    // public_key pode ser PEM ou base64 DER. Se for PEM, usa direto; se for base64, converte para PEM
    let pem;
    if (!public_key) throw new Error("public_key required");
    if (public_key.trim().startsWith("-----BEGIN")) {
      pem = public_key;
    } else {
      // assume base64 DER
      const public_key_decoded = Buffer.from(public_key, "base64");
      pem = Cryptor.der2pem(public_key_decoded);
    }
    const new_key = crypto.createPublicKey(pem);
    const crypted = crypto.publicEncrypt(
      {
        key: new_key,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(api_key)
    );
    return crypted.toString("base64");
  }

  /* Convert Der to Pem */
  static der2pem = (der_data) => {
    const pem = Buffer.from(der_data).toString("base64");
    const formattedPem = pem.match(/.{1,64}/g).join("\n");
    return `-----BEGIN PUBLIC KEY-----\n${formattedPem}\n-----END PUBLIC KEY-----\n`;
  };

  static getId = (length = 8) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
  };
}

module.exports = Cryptor;