const express = require("express");
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getMyLeaveCount,
    getAllLeaves,
    updateLeaveStatus,
} = require("../controllers/leaveController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// User routes
router.post("/", protect, applyLeave);
router.get("/my", protect, getMyLeaves);
router.get("/count", protect, getMyLeaveCount);

// Admin routes
router.get("/", protect, isAdmin, getAllLeaves);
router.put("/:id", protect, isAdmin, updateLeaveStatus);

module.exports = router;
