import { dbMySQL } from "../config/mysql.js";

export const initializeUserCryptoKeysTable = async () => {
  const createUserCryptoKeysTable = `
    CREATE TABLE IF NOT EXISTS user_crypto_keys (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      public_key TEXT NOT NULL,
      key_name VARCHAR(100) NOT NULL,
      device_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      revoked BOOLEAN NOT NULL DEFAULT FALSE,

      CONSTRAINT fk_user_crypto_keys_user
        FOREIGN KEY (user_id) REFERENCES users(UserID)
        ON DELETE CASCADE
    );
  `;

  try {
    await dbMySQL.query(createUserCryptoKeysTable);
    console.log("user_crypto_keys table is ready in MySQL");
  } catch (error) {
    console.error("user_crypto_keys creation error:", error);
  }
};
