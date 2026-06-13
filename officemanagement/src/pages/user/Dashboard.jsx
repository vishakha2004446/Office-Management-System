import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import API from "../../services/api";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ path }) => (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// filled circle icons for approved / rejected (matches image)
const SvgFill = ({ path }) => (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d={path} />
    </svg>
);

// dedicated approved icon — white circle outline + checkmark inside
const ApprovedIcon = () => (
    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// dedicated rejected icon — white circle outline + X inside
const RejectedIcon = () => (
    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);

const PATHS = {
    tasks:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    present:  "M5 13l4 4L19 7",
    absent:   "M6 18L18 6M6 6l12 12",
    leave:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    pending:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    // filled paths for check-circle and x-circle
    approved: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    rejected: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
};

// ── stat card — white bordered card, icon square left, label+number right ─────
const StatCard = ({ label, value, iconKey, iconBg, filled, customIcon, loading }) => (
    <div className="flex items-center bg-white border border-gray-300 overflow-hidden">
        {/* coloured icon square — full height of card */}
        <div className={`self-stretch w-16 flex items-center justify-center shrink-0 ${iconBg}`}>
            {customIcon
                ? customIcon
                : filled
                    ? <SvgFill path={PATHS[iconKey]} />
                    : <Svg path={PATHS[iconKey]} />
            }
        </div>
        {/* text */}
        <div className="px-4 py-3">
            <p className="text-sm text-gray-600 leading-tight">{label}</p>
            {loading
                ? <div className="mt-1 h-6 w-8 bg-gray-100 rounded animate-pulse" />
                : <p className="text-xl font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
            }
        </div>
    </div>
);

// ── dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [taskStats,setTaskStats]  = useState(null);
    const [leaveStats, setLeaveStats]  = useState(null);
    const [attendanceStats,setAttendanceStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            API.get("/tasks/my-stats"),
            API.get("/leaves/count"),
            API.get("/attendance/my-stats"),
        ]).then(([t, l, a]) => {
            if (t.status === "fulfilled") setTaskStats(t.value.data);
            if (l.status === "fulfilled") setLeaveStats(l.value.data);
            if (a.status === "fulfilled") setAttendanceStats(a.value.data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            {/* page bg matches the light blue-gray in the image */}
            <div className="flex-1 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-8 max-w-4xl">

                    {/* ══ Dashboard Overview ══ */}
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        Dashboard Overview
                    </h2>

                    {/* 3 separate cards in a row */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <StatCard
                            label="Total Tasks"
                            value={taskStats?.totalTasks}
                            iconKey="tasks"
                            iconBg="bg-teal-500"
                            loading={loading}
                        />
                        <StatCard
                            label="Days Present"
                            value={attendanceStats?.presentDays}
                            iconKey="present"
                            iconBg="bg-amber-500"
                            loading={loading}
                        />
                        <StatCard
                            label="Days Absent"
                            value={attendanceStats?.absentDays}
                            iconKey="absent"
                            iconBg="bg-red-500"
                            loading={loading}
                        />
                    </div>

                    {/* ══ Leave Details ══ */}
                    <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
                        Leave Details
                    </h2>

                    {/* 2×2 grid — each card is independent */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            label="Leave Applied"
                            value={leaveStats?.total}
                            iconKey="leave"
                            iconBg="bg-teal-500"
                            loading={loading}
                        />
                        <StatCard
                            label="Leave Approved"
                            value={leaveStats?.approved}
                            iconKey="approved"
                            iconBg="bg-green-500"
                            customIcon={<ApprovedIcon />}
                            loading={loading}
                        />
                        <StatCard
                            label="Leave Pending"
                            value={leaveStats?.pending}
                            iconKey="pending"
                            iconBg="bg-amber-500"
                            loading={loading}
                        />
                        <StatCard
                            label="Leave Rejected"
                            value={leaveStats?.rejected}
                            iconKey="rejected"
                            iconBg="bg-red-500"
                            customIcon={<RejectedIcon />}
                            loading={loading}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
