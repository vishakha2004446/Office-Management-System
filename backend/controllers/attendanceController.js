const Attendance = require('../models/Attendance');

// Helper: get today's date string YYYY-MM-DD
const todayStr = () => new Date().toISOString().split('T')[0];

// POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
    try {
        const date = todayStr();
        const existing = await Attendance.findOne({ user: req.user._id, date });

        if (existing && existing.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const record = existing
            ? await Attendance.findByIdAndUpdate(
                  existing._id,
                  { checkIn: new Date() },
                  { new: true }
              )
            : await Attendance.create({
                  user: req.user._id,
                  date,
                  checkIn: new Date(),
              });

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Check-in failed' });
    }
};

// POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
    try {
        const date = todayStr();
        const record = await Attendance.findOne({ user: req.user._id, date });

        if (!record || !record.checkIn) {
            return res.status(400).json({ message: 'You have not checked in today' });
        }
        if (record.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        record.checkOut = new Date();
        await record.save();
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Check-out failed' });
    }
};

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
    try {
        const date = todayStr();
        const record = await Attendance.findOne({ user: req.user._id, date });
        res.json(record || null);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch today attendance' });
    }
};

// GET /api/attendance/history
exports.getAttendanceHistory = async (req, res) => {
    try {
        const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch attendance history' });
    }
};

// GET /api/attendance/all — admin views all users' attendance
exports.getAllAttendance = async (req, res) => {
    try {
        const records = await Attendance.find()
            .populate('user', 'name email')
            .sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all attendance records' });
    }
};

// GET /api/attendance/my-stats — user gets their own attendance counts
exports.getMyAttendanceStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const [totalDays, presentDays, absentDays] = await Promise.all([
            Attendance.countDocuments({ user: userId }),
            Attendance.countDocuments({ user: userId, status: 'present' }),
            Attendance.countDocuments({ user: userId, status: 'absent' }),
        ]);
        res.json({ totalDays, presentDays, absentDays });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch attendance stats' });
    }
};
