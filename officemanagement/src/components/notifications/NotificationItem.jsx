import { useState } from "react";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    check: "M5 13l4 4L19 7",
};

// Type badge styles
const BADGE_STYLES = {
    task_assigned: "bg-blue-100 text-blue-700",
    leave_approved: "bg-green-100 text-green-700",
    leave_rejected: "bg-red-100 text-red-700",
    deadline_reminder: "bg-orange-100 text-orange-700",
    general: "bg-gray-100 text-gray-700",
};

// Format notification type for display
const formatType = (type) => {
    return type
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Format timestamp relative (e.g., "2 hours ago")
const formatTimestamp = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return notifDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── notification item ─────────────────────────────────────────────────────────
const NotificationItem = ({ notification, onDelete, onMarkAsRead }) => {
    const [deleting, setDeleting] = useState(false);
    const [marking, setMarking] = useState(false);

    const handleMarkAsRead = async () => {
        setMarking(true);
        try {
            await API.put(`/notifications/${notification._id}/mark-read`);
            onMarkAsRead(notification._id);
        } catch (error) {
            console.error("Error marking as read:", error);
        } finally {
            setMarking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this notification?")) return;

        setDeleting(true);
        try {
            await API.delete(`/notifications/${notification._id}`);
            onDelete(notification._id);
        } catch (error) {
            console.error("Error deleting notification:", error);
            alert("Failed to delete notification");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={`border rounded-lg p-4 flex items-start justify-between gap-4 transition-colors ${
            notification.isRead
                ? "bg-gray-50 border-gray-200"
                : "bg-blue-50 border-blue-200"
        }`}>
            <div className="flex-1 min-w-0">
                {/* Type badge and timestamp row */}
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${BADGE_STYLES[notification.type] || BADGE_STYLES.general}`}>
                        {formatType(notification.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.createdAt)}
                    </span>
                </div>

                {/* Message text */}
                <p className={`text-sm leading-relaxed break-words ${
                    notification.isRead
                        ? "text-gray-600"
                        : "font-semibold text-gray-800"
                }`}>
                    {notification.message}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.isRead && (
                    <button
                        onClick={handleMarkAsRead}
                        disabled={marking || deleting}
                        className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark as read"
                    >
                        <Svg d={ICONS.check} />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting || marking}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                >
                    <Svg d={ICONS.delete} />
                </button>
            </div>
        </div>
    );
};

export default NotificationItem;
