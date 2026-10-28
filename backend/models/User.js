const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must contain at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_]+$/,
        "Username can contain only letters, numbers, and underscores",
      ],
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    farmName: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    district: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "District cannot exceed 100 characters"],
    },

    role: {
      type: String,
      enum: ["farmer", "consumer", "admin"],
      required: true,
      default: "consumer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
