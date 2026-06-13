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
    meeting: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    task: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    holiday: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    event: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    reminder: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    close: "M6 18L18 6M6 6l12 12",
    plus: "M12 4v16m8-8H4",
};

const CalendarAdmin = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "meeting",
        startDate: "",
        endDate: "",
        time: "",
        location: "",
        department: "",
        attendees: [],
        reminder: false,
        reminderDays: 1,
    });

    // Fetch events, departments, and users
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, deptsRes, usersRes] = await Promise.all([
                API.get("/events"),
                API.get("/departments"),
                API.get("/users/all"),
            ]);
            setEvents(eventsRes.data || []);
            setDepartments(deptsRes.data || []);
            setUsers(usersRes.data || []);
        } catch (err) {
            console.error("Data fetch error:", err);
            setError("Failed to load calendar data");
        } finally {
            setLoading(false);
        }
    };

    // Get events for selected date
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split("T")[0];
        return events.filter(event => {
            const eventStart = event.startDate.split("T")[0];
            const eventEnd = event.endDate.split("T")[0];
            return dateStr >= eventStart && dateStr <= eventEnd;
        });
    };

    const selectedEvents = getEventsForDate(selectedDate);

    // Get icon color by type
    const getEventColor = (type) => {
        const colors = {
            meeting: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
            task_deadline: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
            company_holiday: { bg: "bg-green-100", text: "text-green-600", dot: "bg-green-500" },
            department_event: { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500" },
            important_date: { bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-500" },
        };
        return colors[type] || colors.meeting;
    };

    // Custom tile content
    const getTileContent = ({ date }) => {
        const dateEvents = getEventsForDate(date);
        if (dateEvents.length === 0) return null;

        return (
            <div className="flex flex-col gap-0.5 text-xs mt-1">
                {dateEvents.slice(0, 2).map((event, idx) => (
                    <div key={idx} className={`px-1 py-0.5 rounded text-white text-[10px] truncate ${getEventColor(event.type).dot}`}>
                        {event.title.substring(0, 10)}...
                    </div>
                ))}
                {dateEvents.length > 2 && (
                    <div className="text-[10px] text-gray-500">+{dateEvents.length - 2}</div>
                )}
            </div>
        );
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle attendee selection
    const handleAttendeeChange = (userId) => {
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.includes(userId)
                ? prev.attendees.filter(id => id !== userId)
                : [...prev.attendees, userId],
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await API.put(`/events/${editingEvent._id}`, formData);
            } else {
                await API.post("/events", formData);
            }
            await fetchData();
            setShowModal(false);
            setFormData({
                title: "",
                description: "",
                type: "meeting",
                startDate: "",
                endDate: "",
                time: "",
                location: "",
                department: "",
                attendees: [],
                reminder: false,
                reminderDays: 1,
            });
            setEditingEvent(null);
        } catch (err) {
            console.error("Submit error:", err);
            setError("Failed to save event");
        }
    };

    // Edit event
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || "",
            type: event.type,
            startDate: event.startDate.split("T")[0],
            endDate: event.endDate.split("T")[0],
            time: event.time || "",
            location: event.location || "",
            department: event.department?._id || "",
            attendees: event.attendees.map(a => a._id) || [],
            reminder: event.reminder,
            reminderDays: event.reminderDays || 1,
        });
        setShowModal(true);
    };

    // Delete event
    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await API.delete(`/events/${eventId}`);
                await fetchData();
            } catch (err) {
                console.error("Delete error:", err);
                setError("Failed to delete event");
            }
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Calendar Management</h2>
                        <button
                            onClick={() => {
                                setEditingEvent(null);
                                setFormData({
                                    title: "",
                                    description: "",
                                    type: "meeting",
                                    startDate: "",
                                    endDate: "",
                                    time: "",
                                    location: "",
                                    department: "",
                                    attendees: [],
                                    reminder: false,
                                    reminderDays: 1,
                                });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Svg d={ICONS.plus} className="w-4 h-4" />
                            Add Event
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
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
                                        {selectedEvents.map((event) => {
                                            const colors = getEventColor(event.type);
                                            return (
                                                <div key={event._id} className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${colors.dot === "bg-blue-500" ? "border-l-blue-500" : colors.dot === "bg-red-500" ? "border-l-red-500" : colors.dot === "bg-green-500" ? "border-l-green-500" : colors.dot === "bg-purple-500" ? "border-l-purple-500" : "border-l-orange-500"}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                                                            <Svg d={ICONS[event.type.split("_")[0]] || ICONS.event} className={`w-5 h-5 ${colors.text}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-800">{event.title}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                            {event.location && (
                                                                <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                                                            )}
                                                            {event.time && (
                                                                <p className="text-sm text-gray-500">🕐 {event.time}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === "completed" ? "bg-green-100 text-green-700" : event.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                                                    {event.status}
                                                                </span>
                                                                {event.type && (
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                                                                        {event.type.replace("_", " ")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    onClick={() => handleEditEvent(event)}
                                                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEvent(event._id)}
                                                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Event Types</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-gray-700">Meetings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-sm text-gray-700">Task Deadlines</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-gray-700">Company Holidays</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span className="text-sm text-gray-700">Department Events</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-sm text-gray-700">Important Dates</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h3 className="text-xl font-semibold">
                                        {editingEvent ? "Edit Event" : "Create New Event"}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingEvent(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <Svg d={ICONS.close} className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Event Type *
                                            </label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="meeting">Meeting</option>
                                                <option value="task_deadline">Task Deadline</option>
                                                <option value="company_holiday">Company Holiday</option>
                                                <option value="department_event">Department Event</option>
                                                <option value="important_date">Important Date</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Department
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept._id} value={dept._id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="reminder"
                                                id="reminder"
                                                checked={formData.reminder}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                                                Set Reminder
                                            </label>
                                        </div>
                                    </div>

                                    {formData.reminder && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Remind (days before)
                                            </label>
                                            <input
                                                type="number"
                                                name="reminderDays"
                                                value={formData.reminderDays}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Attendees
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                            {users.map(user => (
                                                <div key={user._id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`attendee-${user._id}`}
                                                        checked={formData.attendees.includes(user._id)}
                                                        onChange={() => handleAttendeeChange(user._id)}
                                                        className="w-4 h-4"
                                                    />
                                                    <label htmlFor={`attendee-${user._id}`} className="ml-2 text-sm text-gray-700">
                                                        {user.name} ({user.email})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditingEvent(null);
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            {editingEvent ? "Update Event" : "Create Event"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarAdmin;
