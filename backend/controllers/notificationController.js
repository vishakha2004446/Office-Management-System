const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications with pagination, filtering, and search
exports.getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, search } = req.query;
        const userId = req.user._id;

        // Build filter
        const filter = { user: userId };
        if (type) {
            filter.type = type;
        }
        if (search) {
            filter.message = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch notifications
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        // Get total count
        const total = await Notification.countDocuments(filter);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
};

// Get count of unread notifications for the user
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false,
        });

        res.json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
        });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        // Check ownership
        if (notification.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this notification',
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
        });
    }
};

// Delete a single notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        // Check ownership
        if (notification.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this notification',
            });
        }

        await Notification.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
        });
    }
};

// Delete all notifications for the logged-in user
exports.clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Notification.deleteMany({ user: userId });

        res.json({
            success: true,
            message: 'All notifications cleared',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear notifications',
        });
    }
};

// Send general notification to all users (admin only)
exports.sendGeneralNotification = async (req, res) => {
    try {
        console.log("🔔 sendGeneralNotification called");
        console.log("User:", req.user);
        console.log("Request body:", req.body);

        const { message } = req.body;

        // Validate message
        if (!message || message.trim().length === 0) {
            console.log("❌ Message validation failed - empty message");
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty',
            });
        }

        console.log("✅ Message validated, fetching users...");

        // Fetch all users
        const users = await User.find();
        console.log(`📊 Found ${users.length} users`);

        if (users.length === 0) {
            return res.json({
                success: true,
                message: 'No users to send notification to',
                sentCount: 0,
            });
        }

        // Create notification for each user
        const notifications = users.map(user => ({
            user: user._id,
            message: message.trim(),
            type: 'general',
            isRead: false,
        }));

        console.log(`📝 Creating ${notifications.length} notifications...`);
        await Notification.insertMany(notifications);
        console.log("✅ Notifications created successfully");

        res.json({
            success: true,
            message: `Notification sent to ${users.length} users`,
            sentCount: users.length,
        });
    } catch (error) {
        console.error("❌ Error in sendGeneralNotification:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to send general notification',
            error: error.message,
        });
    }
};

// Get notification history (admin only)
exports.getNotificationHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        // Build filter
        const filter = {};
        if (type) {
            filter.type = type;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch notifications
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        // Get total count
        const total = await Notification.countDocuments(filter);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification history',
        });
    }
};
