const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    const { name, email, phone, farmName, address } = req.body;

    const user = await User.create({
      name,
      email,
      phone,
      farmName,
      address,
      role: "farmer",
    });

    res.status(201).json({
      message: "Profile created successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Create profile error:", error.message);
    res.status(500).json({ message: "Failed to create profile" });
  }
};

// READ profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

// UPDATE profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "farmName",
      "address",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
