const isAdmin = (req, res, next) => {
    console.log("👤 Checking admin access. User role:", req.user?.role);
    if(req.user && req.user.role === "admin"){
        console.log("✅ Admin access granted");
        next();
    } else {
        console.error("❌ Admin access denied. User role:", req.user?.role);
        res.status(403).json({
            success: false,
            message: "Admin access only",
            userRole: req.user?.role
        });
    }
};
module.exports = { isAdmin };