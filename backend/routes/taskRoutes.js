const express = require("express");
const router = express.Router();
const {
    createTask,
    getTasks,
    getAllTasks,
    updateTask,
    getUserTaskStats,
    getDashboardStats,
} = require("../controllers/taskController");

const { protect } = require ("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/stats", protect, isAdmin, getDashboardStats);  // Admin: dashboard stats
router.get("/my-stats", protect, getUserTaskStats);          // User: own task stats
router.post("/", protect, isAdmin, createTask);
router.get("/all", protect, isAdmin, getAllTasks);           // Admin: fetch all tasks
router.get("/", protect, getTasks);                         // User: fetch own tasks
router.put("/:id", protect, updateTask);

module.exports = router;