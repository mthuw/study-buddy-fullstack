import mysql2 from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config();

export const dbMySQL = mysql2.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 10
})
const connMySQL = async() => {
    try {
        const connInstance = await dbMySQL.getConnection();
        console.log("MySQL connected");
        connInstance.release(); //give conn back to the pool
    } catch (error) {
        console.log("MySQL connection failed", error.message);
        process.exit(1);
    }
}
export default connMySQL;