import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database connected"));
        const baseUri = process.env.MONGODB_URI.endsWith('/') 
            ? process.env.MONGODB_URI.slice(0, -1) 
            : process.env.MONGODB_URI;
        await mongoose.connect(`${baseUri}/prescripto`);
    } catch (error) {
        console.error("Database connection error:", error.message);
    }
}

export default connectDB;