const express = require("express");
const router = express.Router();
const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    sendGeneralNotification,
    getNotificationHistory,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`📬 Notification Route: ${req.method} ${req.originalUrl}`);
    next();
});

// Admin endpoints (must come first to avoid route conflicts)
router.post("/send-general", protect, isAdmin, sendGeneralNotification);           // Send general notification to all users
router.get("/admin/history", protect, isAdmin, getNotificationHistory);            // Get notification history

// User endpoints
router.get("/unread-count", protect, getUnreadCount);          // Get count of unread notifications
router.delete("/clear-all", protect, clearAllNotifications);    // Delete all notifications for user (must come before /:id)
router.get("/", protect, getUserNotifications);                 // Get user's notifications with pagination and filters
router.put("/:id/mark-read", protect, markAsRead);             // Mark notification as read
router.delete("/:id", protect, deleteNotification);             // Delete single notification (must come last)

module.exports = router;
