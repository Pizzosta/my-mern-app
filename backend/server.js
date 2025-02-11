import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from "./routes/product.route.js";
import pvideoRoutes from "./routes/pvideo.route.js";
import updateAuctionStatuses from './cron/cron.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); // allows to accept JSON data in the req.body

app.use("/api/products", productRoutes);

app.use("/api/pvideos", pvideoRoutes);

app.listen(5001, () => {
    connectDB();
    console.log("server started at http://localhost:" + PORT);

    // Initialize the cron job
    updateAuctionStatuses(); // Run once at startup to handle any missed updates
    console.log("Cron job initialized.");
})