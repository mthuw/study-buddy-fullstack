const API_BASE_URL = "http://localhost:3000";

const statusMessage = document.getElementById("statusMessage");
const registerDeviceBtn = document.getElementById("registerDeviceBtn");

function openCryptoDB() {
  return new Promise((resolve, reject) => {
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

async function storePrivateKey(keyId, privateKey) {
  const db = await openCryptoDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readwrite");
    const store = transaction.objectStore("keys");

    const request = store.put(privateKey, `privateKey:${keyId}`);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function registerThisDevice() {
  try {
    statusMessage.textContent = "Generating key pair...";

    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"],
    );

    const publicKeyJwk = await crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey,
    );

    statusMessage.textContent = "Saving public key to server...";

    const response = await fetch(`${API_BASE_URL}/api/crypto/register-key`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: publicKeyJwk,
        keyName: "Main Login Key",
        deviceName: navigator.userAgent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      statusMessage.textContent = data.error || "Device registration failed";
      return;
    }

    if (!data.keyId) {
      statusMessage.textContent = "Server did not return keyId";
      return;
    }

    statusMessage.textContent = "Saving private key in browser...";

    await storePrivateKey(data.keyId, keyPair.privateKey);

    statusMessage.textContent = "Device registered successfully.";

    if (data.redirectTo) {
      window.location.href = data.redirectTo;
    }
    console.log("Private key saved as:", `privateKey:${data.keyId}`);
  } catch (error) {
    console.error("Register device error:", error);
    statusMessage.textContent = "Device registration failed.";
  }
}

registerDeviceBtn.addEventListener("click", registerThisDevice);
