const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    type: {
        type: String,
        enum: ['meeting', 'task_deadline', 'company_holiday', 'department_event', 'important_date'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    time: String,
    location: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    reminder: {
        type: Boolean,
        default: false,
    },
    reminderDays: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ department: 1 });

module.exports = mongoose.model('Event', eventSchema);
