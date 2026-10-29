const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured.");
    }

    const name = process.env.ADMIN_NAME?.trim();
    const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !username || !email || !password) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in your local environment."
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must contain at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      throw new Error(
        "An admin already exists. This script will not create another."
      );
    }

    const existingAccount = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAccount) {
      throw new Error(
        "That username or email is already in use. Choose different admin credentials."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: "admin",
      phone: "",
      farmName: "",
      address: "",
      district: "",
    });

    console.log("Admin account created successfully.");
    console.log(`Admin username: ${username}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
