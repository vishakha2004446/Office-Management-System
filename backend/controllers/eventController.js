const Event = require('../models/Event');
const NotificationService = require('../services/notificationService');

// Admin: Create event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, type, startDate, endDate, time, location, department, attendees, reminder, reminderDays } = req.body;

        const event = await Event.create({
            title,
            description,
            type,
            startDate,
            endDate,
            time,
            location,
            department,
            attendees,
            reminder,
            reminderDays,
            createdBy: req.user._id,
        });

        const populatedEvent = await event.populate(['department', 'attendees', 'createdBy']);

        // Send notifications to attendees
        if (attendees && attendees.length > 0) {
            attendees.forEach(userId => {
                NotificationService.createEventNotification(event, userId, `New ${type} scheduled: ${title}`);
            });
        }

        res.json(populatedEvent);
    } catch (error) {
        console.error('Event creation error:', error);
        res.status(500).json({ message: 'Failed to create event' });
    }
};

// Admin: Get all events with filters
exports.getEvents = async (req, res) => {
    try {
        const { type, department, startDate, endDate } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (department) filter.department = department;
        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) filter.startDate.$gte = new Date(startDate);
            if (endDate) filter.startDate.$lte = new Date(endDate);
        }

        const events = await Event.find(filter)
            .populate('department', 'name')
            .populate('attendees', 'name email')
            .populate('createdBy', 'name')
            .sort({ startDate: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Admin: Get events by date range (for calendar view)
exports.getEventsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        const events = await Event.find({
            $or: [
                { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
                { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
            ],
        })
            .populate('department', 'name')
            .populate('attendees', 'name email')
            .populate('createdBy', 'name')
            .sort({ startDate: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get events by date range error:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Admin: Update event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const event = await Event.findByIdAndUpdate(id, updates, { new: true })
            .populate('department', 'name')
            .populate('attendees', 'name email')
            .populate('createdBy', 'name');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
};

// Admin: Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id)
            .populate('department', 'name')
            .populate('attendees', 'name email')
            .populate('createdBy', 'name');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
};
