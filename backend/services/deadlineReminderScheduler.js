const cron = require('node-cron');
const Task = require('../models/Task');
const NotificationService = require('./notificationService');

let schedulerJob = null;

/**
 * DeadlineReminderScheduler - Service to send deadline reminder notifications
 * Runs periodically to check for tasks with approaching deadlines
 */

/**
 * Initialize the deadline reminder scheduler
 * Runs every hour to check for tasks with deadlines within next 24 hours
 */
exports.initializeScheduler = () => {
    try {
        console.log('DeadlineReminderScheduler: Initializing scheduler...');

        // Schedule job to run every hour (cron: '0 * * * *')
        schedulerJob = cron.schedule('0 * * * *', async () => {
            await triggerDeadlineReminders();
        });

        console.log('DeadlineReminderScheduler: Scheduler initialized successfully');
    } catch (error) {
        console.error('DeadlineReminderScheduler: Error initializing scheduler:', error.message);
        // Don't throw - scheduler failure should not crash the server
    }
};

/**
 * Trigger deadline reminders for tasks with approaching deadlines
 * Internal function called by the scheduler
 */
const triggerDeadlineReminders = async () => {
    try {
        console.log('DeadlineReminderScheduler: Running deadline reminder job...');

        // Calculate the time range: now to 24 hours from now
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Find tasks with:
        // - dueDate within next 24 hours
        // - status !== 'completed'
        // - hasDeadlineReminder !== true (to prevent duplicates)
        // - assignedTo is not null (task must be assigned)
        const upcomingTasks = await Task.find({
            dueDate: { $gt: now, $lte: in24Hours },
            status: { $ne: 'completed' },
            hasDeadlineReminder: { $ne: true },
            assignedTo: { $ne: null },
        }).populate('assignedTo', 'name email');

        if (upcomingTasks.length === 0) {
            console.log('DeadlineReminderScheduler: No upcoming deadlines found');
            return;
        }

        console.log(`DeadlineReminderScheduler: Found ${upcomingTasks.length} tasks with upcoming deadlines`);

        // Create deadline reminder notifications for each task
        for (const task of upcomingTasks) {
            try {
                await NotificationService.createDeadlineReminderNotification(task);

                // Mark task as reminded to prevent duplicate notifications
                task.hasDeadlineReminder = true;
                await task.save();

                console.log(`DeadlineReminderScheduler: Reminder sent for task ${task._id}`);
            } catch (taskError) {
                console.error(`DeadlineReminderScheduler: Error processing task ${task._id}:`, taskError.message);
                // Continue with next task on error
            }
        }

        console.log('DeadlineReminderScheduler: Deadline reminder job completed');
    } catch (error) {
        console.error('DeadlineReminderScheduler: Error in triggerDeadlineReminders:', error.message);
    }
};

/**
 * Stop the scheduler gracefully
 */
exports.stopScheduler = () => {
    if (schedulerJob) {
        try {
            schedulerJob.stop();
            schedulerJob.destroy();
            console.log('DeadlineReminderScheduler: Scheduler stopped');
        } catch (error) {
            console.error('DeadlineReminderScheduler: Error stopping scheduler:', error.message);
        }
    }
};
