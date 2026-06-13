import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    tasks: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    completed: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    dept: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    leave: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    attendance: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    pending: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, iconKey, topColor, iconBg, iconColor, valueColor, loading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`h-1 ${topColor}`} />
        <div className="p-5 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                {loading
                    ? <div className="h-8 w-14 bg-gray-100 rounded animate-pulse" />
                    : <p className={`text-3xl font-bold ${valueColor}`}>{value ?? "—"}</p>
                }
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
                <Svg d={ICONS[iconKey]} />
            </div>*
        </div>
    </div>
);

// ── status badge ──────────────────────────────────────────────────────────────
const LEAVE_STATUS = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100   text-red-700   border-red-200",
};

const Badge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${LEAVE_STATUS[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
    </span>
);

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

// ── dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [deptCount, setDeptCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            API.get("/tasks/stats"),
            API.get("/leaves"),
            API.get("/attendance/all"),
            API.get("/departments"),
        ]).then(([s, l, a, d]) => {
            if (s.status === "fulfilled") setStats(s.value.data);
            if (l.status === "fulfilled") setLeaves(l.value.data.slice(0, 5));
            if (a.status === "fulfilled") setAttendance(a.value.data.slice(0, 5));
            if (d.status === "fulfilled") setDeptCount(d.value.data.length);
            setLoading(false);
        });
    }, []);

    const pendingLeaves = leaves.filter(l => l.status === "pending").length;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-50 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

                    {/* ── stat cards ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Users" value={stats?.totalUsers} 
                        iconKey="users" topColor="bg-blue-500" iconBg="bg-blue-50" 
                        iconColor="text-blue-500" valueColor="text-blue-600" loading={loading} />
                        <StatCard label="Total Tasks" value={stats?.totalTasks} 
                        iconKey="tasks" topColor="bg-violet-500" iconBg="bg-violet-50" 
                        iconColor="text-violet-500" valueColor="text-violet-600" loading={loading} />
                        <StatCard label="Completed" value={stats?.completedTasks} 
                        iconKey="completed" topColor="bg-emerald-500" iconBg="bg-emerald-50" 
                        iconColor="text-emerald-500" valueColor="text-emerald-600" loading={loading} />
                        <StatCard label="Departments" value={deptCount} iconKey="dept" 
                        topColor="bg-amber-500" iconBg="bg-amber-50" iconColor="text-amber-500" valueColor="text-amber-600" loading={loading} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ── recent leave requests ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700">Recent Leave Requests</h3>
                                {pendingLeaves > 0 && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                        {pendingLeaves} pending
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                                </div>
                            ) : leaves.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">No leave requests yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                                <th className="px-3 py-2 text-left border border-gray-100">Employee</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">Type</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">From</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaves.map(l => (
                                                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 py-2.5 border border-gray-100 font-medium text-gray-800">{l.user?.name}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100 capitalize text-gray-600">{l.leaveType}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100 text-gray-500">{formatDate(l.startDate)}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100"><Badge status={l.status} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── recent attendance ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-700 mb-4">Recent Attendance</h3>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                                </div>
                            ) : attendance.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">No attendance records yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                                <th className="px-3 py-2 text-left border border-gray-100">Employee</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">Date</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">Check-In</th>
                                                <th className="px-3 py-2 text-left border border-gray-100">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map(a => (
                                                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-3 py-2.5 border border-gray-100 font-medium text-gray-800">{a.user?.name}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100 text-gray-500">{formatDate(a.date)}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100 text-green-600 font-medium">{formatTime(a.checkIn)}</td>
                                                    <td className="px-3 py-2.5 border border-gray-100">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize border
                                                            ${a.status === "present" ? "bg-green-100 text-green-700 border-green-200" :
                                                                a.status === "absent" ? "bg-red-100   text-red-700   border-red-200" :
                                                                    "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                                                        >
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
