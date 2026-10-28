const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticateToken, getMyProfile);
router.put("/me", authenticateToken, updateMyProfile);

module.exports = router;
