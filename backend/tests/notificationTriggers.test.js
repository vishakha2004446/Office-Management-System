/**
 * Integration tests for notification triggers
 * Tests: Task assignment, Leave approval/rejection, Deadline reminders
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');

dotenv.config();

// Connect to test database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/office_management_test');
        console.log('Connected to test database');
    } catch (error) {
        console.error('Failed to connect to test database:', error.message);
        process.exit(1);
    }
};

// Clean up and disconnect
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from test database');
    } catch (error) {
        console.error('Failed to disconnect:', error.message);
    }
};

// Test: Task assignment notification
const testTaskAssignmentNotification = async () => {
    console.log('\n--- Test: Task Assignment Notification ---');
    try {
        // Create a test user
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user',
        });

        // Create a task assigned to the user
        const task = await Task.create({
            title: 'Project Report',
            description: 'Complete project report',
            assignedTo: user._id,
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        });

        // Trigger notification
        await NotificationService.createTaskAssignedNotification(task, user, 'Manager Name');

        // Verify notification was created
        const notification = await Notification.findOne({ user: user._id, type: 'task_assigned' });

        if (notification && notification.message.includes('Project Report') && notification.message.includes('Manager Name')) {
            console.log('✓ Task assignment notification created correctly');
            console.log(`  Message: ${notification.message}`);
            return true;
        } else {
            console.log('✗ Task assignment notification not found or incorrect');
            return false;
        }
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
};

// Test: Leave approval notification
const testLeaveApprovalNotification = async () => {
    console.log('\n--- Test: Leave Approval Notification ---');
    try {
        // Create a test user
        const user = await User.create({
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'password123',
            role: 'user',
        });

        // Create a leave request
        const leave = await Leave.create({
            user: user._id,
            leaveType: 'casual',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-17'),
            reason: 'Personal reasons',
            status: 'approved',
            adminComment: 'Approved. Enjoy your break!',
        });

        // Trigger notification
        await NotificationService.createLeaveApprovedNotification(leave, { name: 'Admin User' });

        // Verify notification was created
        const notification = await Notification.findOne({ user: user._id, type: 'leave_approved' });

        if (notification && notification.message.includes('casual') && notification.message.includes('approved')) {
            console.log('✓ Leave approval notification created correctly');
            console.log(`  Message: ${notification.message}`);
            return true;
        } else {
            console.log('✗ Leave approval notification not found or incorrect');
            return false;
        }
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
};

// Test: Leave rejection notification
const testLeaveRejectionNotification = async () => {
    console.log('\n--- Test: Leave Rejection Notification ---');
    try {
        // Create a test user
        const user = await User.create({
            name: 'Bob Johnson',
            email: 'bob@example.com',
            password: 'password123',
            role: 'user',
        });

        // Create a leave request
        const leave = await Leave.create({
            user: user._id,
            leaveType: 'annual',
            startDate: new Date('2024-02-20'),
            endDate: new Date('2024-02-22'),
            reason: 'Vacation',
            status: 'rejected',
            adminComment: 'Critical project phase',
        });

        // Trigger notification
        await NotificationService.createLeaveRejectedNotification(leave, { name: 'Admin User' });

        // Verify notification was created
        const notification = await Notification.findOne({ user: user._id, type: 'leave_rejected' });

        if (notification && notification.message.includes('annual') && notification.message.includes('rejected')) {
            console.log('✓ Leave rejection notification created correctly');
            console.log(`  Message: ${notification.message}`);
            return true;
        } else {
            console.log('✗ Leave rejection notification not found or incorrect');
            return false;
        }
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
};

// Test: Deadline reminder notification
const testDeadlineReminderNotification = async () => {
    console.log('\n--- Test: Deadline Reminder Notification ---');
    try {
        // Create a test user
        const user = await User.create({
            name: 'Alice Brown',
            email: 'alice@example.com',
            password: 'password123',
            role: 'user',
        });

        // Create a task with upcoming deadline
        const dueDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
        const task = await Task.create({
            title: 'Client Presentation',
            description: 'Prepare presentation slides',
            assignedTo: user._id,
            status: 'pending',
            dueDate,
            hasDeadlineReminder: false,
        });

        // Trigger notification
        await NotificationService.createDeadlineReminderNotification(task);

        // Verify notification was created
        const notification = await Notification.findOne({ user: user._id, type: 'deadline_reminder' });

        if (notification && notification.message.includes('Client Presentation') && notification.message.includes('Reminder')) {
            console.log('✓ Deadline reminder notification created correctly');
            console.log(`  Message: ${notification.message}`);
            return true;
        } else {
            console.log('✗ Deadline reminder notification not found or incorrect');
            return false;
        }
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
};

// Run all tests
const runTests = async () => {
    console.log('=========================================');
    console.log('   Notification Triggers Test Suite');
    console.log('=========================================');

    await connectDB();

    // Clear test data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Notification.deleteMany({});

    const results = [];

    results.push(await testTaskAssignmentNotification());
    results.push(await testLeaveApprovalNotification());
    results.push(await testLeaveRejectionNotification());
    results.push(await testDeadlineReminderNotification());

    // Clean up test data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Notification.deleteMany({});

    await disconnectDB();

    // Summary
    console.log('\n=========================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log('=========================================\n');

    process.exit(passed === total ? 0 : 1);
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testTaskAssignmentNotification,
    testLeaveApprovalNotification,
    testLeaveRejectionNotification,
    testDeadlineReminderNotification,
};
