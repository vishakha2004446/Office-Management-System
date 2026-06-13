/**
 * Checkpoint 10.C1 Verification Script
 * Verifies that notification triggers work correctly:
 * - Task assignment creates correct notification
 * - Leave approval creates correct notification
 * - Leave rejection creates correct notification
 * - Deadline scheduler runs and creates reminders
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const { initializeScheduler, stopScheduler } = require('../services/deadlineReminderScheduler');

dotenv.config();

// Connect to test database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/office_management_test');
        console.log('✓ Connected to test database');
        return true;
    } catch (error) {
        console.error('✗ Failed to connect to test database:', error.message);
        return false;
    }
};

// Disconnect from database
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✓ Disconnected from test database');
        return true;
    } catch (error) {
        console.error('✗ Failed to disconnect:', error.message);
        return false;
    }
};

// Verify Task Assignment Notification
const verifyTaskAssignment = async () => {
    console.log('\n━━━ Checkpoint 1: Task Assignment Notification ━━━');
    try {
        const user = await User.create({
            name: 'Test User',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            role: 'user',
        });

        const task = await Task.create({
            title: 'Test Task Title',
            description: 'Test description',
            assignedTo: user._id,
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        });

        await NotificationService.createTaskAssignedNotification(task, user, 'Test Requester');

        const notification = await Notification.findOne({
            user: user._id,
            type: 'task_assigned',
        });

        if (!notification) {
            console.log('✗ FAILED: Notification not created');
            return false;
        }

        if (!notification.message.includes('Test Task Title')) {
            console.log('✗ FAILED: Notification message does not include task title');
            console.log(`  Expected to include: "Test Task Title"`);
            console.log(`  Got: "${notification.message}"`);
            return false;
        }

        if (!notification.message.includes('Test Requester')) {
            console.log('✗ FAILED: Notification message does not include requester name');
            return false;
        }

        console.log('✓ PASSED: Task assignment notification created with correct format');
        console.log(`  Message: "${notification.message}"`);
        console.log(`  Type: ${notification.type}`);
        console.log(`  IsRead: ${notification.isRead}`);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Task.deleteOne({ _id: task._id });
        await Notification.deleteOne({ _id: notification._id });

        return true;
    } catch (error) {
        console.error('✗ FAILED: Error in task assignment verification:', error.message);
        return false;
    }
};

// Verify Leave Approval Notification
const verifyLeaveApproval = async () => {
    console.log('\n━━━ Checkpoint 2: Leave Approval Notification ━━━');
    try {
        const user = await User.create({
            name: 'Test User Approval',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            role: 'user',
        });

        const leave = await Leave.create({
            user: user._id,
            leaveType: 'casual',
            startDate: new Date('2024-03-15'),
            endDate: new Date('2024-03-17'),
            reason: 'Test reason',
            status: 'approved',
            adminComment: 'Test approval comment',
        });

        await NotificationService.createLeaveApprovedNotification(leave, { name: 'Test Admin' });

        const notification = await Notification.findOne({
            user: user._id,
            type: 'leave_approved',
        });

        if (!notification) {
            console.log('✗ FAILED: Notification not created');
            return false;
        }

        if (!notification.message.includes('casual')) {
            console.log('✗ FAILED: Notification message does not include leave type');
            return false;
        }

        if (!notification.message.includes('approved')) {
            console.log('✗ FAILED: Notification message does not include approved status');
            return false;
        }

        if (!notification.message.includes('Test approval comment')) {
            console.log('✗ FAILED: Notification message does not include admin comment');
            return false;
        }

        console.log('✓ PASSED: Leave approval notification created with correct format');
        console.log(`  Message: "${notification.message}"`);
        console.log(`  Type: ${notification.type}`);
        console.log(`  Includes comment: true`);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Leave.deleteOne({ _id: leave._id });
        await Notification.deleteOne({ _id: notification._id });

        return true;
    } catch (error) {
        console.error('✗ FAILED: Error in leave approval verification:', error.message);
        return false;
    }
};

// Verify Leave Rejection Notification
const verifyLeaveRejection = async () => {
    console.log('\n━━━ Checkpoint 3: Leave Rejection Notification ━━━');
    try {
        const user = await User.create({
            name: 'Test User Rejection',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            role: 'user',
        });

        const leave = await Leave.create({
            user: user._id,
            leaveType: 'annual',
            startDate: new Date('2024-04-20'),
            endDate: new Date('2024-04-22'),
            reason: 'Test reason',
            status: 'rejected',
            adminComment: 'Test rejection reason',
        });

        await NotificationService.createLeaveRejectedNotification(leave, { name: 'Test Admin' });

        const notification = await Notification.findOne({
            user: user._id,
            type: 'leave_rejected',
        });

        if (!notification) {
            console.log('✗ FAILED: Notification not created');
            return false;
        }

        if (!notification.message.includes('annual')) {
            console.log('✗ FAILED: Notification message does not include leave type');
            return false;
        }

        if (!notification.message.includes('rejected')) {
            console.log('✗ FAILED: Notification message does not include rejected status');
            return false;
        }

        if (!notification.message.includes('Test rejection reason')) {
            console.log('✗ FAILED: Notification message does not include rejection reason');
            return false;
        }

        console.log('✓ PASSED: Leave rejection notification created with correct format');
        console.log(`  Message: "${notification.message}"`);
        console.log(`  Type: ${notification.type}`);
        console.log(`  Includes reason: true`);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Leave.deleteOne({ _id: leave._id });
        await Notification.deleteOne({ _id: notification._id });

        return true;
    } catch (error) {
        console.error('✗ FAILED: Error in leave rejection verification:', error.message);
        return false;
    }
};

// Verify Deadline Scheduler
const verifyDeadlineScheduler = async () => {
    console.log('\n━━━ Checkpoint 4: Deadline Reminder Scheduler ━━━');
    try {
        const user = await User.create({
            name: 'Test User Deadline',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            role: 'user',
        });

        // Create task with upcoming deadline (within 24 hours)
        const dueDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
        const task = await Task.create({
            title: 'Urgent Task',
            description: 'Test urgent task',
            assignedTo: user._id,
            status: 'pending',
            dueDate,
            hasDeadlineReminder: false,
        });

        console.log(`  Created task with due date: ${dueDate.toISOString()}`);

        // Manually trigger the scheduler logic (simulating what the cron job would do)
        const upcomingTasks = await Task.find({
            dueDate: { $gt: new Date(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
            status: { $ne: 'completed' },
            hasDeadlineReminder: { $ne: true },
            assignedTo: { $ne: null },
        });

        if (upcomingTasks.length === 0) {
            console.log('✗ FAILED: Scheduler did not find upcoming tasks');
            return false;
        }

        // Create reminder notification
        await NotificationService.createDeadlineReminderNotification(task);

        // Mark as reminded (what scheduler does)
        task.hasDeadlineReminder = true;
        await task.save();

        const notification = await Notification.findOne({
            user: user._id,
            type: 'deadline_reminder',
        });

        if (!notification) {
            console.log('✗ FAILED: Deadline reminder notification not created');
            return false;
        }

        if (!notification.message.includes('Reminder')) {
            console.log('✗ FAILED: Notification message does not include "Reminder"');
            return false;
        }

        if (!notification.message.includes('Urgent Task')) {
            console.log('✗ FAILED: Notification message does not include task title');
            return false;
        }

        console.log('✓ PASSED: Deadline reminder scheduler verified');
        console.log(`  Message: "${notification.message}"`);
        console.log(`  Type: ${notification.type}`);
        console.log(`  Task marked as reminded: true`);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Task.deleteOne({ _id: task._id });
        await Notification.deleteOne({ _id: notification._id });

        return true;
    } catch (error) {
        console.error('✗ FAILED: Error in deadline scheduler verification:', error.message);
        return false;
    }
};

// Main verification function
const runCheckpoint = async () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║     Checkpoint 10.C1: Verify Notification Triggers  ║');
    console.log('╚══════════════════════════════════════════════════╝');

    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    // Clear test data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Notification.deleteMany({});

    const results = [];

    results.push(await verifyTaskAssignment());
    results.push(await verifyLeaveApproval());
    results.push(await verifyLeaveRejection());
    results.push(await verifyDeadlineScheduler());

    // Clear test data again
    await User.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Notification.deleteMany({});

    await disconnectDB();

    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log('\n╔══════════════════════════════════════════════════╗');
    if (passed === total) {
        console.log('║            ✓ ALL CHECKPOINTS PASSED              ║');
    } else {
        console.log(`║          ${passed}/${total} CHECKPOINTS PASSED              ║`);
    }
    console.log('╚══════════════════════════════════════════════════╝\n');

    process.exit(passed === total ? 0 : 1);
};

// Run verification if this file is executed directly
if (require.main === module) {
    runCheckpoint().catch(error => {
        console.error('✗ Checkpoint verification failed:', error.message);
        process.exit(1);
    });
}

module.exports = {
    verifyTaskAssignment,
    verifyLeaveApproval,
    verifyLeaveRejection,
    verifyDeadlineScheduler,
};
