import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import NotificationItem from "../../components/notifications/NotificationItem";
import NotificationFilters from "../../components/notifications/NotificationFilters";
import NotificationSearch from "../../components/notifications/NotificationSearch";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    empty: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    loading: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z",
    retry: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

// ── notifications page ────────────────────────────────────────────────────────
const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const ITEMS_PER_PAGE = 10;

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page,
                limit: ITEMS_PER_PAGE,
            });
            if (filter) params.append("type", filter);
            if (search) params.append("search", search);

            const response = await API.get(`/notifications?${params.toString()}`);
            setNotifications(response.data.data || []);
            setTotalCount(response.data.total || 0);
            setTotalPages(Math.ceil((response.data.total || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [page, filter, search]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle filter change
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    // Handle search
    const handleSearch = (searchTerm) => {
        setSearch(searchTerm);
        setPage(1);
    };

    // Handle delete
    const handleDelete = (notificationId) => {
        setNotifications(notifs => notifs.filter(n => n._id !== notificationId));
        setTotalCount(prev => Math.max(0, prev - 1));
    };

    // Handle mark as read
    const handleMarkAsRead = (notificationId) => {
        setNotifications(notifs =>
            notifs.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            )
        );
    };

    // Handle clear all
    const handleClearAll = async () => {
        if (!window.confirm("Delete all notifications? This cannot be undone.")) return;

        try {
            await API.delete("/notifications/clear-all");
            setNotifications([]);
            setTotalCount(0);
            setPage(1);
        } catch (err) {
            console.error("Error clearing notifications:", err);
            alert("Failed to clear notifications");
        }
    };

    // Pagination
    const canPrevious = page > 1;
    const canNext = page < totalPages;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-50 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6 max-w-4xl">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">My Notifications</h2>
                        <p className="text-sm text-gray-500">
                            {totalCount === 0 ? "No notifications" : `${totalCount} notification${totalCount !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <NotificationSearch searchTerm={search} onSearch={handleSearch} />
                                </div>
                                {totalCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm whitespace-nowrap"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <NotificationFilters currentFilter={filter} onFilterChange={handleFilterChange} />
                        </div>
                    </div>

                    {/* Content */}
                    {loading && !notifications.length ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Svg d={ICONS.loading} />
                            <p className="text-gray-500 mt-2">Loading notifications...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200">
                            <Svg d={ICONS.error} />
                            <p className="text-red-700 mt-2 font-medium">{error}</p>
                            <button
                                onClick={() => fetchNotifications()}
                                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Svg d={ICONS.empty} />
                            <p className="text-gray-500 mt-2">No notifications yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Notification list */}
                            <div className="space-y-3 mb-6">
                                {notifications.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onDelete={handleDelete}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-4">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={!canPrevious}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium text-sm"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!canNext}
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
    );
};

export default Notifications;
