// ── filter type badge styles ──────────────────────────────────────────────────
const FILTER_OPTIONS = [
    { value: "", label: "All Types" },
    { value: "task_assigned", label: "Task Assigned" },
    { value: "leave_approved", label: "Leave Approved" },
    { value: "leave_rejected", label: "Leave Rejected" },
    { value: "deadline_reminder", label: "Deadline Reminder" },
    { value: "general", label: "General" },
];

// ── notification filters ──────────────────────────────────────────────────────
const NotificationFilters = ({ currentFilter, onFilterChange }) => {
    return (
        <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map(option => (
                <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        currentFilter === option.value
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default NotificationFilters;
