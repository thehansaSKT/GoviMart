const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      customer,
      deliveryAddress,
      items,
      paymentMethod,
    } = req.body;

    if (
      !customer?.fullName?.trim() ||
      !customer?.phone?.trim() ||
      !deliveryAddress?.address?.trim() ||
      !deliveryAddress?.city?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required delivery details.",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !["Cash on Delivery", "Bank Transfer"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: "Invalid order items or payment method.",
      });
    }

    const normalizedItems = new Map();

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product ID or quantity.",
        });
      }

      const id = String(item.productId);
      normalizedItems.set(
        id,
        (normalizedItems.get(id) || 0) + item.quantity
      );
    }

    const products = await Product.find({
      _id: { $in: [...normalizedItems.keys()] },
    });

    if (products.length !== normalizedItems.size) {
      return res.status(400).json({
        message: "One or more products no longer exist.",
      });
    }

    const orderItems = [];

    for (const product of products) {
      const quantity = normalizedItems.get(
        String(product._id)
      );

      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        unit: product.unit,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = subtotal > 0 ? 250 : 0;

    const order = await Order.create({
      orderNumber: `GOVI-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`,
      customer,
      deliveryAddress,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Unable to place order.",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Unable to retrieve orders.",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Unable to retrieve order.",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Processing",
      "OutForDelivery",
      "Delivered",
      "Cancelled",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Unable to update order status.",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
