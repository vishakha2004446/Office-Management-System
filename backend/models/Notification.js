const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['task_assigned', 'leave_approved', 'leave_rejected', 'deadline_reminder', 'general'],
            default: 'general',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null,
        },
        relatedLeave: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Leave',
            default: null,
        },
    },
    { timestamps: true }
);

// Create indexes for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });  // For fetching user notifications paginated
notificationSchema.index({ user: 1, isRead: 1 });      // For unread count queries
notificationSchema.index({ type: 1 });                 // For filtering by type

module.exports = mongoose.model('Notification', notificationSchema);
