import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import API from "../../services/api";
import Loader from "../../components/common/Loader";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            const { data } = await API.get("/users");
            setUsers(data);
        } catch {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/users/${id}`);
            fetchUsers();
        } catch {
            setError("Delete failed");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white p-4 rounded shadow">
                            <table className="w-full border">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Email</th>
                                        <th className="p-2 border">Role</th>
                                        <th className="p-2 border">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="p-2 border">{user.name}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border capitalize">{user.role}</td>
                                            <td className="p-2 border text-center">
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
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
    );
};

export default ManageUsers;
