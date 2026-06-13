import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import API from "../../services/api";
import Loader from "../../components/common/Loader";

const ManageTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            const { data } = await API.get("/users");
            setUsers(data);
        } catch {
            setError("Failed to fetch users");
        }
    };

    const fetchTasks = async () => {
        try {
            const { data } = await API.get("/tasks/all");
            setTasks(data);
        } catch {
            setError("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.post("/tasks", { title, assignedTo });
            setTitle("");
            setAssignedTo("");
            fetchTasks();
        } catch {
            setError("Task creation failed");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTasks();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Manage Tasks</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Create Task */}
                    <form
                        onSubmit={handleCreate}
                        className="bg-white p-4 rounded shadow mb-6"
                    >
                        <h3 className="font-semibold mb-3">Create Task</h3>
                        <input
                            type="text"
                            placeholder="Task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="border p-2 mr-2"
                        />
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            required
                            className="border p-2 mr-2"
                        >
                            <option value="">Assign User</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                            Create
                        </button>
                    </form>

                    {/* Task List */}
                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white p-4 rounded shadow">
                            <table className="w-full border">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2 border">Title</th>
                                        <th className="p-2 border">Assigned To</th>
                                        <th className="p-2 border">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr key={task._id}>
                                            <td className="p-2 border">{task.title}</td>
                                            <td className="p-2 border">{task.assignedTo?.name || "N/A"}</td>
                                            <td className="p-2 border capitalize">{task.status}</td>
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

export default ManageTasks;
