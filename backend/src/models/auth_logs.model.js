import { dbMySQL } from "../config/mysql.js";

export const initializeAuthLogsTables = async () => {
  const createAuthLogsTable = `
    CREATE TABLE IF NOT EXISTS auth_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      email VARCHAR(100) NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      user_agent TEXT NULL,
      success BOOLEAN NOT NULL DEFAULT FALSE,
      failure_reason VARCHAR(150) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_auth_logs_user
        FOREIGN KEY (user_id) REFERENCES users(UserID)
        ON DELETE SET NULL
    );
  `;

  try {
    await dbMySQL.query(createAuthLogsTable);
    console.log("Auth logs table is ready in MySQL");
  } catch (error) {
    console.error("Auth logs creation error:", error);
  }
};
