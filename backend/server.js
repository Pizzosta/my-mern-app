import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from "./routes/product.route.js";
import pvideoRoutes from "./routes/pvideo.route.js";
import updateAuctionStatuses from './cron/cron.js';
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js"
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); // allows to accept JSON data in the req.body
// Add middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());

//Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pvideos", pvideoRoutes);

app.listen(5001, () => {
    connectDB();
    console.log("server started at http://localhost:" + PORT);

    // Initialize the cron job
    updateAuctionStatuses(); // Run once at startup to handle any missed updates
    console.log("Cron job initialized.");
})