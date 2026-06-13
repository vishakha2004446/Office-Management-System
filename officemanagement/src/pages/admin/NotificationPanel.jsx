import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    send: "M12 19l9 2-9-18-9 18 9-2m0 0v-8",
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

// Badge styles for notification types
const TYPE_BADGE_STYLES = {
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

// Format timestamp
const formatTimestamp = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ── admin notification panel ──────────────────────────────────────────────────
const NotificationPanel = () => {
    // Send form state
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendMessage, setSendMessage] = useState(null);
    const [sendMessageType, setSendMessageType] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    const [typeFilter, setTypeFilter] = useState("");
    const [historyPage, setHistoryPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const HISTORY_PER_PAGE = 20;

    // Fetch notification history
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const params = new URLSearchParams({
                page: historyPage,
                limit: HISTORY_PER_PAGE,
            });
            if (typeFilter) params.append("type", typeFilter);

            const response = await API.get(`/notifications/admin/history?${params.toString()}`);
            setHistory(response.data.data || []);
            setTotalPages(Math.ceil((response.data.total || 0) / HISTORY_PER_PAGE));
        } catch (err) {
            console.error("Error fetching notification history:", err);
            setHistoryError("Failed to load notification history");
        } finally {
            setHistoryLoading(false);
        }
    }, [historyPage, typeFilter]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Auto-dismiss messages
    useEffect(() => {
        if (!sendMessage) return;
        const timer = setTimeout(() => setSendMessage(null), 3500);
        return () => clearTimeout(timer);
    }, [sendMessage]);

    // Handle send notification
    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setSendMessage("Please enter a message");
            setSendMessageType("error");
            return;
        }

        setSending(true);
        try {
            const response = await API.post("/notifications/send-general", { message });
            const sentCount = response.data.sentCount || response.data.recipientCount || "all";
            setSendMessage(`Notification sent to ${sentCount} users`);
            setSendMessageType("success");
            setMessage("");
            // Refresh history
            setHistoryPage(1);
            fetchHistory();
        } catch (err) {
            console.error("Error sending notification:", err);
            setSendMessage(err.response?.data?.message || err.message || "Failed to send notification");
            setSendMessageType("error");
        } finally {
            setSending(false);
        }
    };

    const messageLength = message.length;
    const maxChars = 500;
    const canSend = messageLength > 0 && messageLength <= maxChars && !sending;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-50 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6 max-w-6xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Panel</h2>

                    {/* Send Notification Section */}
                    <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Notification to All Users</h3>

                        <form onSubmit={handleSendNotification}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                                    placeholder="Enter notification message..."
                                    maxLength={maxChars}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <div />
                                    <span className="text-xs text-gray-500">
                                        {messageLength}/{maxChars}
                                    </span>
                                </div>
                            </div>

                            {/* Status message */}
                            {sendMessage && (
                                <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
                                    sendMessageType === "success"
                                        ? "bg-green-50 border border-green-200 text-green-700"
                                        : "bg-red-50 border border-red-200 text-red-700"
                                }`}>
                                    <Svg d={sendMessageType === "success" ? ICONS.success : ICONS.error} />
                                    <span className="text-sm font-medium">{sendMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!canSend}
                                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                                    canSend
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <Svg d={ICONS.send} />
                                {sending ? "Sending..." : "Send to All Users"}
                            </button>
                        </form>
                    </div>

                    {/* Notification History Section */}
                    <div className="bg-white rounded-lg border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Notification History</h3>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setHistoryPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="task_assigned">Task Assigned</option>
                                <option value="leave_approved">Leave Approved</option>
                                <option value="leave_rejected">Leave Rejected</option>
                                <option value="deadline_reminder">Deadline Reminder</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        {historyLoading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Loading notification history...</p>
                            </div>
                        ) : historyError ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="text-red-700 font-medium mb-3">{historyError}</p>
                                <button
                                    onClick={() => fetchHistory()}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No notifications found</p>
                            </div>
                        ) : (
                            <>
                                {/* History table */}
                                <div className="overflow-x-auto mb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Recipient</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Message</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((notif) => (
                                                <tr key={notif._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{notif.user?.name || "Unknown"}</p>
                                                            <p className="text-xs text-gray-500">{notif.user?.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-gray-700 max-w-md truncate">{notif.message}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            TYPE_BADGE_STYLES[notif.type] || TYPE_BADGE_STYLES.general
                                                        }`}>
                                                            {formatType(notif.type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                        {formatTimestamp(notif.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <button
                                            onClick={() => setHistoryPage(p => p - 1)}
                                            disabled={historyPage === 1}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium text-sm"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-600">
                                            Page {historyPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setHistoryPage(p => p + 1)}
                                            disabled={historyPage === totalPages}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium text-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;
