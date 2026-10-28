const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "Vegetables",
          "Fruits",
          "Grains",
          "Other",
        ],
        message: "Please select a valid product category",
      },
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than zero"],
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },

    unit: {
      type: String,
      required: [true, "Product unit is required"],
      enum: {
        values: ["kg", "g", "piece", "litre"],
        message: "Please select a valid selling unit",
      },
      default: "kg",
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    district: {
  type: String,
  required: [true, "Farmer district is required"],
  trim: true,
  maxlength: 100,
},

  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
