const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("🔐 Token received, verifying...");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ Token verified, fetching user...");
            req.user = await User.findById(decoded.id).select("-password");
            console.log("✅ User found:", req.user?.email, "Role:", req.user?.role);
            next();
        } catch (error){
            console.error("❌ Token verification error:", error.message);
            return res.status(401).json({
                message:"Not Authorized",
                error: error.message
            });
        }
    } else {
        console.error("❌ No authorization header found");
        return res.status(401).json({
            message : "No Token"
        });
    }
};
module.exports = { protect };