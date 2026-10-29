const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const normalizeDistrict = (district) =>
  String(district || "").trim().toLowerCase();

const getAuthenticatedUserId = (req) =>
  req.user?.id || req.user?._id;

const createOrder = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({
      message: "Please log in to place an order.",
    });
  }

  if (req.user?.role !== "consumer") {
    return res.status(403).json({
      message: "Only consumers can place orders.",
    });
  }

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
    !deliveryAddress?.district?.trim() ||
    !deliveryAddress?.city?.trim()
  ) {
    return res.status(400).json({
      message:
        "Please provide your name, phone number, delivery address, district, and city.",
    });
  }

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !["Cash on Delivery", "Bank Transfer"].includes(
      paymentMethod
    )
  ) {
    return res.status(400).json({
      message: "Invalid order items or payment method.",
    });
  }

  const deliveryDistrict = normalizeDistrict(
    deliveryAddress.district
  );

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

    const productId = String(item.productId);

    normalizedItems.set(
      productId,
      (normalizedItems.get(productId) || 0) +
        item.quantity
    );
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: {
          $in: [...normalizedItems.keys()],
        },
      }).session(session);

      if (products.length !== normalizedItems.size) {
        throw new Error(
          "One or more products no longer exist."
        );
      }

      const farmerIds = [
        ...new Set(
          products.map((product) =>
            String(product.farmerId || "")
          )
        ),
      ];

      if (
        farmerIds.some(
          (id) => !mongoose.isValidObjectId(id)
        )
      ) {
        throw new Error(
          "A product is missing its farmer information. Please contact the administrator."
        );
      }

      const farmers = await User.find({
        _id: { $in: farmerIds },
        role: "farmer",
      })
        .select("name username phone farmName address district role")
        .session(session);

      const farmerMap = new Map(
        farmers.map((farmer) => [
          String(farmer._id),
          farmer,
        ])
      );

      if (farmerMap.size !== farmerIds.length) {
        throw new Error(
          "Farmer information could not be verified for one or more products."
        );
      }

      const orderItems = [];

      for (const product of products) {
        const requestedQuantity = normalizedItems.get(
          String(product._id)
        );

        if (
          normalizeDistrict(product.district) !==
          deliveryDistrict
        ) {
          throw new Error(
            `${product.name} is from ${product.district}, but your delivery district is ${deliveryAddress.district}. All products in one order must be from the delivery district.`
          );
        }

        if (product.quantity < requestedQuantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available quantity: ${product.quantity}.`
          );
        }

        const farmer = farmerMap.get(
          String(product.farmerId)
        );

        orderItems.push({
          productId: product._id,
          farmerId: farmer._id,
          farmerName: farmer.farmName || farmer.name,
          district: product.district,
          name: product.name,
          price: product.price,
          quantity: requestedQuantity,
          unit: product.unit,
        });
      }

      const subtotal = orderItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

      const deliveryFee = subtotal > 0 ? 250 : 0;

      
      for (const item of orderItems) {
        const stockUpdate = await Product.updateOne(
          {
            _id: item.productId,
            quantity: { $gte: item.quantity },
          },
          {
            $inc: {
              quantity: -item.quantity,
            },
          },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new Error(
            `The stock for ${item.name} has changed. Please review your cart and try again.`
          );
        }
      }

      const orderNumber = `GOVI-${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;

      const createdOrders = await Order.create(
        [
          {
            userId,
            orderNumber,

            customer: {
              fullName: customer.fullName.trim(),
              phone: customer.phone.trim(),
            },

            deliveryAddress: {
              address: deliveryAddress.address.trim(),
              district: deliveryAddress.district.trim(),
              city: deliveryAddress.city.trim(),
            },

            items: orderItems,
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
            paymentMethod,
            status: "Pending",
          },
        ],
        { session }
      );

      createdOrder = createdOrders[0];
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    const clientErrors = [
      "district",
      "Insufficient stock",
      "no longer exist",
      "farmer information",
      "Farmer information",
      "stock for",
    ];

    if (
      clientErrors.some((message) =>
        error.message?.includes(message)
      ) ||
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Unable to place order. Please try again.",
    });
  } finally {
    await session.endSession();
  }
};


const getAllOrders = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Please log in to view orders.",
      });
    }

    const filter =
      req.user.role === "admin"
        ? {}
        : { userId };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

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
    const userId = getAuthenticatedUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Please log in to view this order.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : {
            _id: req.params.id,
            userId,
          };

    const order = await Order.findOne(filter)
      .populate({
        path: "userId",
        select: "name username phone address district role",
      })
      .populate({
        path: "items.farmerId",
        select:
          "name username phone farmName address district role",
      })
      .populate({
        path: "items.productId",
        select:
          "name price unit district farmerId",
        populate: {
          path: "farmerId",
          select:
            "name username phone farmName address district role",
        },
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    order.items = (order.items || []).map((item) => {
      const product =
        item.productId &&
        typeof item.productId === "object"
          ? item.productId
          : null;

      const farmer =
        item.farmerId &&
        typeof item.farmerId === "object"
          ? item.farmerId
          : product?.farmerId &&
              typeof product.farmerId === "object"
            ? product.farmerId
            : null;

      return {
        ...item,

        productName: item.name || product?.name || "Product",

        farmer: farmer
          ? {
              _id: farmer._id,
              name: farmer.name || "",
              username: farmer.username || "",
              farmName: farmer.farmName || "",
              phone: farmer.phone || "",
              address: farmer.address || "",
              district:
                farmer.district ||
                product?.district ||
                item.district ||
                "",
            }
          : {
              name: item.farmerName || "",
              farmName: item.farmerName || "",
              phone: "",
              address: "",
              district:
                product?.district ||
                item.district ||
                "",
            },

        product,
      };
    });

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Unable to retrieve order.",
    });
  }
}
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message:
          "Only administrators can update order status.",
      });
    }

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
      {
        new: true,
        runValidators: true,
      }
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

const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = getAuthenticatedUserId(req);

    if (
      !farmerId ||
      !mongoose.isValidObjectId(farmerId)
    ) {
      return res.status(401).json({
        message: "Please log in to view farmer orders.",
      });
    }

    if (req.user?.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can view farmer orders.",
      });
    }

    const products = await Product.find({ farmerId })
      .select("_id");

    const productIds = products.map(
      (product) => product._id
    );

    if (productIds.length === 0) {
      return res.status(200).json({
        count: 0,
        orders: [],
      });
    }

    const orders = await Order.find({
      status: {
        $in: [
          "Accepted",
          "Processing",
          "OutForDelivery",
          "Delivered",
        ],
      },
      "items.productId": {
        $in: productIds,
      },
    })
      .populate("userId", "name username")
      .sort({ createdAt: -1 })
      .lean();

  
    const farmerOrders = orders
      .map((order) => {
        const farmerItems = (order.items || []).filter(
          (item) =>
            productIds.some(
              (id) =>
                String(id) === String(item.productId)
            )
        );

        if (farmerItems.length === 0) {
          return null;
        }

        const farmerSubtotal = farmerItems.reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0) *
              Number(item.quantity || 0),
          0
        );

        return {
          ...order,
          items: farmerItems,
          farmerSubtotal,
          customerName:
            order.customer?.fullName ||
            order.userId?.name ||
            "Customer",
          customerPhone:
            order.customer?.phone || "",
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      count: farmerOrders.length,
      orders: farmerOrders,
    });
  } catch (error) {
    console.error("Get farmer orders error:", error);

    return res.status(500).json({
      message: "Unable to retrieve farmer orders.",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getFarmerOrders,
};
