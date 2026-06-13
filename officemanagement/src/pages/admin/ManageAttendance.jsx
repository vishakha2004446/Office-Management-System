import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const calcHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "—";
    const diff = (new Date(checkOut) - new Date(checkIn)) / 1000 / 60;
    const h = Math.floor(diff / 60);
    const m = Math.floor(diff % 60);
    return `${h}h ${m}m`;
};

const STATUS_STYLES = {
    present:  "bg-green-100 text-green-700",
    absent:   "bg-red-100   text-red-700",
    "half-day": "bg-yellow-100 text-yellow-700",
};

// ── main component ────────────────────────────────────────────────────────────

const ManageAttendance = () => {
    const [records,  setRecords]  = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");

    // Filter state
    const [search,     setSearch]     = useState("");   // filter by employee name
    const [dateFilter, setDateFilter] = useState("");   // filter by date YYYY-MM-DD

    // ── fetch ─────────────────────────────────────────────────────────────────

    const fetchRecords = useCallback(async () => {
        try {
            const { data } = await API.get("/attendance/all");
            setRecords(data);
            setFiltered(data);
        } catch {
            setError("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    // ── client-side filtering ─────────────────────────────────────────────────

    useEffect(() => {
        let result = records;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.user?.name?.toLowerCase().includes(q) ||
                    r.user?.email?.toLowerCase().includes(q)
            );
        }

        if (dateFilter) {
            result = result.filter((r) => r.date === dateFilter);
        }

        setFiltered(result);
    }, [search, dateFilter, records]);

    // ── summary counts ────────────────────────────────────────────────────────

    const totalPresent  = filtered.filter((r) => r.status === "present").length;
    const totalAbsent   = filtered.filter((r) => r.status === "absent").length;
    const totalHalfDay  = filtered.filter((r) => r.status === "half-day").length;

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Attendance Records</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {/* Summary strip */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <SummaryCard label="Total Records" value={filtered.length} colour="text-blue-600"   bg="bg-blue-50"   />
                                <SummaryCard label="Present"       value={totalPresent}    colour="text-green-600"  bg="bg-green-50"  />
                                <SummaryCard label="Absent"        value={totalAbsent}     colour="text-red-600"    bg="bg-red-50"    />
                                <SummaryCard label="Half Day"      value={totalHalfDay}    colour="text-yellow-600" bg="bg-yellow-50" />
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Search by employee name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                />
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                />
                                {(search || dateFilter) && (
                                    <button
                                        onClick={() => { setSearch(""); setDateFilter(""); }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-lg shadow p-6">
                                {filtered.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10">
                                        No attendance records found.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-gray-100 text-left text-gray-600">
                                                    <th className="px-4 py-3 border">Employee</th>
                                                    <th className="px-4 py-3 border">Date</th>
                                                    <th className="px-4 py-3 border">Check-In</th>
                                                    <th className="px-4 py-3 border">Check-Out</th>
                                                    <th className="px-4 py-3 border">Hours Worked</th>
                                                    <th className="px-4 py-3 border">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((record) => (
                                                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 border">
                                                            <p className="font-medium text-gray-800">{record.user?.name}</p>
                                                            <p className="text-xs text-gray-400">{record.user?.email}</p>
                                                        </td>
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
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"}`}>
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

const SummaryCard = ({ label, value, colour, bg }) => (
    <div className={`${bg} rounded-lg p-4 text-center border`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colour}`}>{value}</p>
    </div>
);

export default ManageAttendance;
