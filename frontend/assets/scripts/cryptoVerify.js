let currentChallengeData = null;

document.addEventListener("DOMContentLoaded", () => {
  const challengeInput = document.getElementById("challenge");
  const verifyDeviceBtn = document.getElementById("verifyDeviceBtn");
  const statusMessage = document.getElementById("statusMessage");

  if (!challengeInput || !verifyDeviceBtn || !statusMessage) {
    console.error("Required HTML elements not found.");
    return;
  }

  verifyDeviceBtn.disabled = true;

  verifyDeviceBtn.addEventListener("click", async () => {
    await signChallenge(challengeInput, verifyDeviceBtn, statusMessage);
  });

  createCryptoChallenge(challengeInput, verifyDeviceBtn, statusMessage);
});

function setStatus(statusMessage, message) {
  statusMessage.textContent = message;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/*
  Convert ArrayBuffer to Base64URL
*/
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/*
  Open IndexedDB
*/
function openCryptoDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }

    const request = indexedDB.open("TripleAuthCryptoDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/*
  Get private key from IndexedDB
*/
async function getPrivateKey(keyId) {
  const db = await openCryptoDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readonly");
    const store = transaction.objectStore("keys");

    const privateKeyName = `privateKey:${keyId}`;
    const request = store.get(privateKeyName);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/*
  Ask backend to create challenge
*/
async function createCryptoChallenge(
  challengeInput,
  verifyDeviceBtn,
  statusMessage,
) {
  try {
    setStatus(statusMessage, "Creating cryptographic challenge...");
    challengeInput.value = "Loading...";
    verifyDeviceBtn.disabled = true;

    const response = await fetch("http://localhost:3000/api/crypto/challenge", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await safeJson(response);

    if (!response.ok) {
      challengeInput.value = "No challenge";
      setStatus(
        statusMessage,
        data.error || "Failed to create cryptographic challenge.",
      );
      return;
    }

    if (!data.keyId || !data.challenge || !data.messageToSign) {
      challengeInput.value = "Invalid challenge";
      setStatus(statusMessage, "Server returned incomplete challenge data.");
      console.error("Invalid challenge data:", data);
      return;
    }

    currentChallengeData = data;

    challengeInput.value = data.challenge;
    verifyDeviceBtn.disabled = false;

    setStatus(
      statusMessage,
      `Challenge received for key ID ${data.keyId}. Click Verify This Device.`,
    );
  } catch (error) {
    console.error("Create challenge error:", error);
    challengeInput.value = "Connection failed";
    setStatus(statusMessage, "Server connection failed.");
  }
}

/*
  Sign challenge using private key
*/
async function signChallenge(challengeInput, verifyDeviceBtn, statusMessage) {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      setStatus(statusMessage, "Web Crypto API is not supported.");
      return;
    }

    if (!currentChallengeData) {
      setStatus(statusMessage, "No challenge found. Refresh the page.");
      return;
    }

    const { keyId, messageToSign } = currentChallengeData;

    verifyDeviceBtn.disabled = true;
    setStatus(statusMessage, "Loading private key from this browser...");

    const privateKey = await getPrivateKey(keyId);

    if (!privateKey) {
      setStatus(
        statusMessage,
        `Private key not found for key ID ${keyId}. Register this device first.`,
      );

      verifyDeviceBtn.disabled = false;
      return;
    }

    setStatus(statusMessage, "Signing challenge...");

    const encodedMessage = new TextEncoder().encode(messageToSign);

    const signatureBuffer = await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      privateKey,
      encodedMessage,
    );

    const signature = arrayBufferToBase64Url(signatureBuffer);

    await verifySignatureOnServer(
      {
        keyId,
        messageToSign,
        signature,
      },
      verifyDeviceBtn,
      statusMessage,
    );
  } catch (error) {
    console.error("Sign challenge error:", error);
    setStatus(statusMessage, "Cryptographic signing failed.");
    verifyDeviceBtn.disabled = false;
  }
}

/*
  Send signature to backend
*/
async function verifySignatureOnServer(
  payload,
  verifyDeviceBtn,
  statusMessage,
) {
  try {
    setStatus(statusMessage, "Verifying device on server...");

    const response = await fetch("http://localhost:3000/api/crypto/verify", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await safeJson(response);

    if (!response.ok) {
      setStatus(
        statusMessage,
        data.error || "Cryptographic verification failed.",
      );
      verifyDeviceBtn.disabled = false;
      return;
    }

    setStatus(statusMessage, "Device verified successfully.");

    if (data.redirectTo) {
      window.location.href = data.redirectTo;
    }
  } catch (error) {
    console.error("Verify signature error:", error);
    setStatus(statusMessage, "Server verification failed.");
    verifyDeviceBtn.disabled = false;
  }
}
