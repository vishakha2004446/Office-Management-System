import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────

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

const TYPE_LABELS = {
    sick: "Sick",
    casual: "Casual",
    annual: "Annual",
    other: "Other",
};

// ── status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100  text-green-700  border-green-200",
    rejected: "bg-red-100    text-red-700    border-red-200",
};

const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
    </span>
);

// ── main component ────────────────────────────────────────────────────────────

const ManageLeaves = () => {
    const [leaves,  setLeaves]  = useState([]);
    const [filter,  setFilter]  = useState("all");
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    // Modal state
    const [modal,   setModal]   = useState(null);   // { leave, action: 'approved'|'rejected' }
    const [comment, setComment] = useState("");
    const [saving,  setSaving]  = useState(false);

    // ── fetch ─────────────────────────────────────────────────────────────────

    const fetchLeaves = useCallback(async () => {
        try {
            const { data } = await API.get("/leaves");
            setLeaves(data);
        } catch {
            setError("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    // ── approve / reject ──────────────────────────────────────────────────────

    const openModal = (leave, action) => {
        setModal({ leave, action });
        setComment("");
    };

    const closeModal = () => {
        setModal(null);
        setComment("");
    };

    const handleDecision = async () => {
        if (!modal) return;
        setSaving(true);
        try {
            await API.put(`/leaves/${modal.leave._id}`, {
                status: modal.action,
                adminComment: comment,
            });
            closeModal();
            fetchLeaves();
        } catch (err) {
            setError(err.response?.data?.message || "Action failed");
        } finally {
            setSaving(false);
        }
    };

    // ── counts for filter tabs ────────────────────────────────────────────────

    const counts = {
        all:      leaves.length,
        pending:  leaves.filter((l) => l.status === "pending").length,
        approved: leaves.filter((l) => l.status === "approved").length,
        rejected: leaves.filter((l) => l.status === "rejected").length,
    };

    const filtered = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Leave Management</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">

                            {/* Summary strip */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Total",    key: "all",      colour: "text-blue-600",   bg: "bg-blue-50"   },
                                    { label: "Pending",  key: "pending",  colour: "text-yellow-600", bg: "bg-yellow-50" },
                                    { label: "Approved", key: "approved", colour: "text-green-600",  bg: "bg-green-50"  },
                                    { label: "Rejected", key: "rejected", colour: "text-red-600",    bg: "bg-red-50"    },
                                ].map(({ label, key, colour, bg }) => (
                                    <div key={key} className={`${bg} rounded-lg p-3 text-center border`}>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                                        <p className={`text-2xl font-bold ${colour}`}>{counts[key]}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Filter tabs */}
                            <div className="flex gap-2 flex-wrap mb-5">
                                {["all", "pending", "approved", "rejected"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize border transition-colors
                                            ${filter === tab
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-500"
                                            }`}
                                    >
                                        {tab === "all" ? `All (${counts.all})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${counts[tab]})`}
                                    </button>
                                ))}
                            </div>

                            {/* Table */}
                            {filtered.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">
                                    No {filter !== "all" ? filter : ""} leave requests found.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-left text-gray-600">
                                                <th className="px-4 py-3 border">Employee</th>
                                                <th className="px-4 py-3 border">Type</th>
                                                <th className="px-4 py-3 border">From</th>
                                                <th className="px-4 py-3 border">To</th>
                                                <th className="px-4 py-3 border">Days</th>
                                                <th className="px-4 py-3 border">Reason</th>
                                                <th className="px-4 py-3 border">Status</th>
                                                <th className="px-4 py-3 border">Comment</th>
                                                <th className="px-4 py-3 border text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((leave) => (
                                                <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 border">
                                                        <p className="font-medium text-gray-800">{leave.user?.name}</p>
                                                        <p className="text-xs text-gray-400">{leave.user?.email}</p>
                                                    </td>
                                                    <td className="px-4 py-3 border text-gray-700">
                                                        {TYPE_LABELS[leave.leaveType] || leave.leaveType}
                                                    </td>
                                                    <td className="px-4 py-3 border text-gray-600">{formatDate(leave.startDate)}</td>
                                                    <td className="px-4 py-3 border text-gray-600">{formatDate(leave.endDate)}</td>
                                                    <td className="px-4 py-3 border text-center font-medium text-gray-700">
                                                        {daysBetween(leave.startDate, leave.endDate)}
                                                    </td>
                                                    <td className="px-4 py-3 border text-gray-600 max-w-xs">
                                                        <span className="line-clamp-2">{leave.reason}</span>
                                                    </td>
                                                    <td className="px-4 py-3 border">
                                                        <StatusBadge status={leave.status} />
                                                    </td>
                                                    <td className="px-4 py-3 border text-gray-500 italic text-xs">
                                                        {leave.adminComment || "—"}
                                                    </td>
                                                    <td className="px-4 py-3 border text-center">
                                                        {leave.status === "pending" ? (
                                                            <div className="flex gap-2 justify-center">
                                                                <button
                                                                    onClick={() => openModal(leave, "approved")}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => openModal(leave, "rejected")}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Modal ── */}
            {modal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {modal.action === "approved" ? "Approve Leave" : "Reject Leave"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {modal.leave.user?.name} — {TYPE_LABELS[modal.leave.leaveType]} &nbsp;
                            ({formatDate(modal.leave.startDate)} → {formatDate(modal.leave.endDate)})
                        </p>

                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Comment{modal.action === "rejected" && <span className="text-red-500"> *</span>}
                            {modal.action === "approved" && <span className="text-gray-400 font-normal"> (optional)</span>}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder={modal.action === "rejected" ? "Provide a reason for rejection..." : "Add a note (optional)..."}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-5"
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDecision}
                                disabled={saving || (modal.action === "rejected" && !comment.trim())}
                                className={`px-5 py-2 rounded text-white font-medium transition-colors disabled:opacity-60
                                    ${modal.action === "approved"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                {saving ? "Saving..." : modal.action === "approved" ? "Confirm Approve" : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLeaves;
