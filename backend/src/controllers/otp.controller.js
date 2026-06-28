import bcrypt from "bcrypt";
import { dbMySQL } from "../config/mysql.js";

const saveSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const verifyOTP = async (req, res) => {
  try {
    const { OTP } = req.body;

    const enteredOTP = String(OTP || "").trim();

    if (!enteredOTP) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const pendingLogin = req.session.pendingLogin;

    if (!pendingLogin) {
      return res.status(401).json({ error: "No OTP session found" });
    }

    if (typeof pendingLogin.otpAttempts !== "number") {
      pendingLogin.otpAttempts = 0;
    }

    if (!pendingLogin.otpHash || !pendingLogin.otpExpiresAt) {
      delete req.session.pendingLogin;
      await saveSession(req);

      return res.status(401).json({ error: "Invalid OTP session" });
    }

    if (Date.now() > pendingLogin.otpExpiresAt) {
      delete req.session.pendingLogin;
      await saveSession(req);

      return res.status(401).json({ error: "OTP expired" });
    }

    if (pendingLogin.otpAttempts >= 5) {
      delete req.session.pendingLogin;
      await saveSession(req);

      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    const otpIsValid = await bcrypt.compare(enteredOTP, pendingLogin.otpHash);

    if (!otpIsValid) {
      pendingLogin.otpAttempts += 1;
      req.session.pendingLogin = pendingLogin;

      await saveSession(req);

      return res.status(401).json({
        error: "Invalid OTP",
        attemptsLeft: 5 - pendingLogin.otpAttempts,
      });
    }

    const [cryptoKeys] = await dbMySQL.query(
      `
  SELECT id 
  FROM user_crypto_keys 
  WHERE user_id = ? AND revoked = FALSE 
  LIMIT 1
  `,
      [pendingLogin.UserID],
    );

    pendingLogin.otpVerified = true;
    pendingLogin.otpVerifiedAt = Date.now();

    delete pendingLogin.otpHash;
    delete pendingLogin.otpExpiresAt;
    delete pendingLogin.otpAttempts;

    req.session.pendingLogin = pendingLogin;

    await saveSession(req);

    if (cryptoKeys.length === 0) {
      return res.status(200).json({
        success: true,
        message: "OTP verified. Please register this device.",
        nextStep: "register-device",
        redirectTo: "http://localhost:5500/frontend/registerDevice.html",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified. Continue to cryptographic verification.",
      nextStep: "crypto-verification",
      redirectTo: "http://localhost:5500/frontend/cryptoVerify.html",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};
