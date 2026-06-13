const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventsByDateRange,
    updateEvent,
    deleteEvent,
    getEventById,
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// User routes - can view events
router.get('/user/events', protect, getEvents); // Users can view all public events

// Admin routes
router.post('/', protect, isAdmin, createEvent);
router.get('/range', protect, isAdmin, getEventsByDateRange); // Get events by date range
router.get('/', protect, isAdmin, getEvents); // Get all events with filters
router.get('/:id', protect, isAdmin, getEventById); // Get event by ID
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent);

module.exports = router;
