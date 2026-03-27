import { dbMySQL } from "../config/mysql.js"; // Adjust this import to match what you named your exported connection pool

export const initializeUserTables = async () => {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
            UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            Email VARCHAR(100) NOT NULL UNIQUE,
            Password VARCHAR(100) NOT NULL,
            UserName VARCHAR(100) NOT NULL,
            Avatar VARCHAR(20)
        );
    `;

    // 2. Create the Login table with the Foreign Key constraint
    const createLoginTable = `
        CREATE TABLE IF NOT EXISTS Login (
            LoginID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            Email VARCHAR(100) NOT NULL,
            Password VARCHAR(100) NOT NULL,
            FOREIGN KEY (Email) REFERENCES users(Email) ON DELETE CASCADE
        );
    `;

    try {
        await dbMySQL.query(createUserTable);
        await dbMySQL.query(createLoginTable);
        console.log("User and Login tables are ready in MySQL");
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message });
    }
};