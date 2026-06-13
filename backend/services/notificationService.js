const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * NotificationService - Helper module for creating notifications triggered by business events
 * Handles notification creation for: task assignments, leave approvals/rejections, deadline reminders
 */

/**
 * Create notification when task is assigned to user
 * @param {Object} task - Task object with title and other fields
 * @param {Object} assignedUser - User object to receive notification
 * @param {String} requesterName - Name of the person assigning the task
 */
exports.createTaskAssignedNotification = async (task, assignedUser, requesterName) => {
    try {
        if (!assignedUser || !assignedUser._id) {
            console.log('NotificationService: No assigned user provided, skipping notification');
            return;
        }

        const message = `New task: '${task.title}' assigned by ${requesterName}`;

        await Notification.create({
            user: assignedUser._id,
            message,
            type: 'task_assigned',
            relatedTask: task._id,
            isRead: false,
        });

        console.log(`NotificationService: Task assigned notification created for user ${assignedUser._id}`);
    } catch (error) {
        console.error('NotificationService: Error creating task assigned notification:', error.message);
        // Don't throw - notification failures should not block task creation
    }
};

/**
 * Create notification when leave is approved
 * @param {Object} leave - Leave object with leaveType, startDate, endDate
 * @param {Object} admin - Admin user object who approved the leave
 */
exports.createLeaveApprovedNotification = async (leave, admin) => {
    try {
        if (!leave.user) {
            console.log('NotificationService: No leave user, skipping notification');
            return;
        }

        // Format dates
        const startDate = new Date(leave.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const endDate = new Date(leave.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        let message = `Your ${leave.leaveType} leave for ${startDate}-${endDate} has been approved`;

        // Include admin comment if provided
        if (leave.adminComment && leave.adminComment.trim()) {
            message += `. Comment: ${leave.adminComment}`;
        }

        await Notification.create({
            user: leave.user._id,
            message,
            type: 'leave_approved',
            relatedLeave: leave._id,
            isRead: false,
        });

        console.log(`NotificationService: Leave approved notification created for user ${leave.user._id}`);
    } catch (error) {
        console.error('NotificationService: Error creating leave approved notification:', error.message);
        // Don't throw - notification failures should not block leave update
    }
};

/**
 * Create notification when leave is rejected
 * @param {Object} leave - Leave object with leaveType, startDate, endDate
 * @param {Object} admin - Admin user object who rejected the leave
 */
exports.createLeaveRejectedNotification = async (leave, admin) => {
    try {
        if (!leave.user) {
            console.log('NotificationService: No leave user, skipping notification');
            return;
        }

        // Format dates
        const startDate = new Date(leave.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const endDate = new Date(leave.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        let message = `Your ${leave.leaveType} leave for ${startDate}-${endDate} has been rejected`;

        // Include rejection reason if provided
        if (leave.adminComment && leave.adminComment.trim()) {
            message += `. Reason: ${leave.adminComment}`;
        }

        await Notification.create({
            user: leave.user._id,
            message,
            type: 'leave_rejected',
            relatedLeave: leave._id,
            isRead: false,
        });

        console.log(`NotificationService: Leave rejected notification created for user ${leave.user._id}`);
    } catch (error) {
        console.error('NotificationService: Error creating leave rejected notification:', error.message);
        // Don't throw - notification failures should not block leave update
    }
};

/**
 * Create deadline reminder notification
 * @param {Object} task - Task object with dueDate, title, assignedTo
 */
exports.createDeadlineReminderNotification = async (task) => {
    try {
        if (!task.assignedTo || !task.dueDate) {
            console.log('NotificationService: Task missing assignedTo or dueDate, skipping deadline reminder');
            return;
        }

        // Format deadline
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const formattedTime = dueDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
        });

        const message = `Reminder: '${task.title}' is due on ${formattedDate} at ${formattedTime}`;

        await Notification.create({
            user: task.assignedTo,
            message,
            type: 'deadline_reminder',
            relatedTask: task._id,
            isRead: false,
        });

        console.log(`NotificationService: Deadline reminder notification created for user ${task.assignedTo}`);
    } catch (error) {
        console.error('NotificationService: Error creating deadline reminder notification:', error.message);
    }
};

/**
 * Get all active users (for sending general notifications)
 * @returns {Array} Array of active user IDs
 */
exports.getActiveUsers = async () => {
    try {
        const users = await User.find().select('_id');
        return users;
    } catch (error) {
        console.error('NotificationService: Error fetching active users:', error.message);
        return [];
    }
};
