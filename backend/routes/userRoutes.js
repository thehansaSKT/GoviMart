const express = require("express");
const router = express.Router();

const {
  createProfile,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

router.post("/", createProfile);
router.get("/:id", getProfile);
router.put("/:id", updateProfile);

module.exports = router;
