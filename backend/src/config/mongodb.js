import mongoose from "mongoose"
const { connection } = mongoose;
const connMongoDB = async () => {
    try {
        const connInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected ${connInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed", error.message);
        process.exit(1);
    }
}

export default connMongoDB;