const Department = require('../models/Department');
const User = require('../models/User');

// GET /api/departments — get all departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch departments' });
    }
};

// POST /api/departments — create a department (admin)
exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }
        const exists = await Department.findOne({ name: name.trim() });
        if (exists) {
            return res.status(400).json({ message: 'Department already exists' });
        }
        const department = await Department.create({ name: name.trim() });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create department' });
    }
};

// DELETE /api/departments/:id — delete a department (admin)
exports.deleteDepartment = async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        // unassign from users who had this department
        await User.updateMany(
            { department: req.params.id },
            { $unset: { department: '' } }
        );
        res.json({ message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete department' });
    }
};

// PUT /api/departments/assign — assign a department to a user (admin)
exports.assignDepartment = async (req, res) => {
    try {
        const { userId, departmentId } = req.body;
        const user = await User.findByIdAndUpdate(
            userId,
            { department: departmentId || null },
            { new: true }
        ).populate('department', 'name');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign department' });
    }
};
