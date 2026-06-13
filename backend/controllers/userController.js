const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().populate("department");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
};

// Get logged-in user's profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("department", "name");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// Update logged-in user's profile (email and/or password)
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { email, currentPassword, newPassword } = req.body;

        // Update email if provided and different
        if (email && email !== user.email) {
            const emailTaken = await User.findOne({ email });
            if (emailTaken) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Assign department to user (Admin only)
exports.assignDepartmentToUser = async (req, res) => {
    try {
        const { userId } = req.params;  // Get userId from URL parameter
        const { departmentId } = req.body;  // Get departmentId from body

        console.log("🔵 Assign department request:", { userId, departmentId });

        // Validate user ID
        if (!userId) {
            console.log("❌ User ID is missing");
            return res.status(400).json({ message: "User ID is required" });
        }

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User found:", user.name);

        // If departmentId is provided, validate it exists
        if (departmentId) {
            const Department = require("../models/Department");
            const dept = await Department.findById(departmentId);
            if (!dept) {
                console.log("❌ Department not found:", departmentId);
                return res.status(404).json({ message: "Department not found" });
            }
            console.log("✅ Department found:", dept.name);
            user.department = departmentId;
        } else {
            // If no departmentId, unassign department
            console.log("🔄 Unassigning department");
            user.department = null;
        }

        await user.save();
        console.log("✅ User saved with department:", user.department);

        // Populate and return the updated user
        await user.populate("department", "name");

        console.log("✅ Department assigned successfully");

        res.json({
            success: true,
            message: "Department assigned successfully",
            user: user
        });
    } catch (error) {
        console.error("❌ Error assigning department:", error);
        res.status(500).json({ 
            message: "Failed to assign department",
            error: error.message 
        });
    }
};