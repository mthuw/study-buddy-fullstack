import { dbMySQL } from "../config/mysql.js";

export const initializeOTPTables = async () => {
  const createOTPTable = `
        CREATE TABLE IF NOT EXISTS otp_codes (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_otp_user
          FOREIGN KEY (user_id) REFERENCES users(UserID)
          ON DELETE CASCADE
        );
    `;

  try {
    await dbMySQL.query(createOTPTable);
    console.log("OTP tables are ready in MySQL");
  } catch (error) {
    console.error("OTP creation error:", error);
  }
};
