import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
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
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.startTime;
      },
      message: "End time must be after start time.",
    },
  },
  status: {
    type: String,
    enum: ["upcoming", "active", "ended"],
    default: "upcoming",
  },
  bids: [
    {
      bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
}, { timestamps: true });

// Virtual field for time remaining
productSchema.virtual("timeRemaining").get(function () {
  return this.endTime - Date.now();
});

const Product = mongoose.model("Product", productSchema);

export default Product;