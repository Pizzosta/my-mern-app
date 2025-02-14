import mongoose from "mongoose";
import { User } from "./user.model.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      set: (v) => parseFloat(v.toFixed(2)), // Round to 2 decimal places
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= Date.now();
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
            return value > Date.now();
          },
          message: "End time must be in the future.",
        },
      ],
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming",
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
  const remaining = this.endTime - Date.now();
  return remaining > 0 ? remaining : 0;
});

// Automatic status updates
productSchema.pre("save", function (next) {
  const now = Date.now();
  if (this.endTime < now) {
    this.status = "ended";
    if (this.currentHighestBid > 0) {
      this.winner = this.bids.reduce((prev, current) =>
        (prev.amount > current.amount) ? prev : current
      ).bidder;
    }
  } else if (this.startTime < now) {
    this.status = "active";
  }
  next();
});

// Virtual field to populate seller and winner
productSchema.virtual("sellerDetails", {
  ref: "User",
  localField: "seller",
  foreignField: "_id",
  justOne: true,
});

productSchema.virtual("winnerDetails", {
  ref: "User",
  localField: "winner",
  foreignField: "_id",
  justOne: true,
});

export const Product = mongoose.model("Product", productSchema);