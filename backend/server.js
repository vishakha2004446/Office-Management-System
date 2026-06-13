const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { initializeScheduler } = require("./services/deadlineReminderScheduler");

dotenv.config();
connectDB();

initializeScheduler();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
// app.use("/api/documents", require("./routes/documentRoutes"));

// Serve uploaded files
app.use("/uploads", express.static("uploads")   );

console.log("✅ All routes registered");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});