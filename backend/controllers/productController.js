const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

const getUserId = (req) => req.user?.id || req.user?._id;

const requireFarmer = (req, res) => {
  const userId = getUserId(req);

  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      message: "Please log in with a farmer account.",
    });
    return null;
  }

  if (req.user?.role !== "farmer") {
    res.status(403).json({
      message: "Only farmers can manage products.",
    });
    return null;
  }

  return userId;
};

const createProduct = async (req, res) => {
  try {
    const farmerId = requireFarmer(req, res);
    if (!farmerId) return;

    const {
      name,
      description,
      category,
      price,
      initialStock,
      quantity,
      unit,
      imageUrl,
      district,
    } = req.body;

    const farmer = await User.findOne({
      _id: farmerId,
      role: "farmer",
    });

    if (!farmer) {
      return res.status(403).json({
        message: "Farmer account could not be verified.",
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
      district: district || farmer.district,
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
    let filter = {};

    // Authenticated farmers see only their own products.
    if (req.user?.role === "farmer") {
      const farmerId = getUserId(req);

      if (!farmerId || !mongoose.isValidObjectId(farmerId)) {
        return res.status(401).json({
          message: "Please log in again.",
        });
      }

      filter = { farmerId };
    }

    // Consumers and public browsing can see all products.
    const products = await Product.find(filter)
      .populate("farmerId", "name farmName district")
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
      .populate("farmerId", "name farmName district");

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
    const farmerId = requireFarmer(req, res);
    if (!farmerId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const updates = { ...req.body };

    // Ownership must never be changed through the request body.
    delete updates._id;
    delete updates.__v;
    delete updates.farmerId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const allowedFields = [
      "name",
      "description",
      "category",
      "price",
      "initialStock",
      "quantity",
      "unit",
      "imageUrl",
      "district",
    ];

    Object.keys(updates).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updates[key];
      }
    });

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    if (updates.initialStock !== undefined) {
      updates.initialStock = Number(updates.initialStock);
    }

    if (updates.quantity !== undefined) {
      updates.quantity = Number(updates.quantity);
    }

    const existingProduct = await Product.findOne({
      _id: req.params.id,
      farmerId,
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found in your listings.",
      });
    }

    const nextInitialStock =
      updates.initialStock ?? existingProduct.initialStock;

    const nextQuantity =
      updates.quantity ?? existingProduct.quantity;

    if (
      nextInitialStock !== undefined &&
      nextQuantity !== undefined &&
      nextQuantity > nextInitialStock
    ) {
      return res.status(400).json({
        message: "Available stock cannot exceed initial stock.",
      });
    }

    Object.assign(existingProduct, updates);

    const product = await existingProduct.save();

    await product.populate("farmerId", "name farmName district");

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
    const farmerId = requireFarmer(req, res);
    if (!farmerId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      farmerId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your listings.",
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
