const mongoose = require("mongoose");

/**
 * Newsletter Schema
 * Stores newsletter subscriber emails
 */
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      unique: true, // Prevent duplicate subscriptions
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
newsletterSchema.index({ status: 1, createdAt: -1 });
newsletterSchema.index({ email: 1 });

module.exports = mongoose.model("Newsletter", newsletterSchema);
