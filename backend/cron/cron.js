import cron from "node-cron";
import Product from "../models/product.model.js";

const updateAuctionStatuses = async () => {
    const now = new Date();
    console.log("Running auction status update at:", now.toISOString());

    try {
        // Update statuses of auctions in bulk
        const statusUpdates = await Product.bulkWrite([
            {
                updateMany: {
                    filter: { endTime: { $lte: now } },
                    update: { $set: { status: "ended" } },
                    bypassDocumentValidation: true
                }
            },
            {
                updateMany: {
                    filter: { status: "upcoming", startTime: { $lte: now } },
                    update: { $set: { status: "active" } },
                    bypassDocumentValidation: true
                }
            }
        ]);

        console.log(`Marked ${statusUpdates.modifiedCount} auctions as ended/active`);

        // Process ended auctions to set winners in bulk
        const endedAuctions = await Product.find({
            status: "ended",
            winner: null,
            bids: { $exists: true, $not: { $size: 0 } }
        });

        const winnerUpdates = endedAuctions.map(auction => {
            const highestBid = auction.bids.reduce((prev, current) => 
                prev.amount > current.amount ? prev : current
            );

            return {
                updateOne: {
                    filter: { _id: auction._id },
                    update: {
                        $set: {
                            currentHighestBid: highestBid.amount,
                            winner: highestBid.bidder
                        }
                    }
                }
            };
        });

        if (winnerUpdates.length > 0) {
            const result = await Product.bulkWrite(winnerUpdates, { ordered: false });
            console.log(`Updated ${result.modifiedCount} winners`);
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