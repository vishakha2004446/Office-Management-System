import { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [users,       setUsers]       = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState("");
    const [success,     setSuccess]     = useState("");

    // create form
    const [newDeptName, setNewDeptName] = useState("");
    const [creating,    setCreating]    = useState(false);

    // assign form
    const [selUser, setSelUser] = useState("");
    const [selDept, setSelDept] = useState("");
    const [assigning, setAssigning] = useState(false);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const [dRes, uRes] = await Promise.all([
                API.get("/departments"),
                API.get("/users"),
            ]);
            setDepartments(dRes.data);
            setUsers(uRes.data);
        } catch {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const flash = (msg, type = "success") => {
        if (type === "success") setSuccess(msg);
        else setError(msg);
        setTimeout(() => { setSuccess(""); setError(""); }, 3500);
    };

    // ── create department ─────────────────────────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;
        setCreating(true);
        try {
            await API.post("/departments", { name: newDeptName.trim() });
            setNewDeptName("");
            flash("Department created successfully!");
            fetchAll();
        } catch (err) {
            flash(err.response?.data?.message || "Failed to create department", "error");
        } finally {
            setCreating(false);
        }
    };

    // ── delete department ─────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this department? Users assigned to it will be unassigned.")) return;
        try {
            await API.delete(`/departments/${id}`);
            flash("Department deleted.");
            fetchAll();
        } catch {
            flash("Failed to delete department", "error");
        }
    };

    // ── assign department ─────────────────────────────────────────────────────
    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selUser) return;
        setAssigning(true);
        try {
            await API.put(`/users/${selUser}/department`, {
                departmentId: selDept || null,
            });
            flash("Department assigned successfully!");
            setSelUser("");
            setSelDept("");
            fetchAll();
        } catch (err) {
            flash(err.response?.data?.message || "Assignment failed", "error");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Departments</h2>

                    {/* feedback */}
                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
                    )}

                    {loading ? <Loader /> : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* ── left col ── */}
                            <div className="space-y-6">

                                {/* Create department */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-semibold text-gray-700 mb-4">Create Department</h3>
                                    <form onSubmit={handleCreate} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            placeholder="Department name"
                                            required
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={creating}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {creating ? "Adding..." : "Add"}
                                        </button>
                                    </form>
                                </div>

                                {/* Department list */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-semibold text-gray-700 mb-4">
                                        All Departments
                                        <span className="ml-2 text-xs font-normal text-gray-400">({departments.length})</span>
                                    </h3>

                                    {departments.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-6">No departments yet.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {departments.map((dept) => {
                                                const memberCount = users.filter(
                                                    (u) => u.department?._id === dept._id || u.department === dept._id
                                                ).length;
                                                return (
                                                    <li key={dept._id}
                                                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{dept.name}</p>
                                                                <p className="text-xs text-gray-400">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(dept._id)}
                                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* ── right col ── */}
                            <div className="space-y-6">

                                {/* Assign department */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-semibold text-gray-700 mb-4">Assign Department to User</h3>
                                    <form onSubmit={handleAssign} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Select User</label>
                                            <select
                                                value={selUser}
                                                onChange={(e) => setSelUser(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">— Choose a user —</option>
                                                {users.filter(u => u.role === "user").map((u) => (
                                                    <option key={u._id} value={u._id}>
                                                        {u.name} {u.department?.name ? `(${u.department.name})` : "(unassigned)"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Select Department</label>
                                            <select
                                                value={selDept}
                                                onChange={(e) => setSelDept(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">— Remove department —</option>
                                                {departments.map((d) => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={assigning || !selUser}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {assigning ? "Assigning..." : "Assign Department"}
                                        </button>
                                    </form>
                                </div>

                                {/* Users with departments */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-semibold text-gray-700 mb-4">User — Department Map</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                                                    <th className="px-3 py-2 border border-gray-100">User</th>
                                                    <th className="px-3 py-2 border border-gray-100">Email</th>
                                                    <th className="px-3 py-2 border border-gray-100">Department</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.filter(u => u.role === "user").map((u) => (
                                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-3 py-2.5 border border-gray-100 font-medium text-gray-800">{u.name}</td>
                                                        <td className="px-3 py-2.5 border border-gray-100 text-gray-500">{u.email}</td>
                                                        <td className="px-3 py-2.5 border border-gray-100">
                                                            {u.department?.name
                                                                ? <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">{u.department.name}</span>
                                                                : <span className="text-gray-400 text-xs italic">Unassigned</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default ManageDepartments;
