const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  farmName: user.farmName,
  address: user.address,
  district: user.district,
  role: user.role,
  createdAt: user.createdAt,
});

exports.register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      phone,
      farmName,
      address,
      district,
      role,
    } = req.body;

    if (
      !name?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password ||
      !district?.trim() ||
      !role
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!["farmer", "consumer"].includes(role)) {
      return res.status(400).json({
        message: "Please select Farmer or Consumer.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (role === "farmer" && !farmName?.trim()) {
      return res.status(400).json({
        message: "Farm name is required for farmer registration.",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.username === normalizedUsername
            ? "This username is already taken."
            : "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      farmName: role === "farmer" ? farmName.trim() : "",
      address: address?.trim() || "",
      district: district.trim(),
      role,
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        message:
          field === "username"
            ? "This username is already taken."
            : "This email is already registered.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Failed to create account.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username?.trim() || !password || !role) {
      return res.status(400).json({
        message: "Username, password, and account type are required.",
      });
    }

    if (!["farmer", "consumer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account type.",
      });
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase(),
      role,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid username, password, or account type.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username, password, or account type.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Failed to retrieve profile.",
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "farmName",
      "address",
      "district",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    if (currentUser.role !== "farmer") {
      delete updates.farmName;
    }

    if (currentUser.role === "farmer" && updates.farmName === "") {
      return res.status(400).json({
        message: "Farm name cannot be empty.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Failed to update profile.",
    });
  }
};
