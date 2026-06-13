import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// Format a Date object to readable time string e.g. "09:32 AM"
const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// Format a date string YYYY-MM-DD to "Mon, 20 May 2026"
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// Calculate hours worked between checkIn and checkOut
const calcHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "—";
    const diff = (new Date(checkOut) - new Date(checkIn)) / 1000 / 60; // minutes
    const h = Math.floor(diff / 60);
    const m = Math.floor(diff % 60);
    return `${h}h ${m}m`;
};

// Status badge colours
const statusStyles = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    "half-day": "bg-yellow-100 text-yellow-700",
};

const Attendance = () => {
    const [today, setToday] = useState(null);       // today's attendance record
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] 
    = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch today's record and full history
    const fetchData = useCallback(async () => {
        try {
            const [todayRes, historyRes] = await Promise.all([
                API.get("/attendance/today"),
                API.get("/attendance/history"),
            ]);
            setToday(todayRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            setError("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleCheckIn = async () => {
        setError("");
        setActionLoading(true);
        try {
            await API.post("/attendance/checkin");
            showMessage("✓ Checked in successfully!");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Check-in failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setError("");
        setActionLoading(true);
        try {
            await API.post("/attendance/checkout");
            showMessage("✓ Checked out successfully!");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Check-out failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Derive button states from today's record
    const hasCheckedIn = today?.checkIn;
    const hasCheckedOut = today?.checkOut;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Attendance</h2>

                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {/* Feedback banners */}
                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded">
                                    {message}
                                </div>
                            )}

                            {/* Today's card */}
                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Today —{" "}
                                    <span className="text-gray-500 font-normal">
                                        {new Date().toLocaleDateString("en-US", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </h3>

                                {/* Time summary */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <StatBox
                                        label="Check-In"
                                        value={formatTime(today?.checkIn)}
                                        colour="text-green-600"
                                    />
                                    <StatBox
                                        label="Check-Out"
                                        value={formatTime(today?.checkOut)}
                                        colour="text-red-500"
                                    />
                                    <StatBox
                                        label="Hours Worked"
                                        value={calcHours(today?.checkIn, today?.checkOut)}
                                        colour="text-blue-600"
                                    />
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={!!hasCheckedIn || actionLoading}
                                        className={`px-6 py-2 rounded font-medium transition-colors text-white
                                            ${hasCheckedIn
                                                ? "bg-green-300 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-600"
                                            }`}
                                    >
                                        {actionLoading && !hasCheckedIn ? "..." : hasCheckedIn ? "Checked In ✓" : "Check In"}
                                    </button>

                                    <button
                                        onClick={handleCheckOut}
                                        disabled={!hasCheckedIn || !!hasCheckedOut || actionLoading}
                                        className={`px-6 py-2 rounded font-medium transition-colors text-white
                                            ${!hasCheckedIn || hasCheckedOut
                                                ? "bg-red-300 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600"
                                            }`}
                                    >
                                        {hasCheckedOut ? "Checked Out ✓" : "Check Out"}
                                    </button>
                                </div>
                            </div>

                            {/* Attendance History */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Attendance History
                                </h3>

                                {history.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6">
                                        No attendance records found.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 text-left text-sm text-gray-600">
                                                    <th className="px-4 py-3 border">Date</th>
                                                    <th className="px-4 py-3 border">Check-In</th>
                                                    <th className="px-4 py-3 border">Check-Out</th>
                                                    <th className="px-4 py-3 border">Hours</th>
                                                    <th className="px-4 py-3 border">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((record) => (
                                                    <tr
                                                        key={record._id}
                                                        className="text-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 border text-gray-700">
                                                            {formatDate(record.date)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-green-600 font-medium">
                                                            {formatTime(record.checkIn)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-red-500 font-medium">
                                                            {formatTime(record.checkOut)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-blue-600">
                                                            {calcHours(record.checkIn, record.checkOut)}
                                                        </td>
                                                        <td className="px-4 py-3 border">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[record.status] || "bg-gray-100 text-gray-600"}`}
                                                            >
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Small stat box used in today's card
const StatBox = ({ label, value, colour }) => (
    <div className="bg-gray-50 rounded-lg p-4 text-center border">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colour}`}>{value}</p>
    </div>
);

export default Attendance;
