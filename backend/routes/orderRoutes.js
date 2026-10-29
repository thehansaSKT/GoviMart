const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getFarmerOrders,
} = require("../controllers/orderController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");


router.post("/", authenticateToken, createOrder);


router.get("/farmer", authenticateToken, getFarmerOrders);

router.get("/", authenticateToken, getAllOrders);


router.get("/:id", authenticateToken, getOrderById);

router.patch(
  "/:id/status",
  authenticateToken,
  updateOrderStatus
);

module.exports = router;
