import mongoose from "mongoose";
//import User from "./user.model.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Trim whitespace
    },
    price: {
      type: Number,
      required: true,
      set: (v) => parseFloat(v.toFixed(2)), // Round to 2 decimal places
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        // Only validate future dates for upcoming auctions
        validator: function (value) {
          return this.status !== "upcoming" || value >= Date.now();
        },
        message: "Start time must be in the future.",
      },
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: true,
      validate: [
        {
          validator: function (value) {
            return value > this.startTime;
          },
          message: "End time must be after start time.",
        },
        {
          validator: function (value) {
            // Only validate future dates for upcoming auctions
            return this.status !== "upcoming" || value > Date.now();
          },
          message: "End time must be in the future.",
        },
      ],
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming",
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          set: (v) => parseFloat(v.toFixed(2)),
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentHighestBid: {
      type: Number,
      default: 0,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for time remaining
productSchema.virtual("timeRemaining").get(function () {
  if (this.status === "ended") return 0;
  const now = Date.now();
  const remaining = this.endTime - now;
  return remaining > 0 ? remaining : 0;
});

// Virtual field to populate seller
productSchema.virtual("sellerDetails", {
  ref: "User",
  localField: "seller",
  foreignField: "_id",
  justOne: true,
});

// Virtual field to populate winner
productSchema.virtual("winnerDetails", {
  ref: "User",
  localField: "winner",
  foreignField: "_id",
  justOne: true,
});

// Automatic status updates
productSchema.pre("save", function (next) {
  const now = Date.now();

  // Only update status for upcoming auctions
  if (this.status !== "ended") {
    if (this.startTime <= now && this.status === "upcoming") {
      this.status = "active";
    }
    if (this.endTime <= now) {
      this.status = "ended";
    }
  }

  // Only validate start/end times for upcoming auctions
  if (this.status == "upcoming") {
    if (this.startTime <= now) {
      this.invalidate("startTime", "Start time must be in the future");
    }
    if (this.endTime <= now) {
      this.invalidate("endTime", "End time must be in the future");
    }
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;