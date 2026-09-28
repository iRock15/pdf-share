const crypto = require("crypto");
const base32 = require("hi-base32");

function generateRandomBase64(length) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric characters if needed
    .slice(0, length);
}

function generateBase32() {
  const buffer = crypto.randomBytes(20);

  // 2. Encode the buffer directly to Base32
  const base32String = base32.encode(buffer).replace(/=/g, "");

  return base32String;
}

function generateRandomCodes(numCodes = 5) {
  const codes = [];
  for (let i = 0; i < numCodes; i++) {
    const randomString = crypto
      .randomBytes(8)
      .toString("base64url") // Uses a-z, A-Z, 0-9, "-", and "_"
      .substring(0, 8);
    codes.push(randomString.replaceAll("_", "@"));
  }
  return codes;
}

module.exports = { generateRandomCodes, generateRandomBase64, generateBase32 };
