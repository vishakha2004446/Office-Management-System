const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');

// POST /api/leaves — user applies for leave
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            user: req.user._id,
            leaveType,
            startDate,
            endDate,
            reason,
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Failed to apply for leave' });
    }
};

// GET /api/leaves/my — user views their own leaves
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch leaves' });
    }
};

// GET /api/leaves/count — user gets leave count by status
exports.getMyLeaveCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const [total, approved, pending, rejected] = await Promise.all([
            Leave.countDocuments({ user: userId }),
            Leave.countDocuments({ user: userId, status: 'approved' }),
            Leave.countDocuments({ user: userId, status: 'pending' }),
            Leave.countDocuments({ user: userId, status: 'rejected' }),
        ]);
        res.json({ total, approved, pending, rejected });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch leave count' });
    }
};

// GET /api/leaves — admin views all leaves
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all leaves' });
    }
};

// PUT /api/leaves/:id — admin approves or rejects
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.id).populate('user', 'name email');

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = status;
        leave.adminComment = adminComment || '';
        await leave.save();

        // Trigger notification using NotificationService based on status
        if (status === 'approved') {
            NotificationService.createLeaveApprovedNotification(leave, req.user);
        } else if (status === 'rejected') {
            NotificationService.createLeaveRejectedNotification(leave, req.user);
        }

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update leave status' });
    }
};
