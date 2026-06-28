import { randomBytes, webcrypto } from "crypto";
import { dbMySQL } from "../config/mysql.js";

const subtle = webcrypto.subtle;

const saveSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const regenerateSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const bufferToBase64Url = (buffer) => {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const base64UrlToBuffer = (value) => {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  return Buffer.from(base64, "base64");
};

const getActiveCryptoKey = async (userId, keyId = null) => {
  let query;
  let values;

  if (keyId) {
    query = `
      SELECT id, public_key, key_name, device_name
      FROM user_crypto_keys
      WHERE id = ? AND user_id = ? AND revoked = FALSE
      LIMIT 1
    `;
    values = [keyId, userId];
  } else {
    query = `
      SELECT id, public_key, key_name, device_name
      FROM user_crypto_keys
      WHERE user_id = ? AND revoked = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;
    values = [userId];
  }

  const [rows] = await dbMySQL.query(query, values);

  return rows.length ? rows[0] : null;
};

export const registerCryptoKey = async (req, res) => {
  try {
    const loggedInUserId = req.session.UserID;
    const pendingLogin = req.session.pendingLogin;

    let userId = null;
    let userName = null;
    let shouldCompleteLogin = false;

    if (loggedInUserId) {
      userId = loggedInUserId;
    } else if (pendingLogin && pendingLogin.otpVerified) {
      userId = pendingLogin.UserID;
      userName = pendingLogin.UserName;
      shouldCompleteLogin = true;
    } else {
      return res.status(401).json({
        error: "You must verify OTP before registering this device",
      });
    }

    const {
      publicKey,
      keyName = "Default Key",
      deviceName = "This Device",
    } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required" });
    }

    const publicKeyString =
      typeof publicKey === "string" ? publicKey : JSON.stringify(publicKey);

    const [result] = await dbMySQL.query(
      `
      INSERT INTO user_crypto_keys
        (user_id, public_key, key_name, device_name)
      VALUES
        (?, ?, ?, ?)
      `,
      [userId, publicKeyString, keyName, deviceName],
    );

    const keyId = result.insertId;

    if (shouldCompleteLogin) {
      req.session.UserID = userId;
      req.session.UserName = userName;

      delete req.session.pendingLogin;
    }

    await saveSession(req);

    return res.status(201).json({
      success: true,
      message: "Device registered successfully",
      keyId,
      redirectTo: shouldCompleteLogin
        ? "http://localhost:5500/frontend/homepage.html"
        : null,
    });
  } catch (error) {
    console.error("Crypto key registration error:", error);
    return res.status(500).json({
      error: "Crypto key registration failed",
    });
  }
};

export const createCryptoChallenge = async (req, res) => {
  try {
    const pendingLogin = req.session.pendingLogin;

    if (!pendingLogin) {
      return res.status(401).json({ error: "No pending login found" });
    }

    if (!pendingLogin.otpVerified) {
      return res.status(403).json({
        error: "OTP must be verified before cryptographic verification",
      });
    }

    const { keyId } = req.body;

    const cryptoKey = await getActiveCryptoKey(pendingLogin.UserID, keyId);

    if (!cryptoKey) {
      return res.status(404).json({
        error: "No active cryptographic key found for this user",
      });
    }

    const challenge = bufferToBase64Url(randomBytes(32));

    const messageObject = {
      type: "crypto-login",
      userId: String(pendingLogin.UserID),
      keyId: String(cryptoKey.id),
      challenge,
      createdAt: Date.now(),
    };

    const messageToSign = JSON.stringify(messageObject);

    pendingLogin.cryptoChallenge = {
      keyId: cryptoKey.id,
      challenge,
      messageToSign,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    };

    req.session.pendingLogin = pendingLogin;

    await saveSession(req);

    return res.status(200).json({
      success: true,
      message: "Crypto challenge created",
      keyId: cryptoKey.id,
      keyName: cryptoKey.key_name,
      deviceName: cryptoKey.device_name,
      challenge,
      messageToSign,
      algorithm: "ECDSA-P256-SHA256",
    });
  } catch (error) {
    console.error("Create crypto challenge error:", error);
    return res.status(500).json({ error: "Failed to create crypto challenge" });
  }
};

export const verifyCryptoChallenge = async (req, res) => {
  try {
    const { keyId, messageToSign, signature } = req.body;

    if (!keyId || !messageToSign || !signature) {
      return res.status(400).json({
        error: "keyId, messageToSign, and signature are required",
      });
    }

    const pendingLogin = req.session.pendingLogin;

    if (!pendingLogin) {
      return res.status(401).json({ error: "No pending login found" });
    }

    if (!pendingLogin.otpVerified) {
      return res.status(403).json({
        error: "OTP must be verified before cryptographic verification",
      });
    }

    const cryptoChallenge = pendingLogin.cryptoChallenge;

    if (!cryptoChallenge) {
      return res.status(401).json({ error: "No crypto challenge found" });
    }

    if (Date.now() > cryptoChallenge.expiresAt) {
      delete pendingLogin.cryptoChallenge;
      req.session.pendingLogin = pendingLogin;

      await saveSession(req);

      return res.status(401).json({ error: "Crypto challenge expired" });
    }

    if (cryptoChallenge.attempts >= 5) {
      delete req.session.pendingLogin;

      await saveSession(req);

      return res.status(429).json({
        error: "Too many cryptographic verification attempts",
      });
    }

    if (String(keyId) !== String(cryptoChallenge.keyId)) {
      cryptoChallenge.attempts += 1;
      req.session.pendingLogin = pendingLogin;

      await saveSession(req);

      return res.status(401).json({ error: "Invalid crypto key" });
    }

    if (messageToSign !== cryptoChallenge.messageToSign) {
      cryptoChallenge.attempts += 1;
      req.session.pendingLogin = pendingLogin;

      await saveSession(req);

      return res.status(401).json({ error: "Invalid challenge message" });
    }

    const cryptoKey = await getActiveCryptoKey(pendingLogin.UserID, keyId);

    if (!cryptoKey) {
      return res.status(404).json({
        error: "Active cryptographic key not found",
      });
    }

    let publicKeyJwk;

    try {
      publicKeyJwk = JSON.parse(cryptoKey.public_key);
    } catch {
      return res.status(500).json({
        error: "Stored public key format is invalid",
      });
    }

    const importedPublicKey = await subtle.importKey(
      "jwk",
      publicKeyJwk,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["verify"],
    );

    const encodedMessage = new TextEncoder().encode(messageToSign);
    const signatureBuffer = base64UrlToBuffer(signature);

    const signatureIsValid = await subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      importedPublicKey,
      signatureBuffer,
      encodedMessage,
    );

    if (!signatureIsValid) {
      cryptoChallenge.attempts += 1;
      req.session.pendingLogin = pendingLogin;

      await saveSession(req);

      return res.status(401).json({
        error: "Invalid cryptographic signature",
        attemptsLeft: 5 - cryptoChallenge.attempts,
      });
    }

    const finalUser = {
      UserID: pendingLogin.UserID,
      UserName: pendingLogin.UserName,
    };

    await regenerateSession(req);

    req.session.UserID = finalUser.UserID;
    req.session.UserName = finalUser.UserName;

    await saveSession(req);

    return res.status(200).json({
      success: true,
      message: "Cryptographic verification successful",
      redirectTo: "http://localhost:5500/frontend/homepage.html",
    });
  } catch (error) {
    console.error("Verify crypto challenge error:", error);
    return res.status(500).json({
      error: "Cryptographic verification failed",
    });
  }
};
