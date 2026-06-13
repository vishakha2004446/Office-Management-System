const express = require("express");
const router = express.Router();
const {
    checkIn,
    checkOut,
    getTodayAttendance,
    getAttendanceHistory,
    getMyAttendanceStats,
    getAllAttendance,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/checkin",  protect, checkIn);
router.post("/checkout", protect, checkOut);
router.get("/today",     protect, getTodayAttendance);
router.get("/my-stats",  protect, getMyAttendanceStats);  // User: own attendance counts
router.get("/history",   protect, getAttendanceHistory);
router.get("/all",       protect, isAdmin, getAllAttendance);

module.exports = router;
