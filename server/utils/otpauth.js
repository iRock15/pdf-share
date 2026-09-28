const OTPAuth = require("otpauth");

const otpauth = (label, base32) => {
  let totp = new OTPAuth.TOTP({
    issuer: "PDF Share",

    label: label,

    algorithm: "SHA1",

    digits: 6,

    period: 30,

    secret: OTPAuth.Secret.fromBase32(base32),
  });
  return totp;
};

/*
 let totp = new OTPAuth.TOTP({
      issuer: "PDF Share",

      label: req.user.email,

      algorithm: "SHA1",

      digits: 6,

      period: 30,

      secret: OTPAuth.Secret.fromBase32(temp_base32),
    });
    */
