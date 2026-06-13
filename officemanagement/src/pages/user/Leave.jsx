import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// ── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const daysBetween = (start, end) => {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff) + 1);
};

// ── status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100  text-green-700  border-green-200",
    rejected: "bg-red-100    text-red-700    border-red-200",
};

const StatusBadge = ({ status }) => (
    <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}
    >
        {status}
    </span>
);

// ── leave type label ──────────────────────────────────────────────────────────

const TYPE_LABELS = {
    sick:    "Sick Leave",
    casual:  "Casual Leave",
    annual:  "Annual Leave",
    other:   "Other",
};

// ── main component ────────────────────────────────────────────────────────────

const Leave = () => {
    const [leaves,  setLeaves]  = useState([]);
    const [counts,  setCounts]  = useState(null);
    const [filter,  setFilter]  = useState("all");   // all | pending | approved | rejected
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error,   setError]   = useState("");
    const [success, setSuccess] = useState("");

    // Apply-leave form state
    const [form, setForm] = useState({
        leaveType: "sick",
        startDate: "",
        endDate:   "",
        reason:    "",
    });

    // ── fetch ───────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        try {
            const [leavesRes, countRes] = await Promise.all([
                API.get("/leaves/my"),
                API.get("/leaves/count"),
            ]);
            setLeaves(leavesRes.data);
            setCounts(countRes.data);
        } catch {
            setError("Failed to load leave data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── apply leave ─────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (new Date(form.endDate) < new Date(form.startDate)) {
            return setError("End date cannot be before start date");
        }

        try {
            setSubmitting(true);
            await API.post("/leaves", form);
            setSuccess("Leave application submitted successfully!");
            setForm({ leaveType: "sick", startDate: "", endDate: "", reason: "" });
            fetchData();
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit leave");
        } finally {
            setSubmitting(false);
        }
    };

    // ── filtered list ────────────────────────────────────────────────────────

    const filtered = filter === "all"
        ? leaves
        : leaves.filter((l) => l.status === filter);

    // ── render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Leave Management</h2>

                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {/* ── feedback banners ── */}
                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded">
                                    {success}
                                </div>
                            )}

                            {/* ── summary cards ── */}
                            {counts && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <SummaryCard label="Total Applied" value={counts.total}    colour="text-blue-600"   bg="bg-blue-50"   />
                                    <SummaryCard label="Pending"       value={counts.pending}  colour="text-yellow-600" bg="bg-yellow-50" />
                                    <SummaryCard label="Approved"      value={counts.approved} colour="text-green-600"  bg="bg-green-50"  />
                                    <SummaryCard label="Rejected"      value={counts.rejected} colour="text-red-600"    bg="bg-red-50"    />
                                </div>
                            )}

                            {/* ── apply leave form ── */}
                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Apply for Leave
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                        {/* Leave type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Leave Type
                                            </label>
                                            <select
                                                value={form.leaveType}
                                                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="sick">Sick Leave</option>
                                                <option value="casual">Casual Leave</option>
                                                <option value="annual">Annual Leave</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Start date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={form.startDate}
                                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* End date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={form.endDate}
                                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Reason
                                        </label>
                                        <textarea
                                            value={form.reason}
                                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="Briefly describe the reason for your leave..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded font-medium transition-colors"
                                    >
                                        {submitting ? "Submitting..." : "Submit Application"}
                                    </button>
                                </form>
                            </div>

                            {/* ── leave history ── */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        My Leave Applications
                                    </h3>

                                    {/* Status filter tabs */}
                                    <div className="flex gap-2 flex-wrap">
                                        {["all", "pending", "approved", "rejected"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setFilter(tab)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors border
                                                    ${filter === tab
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-500"
                                                    }`}
                                            >
                                                {tab === "all" ? `All (${leaves.length})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${counts?.[tab] ?? 0})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filtered.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No {filter !== "all" ? filter : ""} leave applications found.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-gray-100 text-left text-gray-600">
                                                    <th className="px-4 py-3 border">Type</th>
                                                    <th className="px-4 py-3 border">From</th>
                                                    <th className="px-4 py-3 border">To</th>
                                                    <th className="px-4 py-3 border">Days</th>
                                                    <th className="px-4 py-3 border">Reason</th>
                                                    <th className="px-4 py-3 border">Status</th>
                                                    <th className="px-4 py-3 border">Admin Comment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((leave) => (
                                                    <tr
                                                        key={leave._id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 border font-medium text-gray-700">
                                                            {TYPE_LABELS[leave.leaveType] || leave.leaveType}
                                                        </td>
                                                        <td className="px-4 py-3 border text-gray-600">
                                                            {formatDate(leave.startDate)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-gray-600">
                                                            {formatDate(leave.endDate)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-center text-gray-700 font-medium">
                                                            {daysBetween(leave.startDate, leave.endDate)}
                                                        </td>
                                                        <td className="px-4 py-3 border text-gray-600 max-w-xs">
                                                            <span className="line-clamp-2">{leave.reason}</span>
                                                        </td>
                                                        <td className="px-4 py-3 border">
                                                            <StatusBadge status={leave.status} />
                                                        </td>
                                                        <td className="px-4 py-3 border text-gray-500 italic">
                                                            {leave.adminComment || "—"}
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

// ── summary card ──────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, colour, bg }) => (
    <div className={`${bg} rounded-lg p-4 text-center border`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-3xl font-bold ${colour}`}>{value}</p>
    </div>
);

export default Leave;
