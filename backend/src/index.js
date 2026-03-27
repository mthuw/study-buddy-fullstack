import dotenv from "dotenv"; //env variables
import connMongoDB from "./config/mongodb.js";
import connMySQL from "./config/mysql.js";
import app from "./app.js";

dotenv.config();
const startServer = async () => {
    try {
        await connMongoDB();
        await connMySQL();
        
        app.on("error", (error) => {
            console.log("Error server started", error);
            throw error;
        })
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () =>{
            console.log(`StudyBuddy Server is running on ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Connection failed", error);

    }
}

startServer();

