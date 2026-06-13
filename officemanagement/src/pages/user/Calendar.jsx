import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// Icon component
const Svg = ({ d, className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    task: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    leave: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    meeting: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

const Calendar_View = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch tasks, leaves, and admin events
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            console.log("🔄 Fetching calendar data...");
            
            const [tasksRes, leavesRes, eventsRes] = await Promise.all([
                API.get("/tasks").catch(err => {
                    console.error("Tasks fetch error:", err.response?.data || err.message);
                    return { data: [] };
                }),
                API.get("/leaves/my").catch(err => {
                    console.error("Leaves fetch error:", err.response?.data || err.message);
                    return { data: [] };
                }),
                API.get("/events/user/events").catch(err => {
                    console.error("Events fetch error:", err.response?.data || err.message);
                    return { data: [] };
                }),
            ]);
            
            console.log("✅ Tasks loaded:", tasksRes.data?.length || 0);
            console.log("✅ Leaves loaded:", leavesRes.data?.length || 0);
            console.log("✅ Admin Events loaded:", eventsRes.data?.length || 0);
            
            setTasks(tasksRes.data || []);
            setLeaves(leavesRes.data || []);
            setEvents(eventsRes.data || []);
        } catch (err) {
            console.error("❌ Calendar data error:", err);
            setError("Failed to load calendar data. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get events for a specific date
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split("T")[0];
        const allEvents = [];

        // Add tasks with due date
        tasks.forEach((task) => {
            if (task.dueDate && task.dueDate.startsWith(dateStr)) {
                allEvents.push({
                    type: "task",
                    title: task.title,
                    status: task.status,
                    id: task._id,
                });
            }
        });

        // Add leaves
        leaves.forEach((leave) => {
            const startDate = leave.startDate.split("T")[0];
            const endDate = leave.endDate.split("T")[0];
            if (dateStr >= startDate && dateStr <= endDate) {
                allEvents.push({
                    type: "leave",
                    title: `Leave: ${leave.leaveType}`,
                    status: leave.status,
                    id: leave._id,
                });
            }
        });

        // Add admin events
        events.forEach((event) => {
            const startDate = event.startDate.split("T")[0];
            const endDate = event.endDate.split("T")[0];
            if (dateStr >= startDate && dateStr <= endDate) {
                allEvents.push({
                    type: event.type,
                    title: event.title,
                    status: event.status,
                    id: event._id,
                    description: event.description,
                    location: event.location,
                    time: event.time,
                });
            }
        });

        return allEvents;
    };

    // Get selected date events
    const selectedEvents = getEventsForDate(selectedDate);

    // Custom tile content for calendar
    const getTileContent = ({ date }) => {
        const dateEvents = getEventsForDate(date);
        if (dateEvents.length === 0) return null;

        const getEventColor = (type) => {
            const colors = {
                task: "bg-blue-500",
                leave: "bg-orange-500",
                meeting: "bg-indigo-500",
                company_holiday: "bg-green-500",
                department_event: "bg-purple-500",
                important_date: "bg-yellow-500",
            };
            return colors[type] || "bg-gray-500";
        };

        return (
            <div className="flex flex-col gap-0.5 text-xs mt-1">
                {dateEvents.slice(0, 2).map((event, idx) => (
                    <div
                        key={idx}
                        className={`px-1 py-0.5 rounded text-white text-[10px] truncate ${getEventColor(event.type)}`}
                    >
                        {event.title.substring(0, 12)}...
                    </div>
                ))}
                {dateEvents.length > 2 && (
                    <div className="text-[10px] text-gray-500">+{dateEvents.length - 2} more</div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Calendar View</h2>

    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => {
                                    setError("");
                                    setLoading(true);
                                    fetchData();
                                }}
                                className="ml-4 px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-xs font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Calendar */}
                            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <Calendar
                                    onChange={setSelectedDate}
                                    value={selectedDate}
                                    tileContent={getTileContent}
                                    className="w-full"
                                />
                            </div>

                            {/* Events for selected date */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Date header */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {selectedDate.toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {/* Events list */}
                                {selectedEvents.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                                        <p className="text-gray-500">No events on this date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedEvents.map((event, idx) => (
                                            <div
                                                key={idx}
                                                className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
                                                    event.type === "task"
                                        ? "border-l-blue-500"
                                        : event.type === "leave"
                                        ? "border-l-orange-500"
                                        : event.type === "company_holiday"
                                        ? "border-l-green-500"
                                        : event.type === "department_event"
                                        ? "border-l-purple-500"
                                        : event.type === "important_date"
                                        ? "border-l-yellow-500"
                                        : "border-l-indigo-500"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`p-2 rounded-lg ${
                                                            event.type === "task"
                                                ? "bg-blue-100"
                                                : event.type === "leave"
                                                ? "bg-orange-100"
                                                : event.type === "company_holiday"
                                                ? "bg-green-100"
                                                : event.type === "department_event"
                                                ? "bg-purple-100"
                                                : event.type === "important_date"
                                                ? "bg-yellow-100"
                                                : "bg-indigo-100"
                                                        }`}
                                                    >
                                                        <Svg
                                                            d={
                                                                event.type === "task"
                                                                    ? ICONS.task
                                                                    : event.type === "leave"
                                                                    ? ICONS.leave
                                                                    : ICONS.meeting
                                                            }
                                                            className={`w-5 h-5 ${
                                                                event.type === "task"
                                                    ? "text-blue-600"
                                                    : event.type === "leave"
                                                    ? "text-orange-600"
                                                    : event.type === "company_holiday"
                                                    ? "text-green-600"
                                                    : event.type === "department_event"
                                                    ? "text-purple-600"
                                                    : event.type === "important_date"
                                                    ? "text-yellow-600"
                                                    : "text-indigo-600"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                                                        {event.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                        )}
                                                        {event.location && (
                                                            <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                                                        )}
                                                        {event.time && (
                                                            <p className="text-sm text-gray-500">🕐 {event.time}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    event.status === "completed"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : event.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : event.status === "approved"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : event.status === "rejected"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : event.status === "scheduled"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                                }`}
                                                            >
                                                                {event.status || "Pending"}
                                                            </span>
                                                            {event.type && (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    event.type === "task"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : event.type === "leave"
                                                                        ? "bg-orange-100 text-orange-700"
                                                                        : event.type === "company_holiday"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : event.type === "department_event"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : event.type === "important_date"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-indigo-100 text-indigo-700"
                                                                }`}>
                                                                    {event.type.replace(/_/g, " ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mt-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-gray-700">Tasks with deadlines</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-sm text-gray-700">Leave requests</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                            <span className="text-sm text-gray-700">Meetings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-gray-700">Company holidays</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span className="text-sm text-gray-700">Department events</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-sm text-gray-700">Important dates</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar_View;
