const Task = require('../models/Task');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        
        // Trigger notification if task is assigned to a user
        if (task.assignedTo) {
            const assignedUser = await User.findById(task.assignedTo).select('name email');
            if (assignedUser) {
                const requesterName = req.user.name || 'System';
                NotificationService.createTaskAssignedNotification(task, assignedUser, requesterName);
            }
        }
        
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create task' });
    }
};

// Get tasks assigned to the logged-in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
};

// Admin: get all tasks with user info populated
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all tasks' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task) {
            task.status = req.body.status || task.status;
            await task.save();
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task' });
    }
};

// User: get their own task stats
exports.getUserTaskStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
            Task.countDocuments({ assignedTo: userId }),
            Task.countDocuments({ assignedTo: userId, status: 'completed' }),
            Task.countDocuments({ assignedTo: userId, status: 'pending' }),
        ]);
        res.json({ totalTasks, completedTasks, pendingTasks });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch task stats' });
    }
};

// Admin: get dashboard summary stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalTasks, completedTasks] = await Promise.all([
            User.countDocuments(),
            Task.countDocuments(),
            Task.countDocuments({ status: 'completed' }),
        ]);
        res.json({ totalUsers, totalTasks, completedTasks });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};