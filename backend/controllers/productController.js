const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      initialStock,
      quantity,
      unit,
      imageUrl,
      farmerId,
      district,
    } = req.body;

    if (!mongoose.isValidObjectId(farmerId)) {
      return res.status(400).json({
        message: "A valid farmer ID is required.",
      });
    }

    const farmer = await User.findOne({
      _id: farmerId,
      role: "farmer",
    });

    if (!farmer) {
      return res.status(400).json({
        message: "The selected farmer does not exist.",
      });
    }

    const startingStock = Number(initialStock ?? quantity);
    const availableStock = Number(quantity ?? startingStock);
    const productPrice = Number(price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice <= 0 ||
      !Number.isFinite(startingStock) ||
      startingStock < 0 ||
      !Number.isFinite(availableStock) ||
      availableStock < 0 ||
      availableStock > startingStock
    ) {
      return res.status(400).json({
        message: "Please provide valid price and stock values.",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: productPrice,
      initialStock: startingStock,
      quantity: availableStock,
      unit,
      imageUrl,
      farmerId: farmer._id,
      district,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("farmerId", "name farmName");

    return res.status(201).json({
      message: "Product created successfully.",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid product data.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create product.",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("farmerId", "name farmName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("farmerId", "name farmName");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Failed to fetch product.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const updates = { ...req.body };

    delete updates._id;
    delete updates.__v;
    delete updates.farmerId;

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    if (updates.initialStock !== undefined) {
      updates.initialStock = Number(updates.initialStock);
    }

    if (updates.quantity !== undefined) {
      updates.quantity = Number(updates.quantity);
    }

    if (
      updates.initialStock !== undefined &&
      updates.quantity !== undefined &&
      updates.quantity > updates.initialStock
    ) {
      return res.status(400).json({
        message: "Available stock cannot exceed initial stock.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("farmerId", "name farmName");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid product data.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update product.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Failed to delete product.",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};