const mongoose = require("mongoose");

const serviceDurationSchema = new mongoose.Schema({
  minutes: {
    type: Number,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    durations: [serviceDurationSchema],
    price: {
      type: String,
      required: true,
    },
    priceRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    image: {
      type: String,
      default: "swedish",
    },
    category: {
      type: String,
      required: true,
      enum: ["Classic", "Therapeutic", "Wellness", "Traditional", "Targeted", "Specialty"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    benefits: [{
      type: String,
    }],
    benefitDetails: [{
      label: String,
      icon: String,
    }],
    whatToExpect: [{
      type: String,
    }],
    contraindications: [{
      type: String,
    }],
    preparationTips: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#7c9885",
    },
    gradient: {
      type: String,
      default: "from-green-100 to-emerald-50",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving (synchronous, before validation)
serviceSchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
