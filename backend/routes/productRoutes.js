const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

router.post("/", authenticateToken, createProduct);
router.get("/", authenticateToken, getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

module.exports = router;
