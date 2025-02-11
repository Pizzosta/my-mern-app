import cron from "node-cron";
import Product from "../models/product.model.js";

const updateAuctionStatuses = async () => {
    const now = new Date();
    console.log("Running auction status update at:", now.toISOString());

    try {
        // Update upcoming auctions to active
        const activeUpdateResult = await Product.updateMany(
            { status: "upcoming", startTime: { $lte: now } },
            { $set: { status: "active" } }
        );
        console.log("Updated to active:", activeUpdateResult.modifiedCount);
        console.log("Query for active auctions:", { status: "upcoming", startTime: { $lte: now } });

        // Update active auctions to ended
        const endedAuctions = await Product.find({
            status: "active",
            endTime: { $lte: now },
        });
        console.log("Ended auctions found:", endedAuctions.length);

        for (const auction of endedAuctions) {
            if (auction.bids.length > 0) {
                // Find the highest bid
                const highestBid = auction.bids.reduce((prev, current) =>
                    prev.amount > current.amount ? prev : current
                );

                // Update the auction with the winner
                auction.winner = highestBid.bidder;
                console.log("Auction Winner:", highestBid.bidder);
            }

            auction.status = "ended";
            await auction.save();
            console.log("Auction ended:", auction._id);
        }
    } catch (error) {
        console.error("Error in cron job:", error);
    }
};

// Schedule the task to run every minute
cron.schedule("* * * * *", async () => {
    console.log("Starting cron job...");
    await updateAuctionStatuses();
});

export default updateAuctionStatuses;