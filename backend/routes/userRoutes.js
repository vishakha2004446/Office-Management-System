const express = require("express");
const router = express.Router();
const { getUsers, deleteUser, getProfile, updateProfile, assignDepartmentToUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Specific routes FIRST (with named parameters like :userId)
router.get("/profile", protect, getProfile);          // Any logged-in user
router.put("/profile", protect, updateProfile);       // Any logged-in user
router.put("/:userId/department", protect, isAdmin, assignDepartmentToUser);  // Assign department to user
router.get("/all", protect, isAdmin, getUsers);       // Admin: get all users

// Generic routes LAST (with generic :id parameter)
router.get("/", protect, isAdmin, getUsers);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;