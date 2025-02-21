import cron from "node-cron";
import Product from "../models/product.model.js";

/*
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
        console.log("Product statuses updated successfully");

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
*/
const updateAuctionStatuses = async () => {
    const now = new Date();
    console.log("Running auction status update at:", now.toISOString());

    try {
        // Update any overdue auctions to ended status regardless of current status
        const endedUpdateResult = await Product.updateMany(
            { endTime: { $lte: now } },
            { $set: { status: "ended" } },
            { bypassDocumentValidation: true } // Skip schema validations
        );
        console.log("Marked auctions as ended:", endedUpdateResult.modifiedCount);

        // Update upcoming auctions to active if start time passed
        const activeUpdateResult = await Product.updateMany(
            { status: "upcoming", startTime: { $lte: now } },
            { $set: { status: "active" } },
            { bypassDocumentValidation: true } // Skip schema validations
        );
        console.log("Updated to active:", activeUpdateResult.modifiedCount);

        // Process ended auctions to set winners
        const endedAuctions = await Product.find({
            status: "ended",
            winner: null,
            bids: { $exists: true, $not: { $size: 0 } }
        });

        for (const auction of endedAuctions) {
            const highestBid = auction.bids.reduce((prev, current) =>
                prev.amount > current.amount ? prev : current
            );

            await Product.findByIdAndUpdate(
                auction._id,
                {
                    $set: {
                        currentHighestBid: highestBid.amount,
                        winner: highestBid.bidder
                    }
                },
                { runValidators: false } // Bypass validation for ended auctions
            );
        }

        console.log("Processed", endedAuctions.length, "ended auctions with bids");

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