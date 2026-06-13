import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
};

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount
    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await API.get("/notifications/unread-count");
                setUnreadCount(response.data.unreadCount || 0);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchUnreadCount();

        // Polling for updates (optional - can replace with WebSocket later)
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleNotificationClick = () => {
        navigate("/user/notifications");
    };

    const displayCount = unreadCount > 99 ? "99+" : unreadCount;
    const showBadge = unreadCount > 0;

    return (
        <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">
                Office Management System
            </h1>
            <div className="flex items-center gap-4">
                {user && (
                    <>
                        {/* Notification bell (for user role) */}
                        {user.role === "user" && (
                            <button
                                onClick={handleNotificationClick}
                                className="relative p-2 hover:bg-blue-700 rounded-lg transition-colors"
                                title="Notifications"
                            >
                                <Svg d={ICONS.bell} />
                                {showBadge && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {displayCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <span className="text-l">
                            Welcome, {user.name}
                        </span>
                        <button onClick={logout}
                            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;